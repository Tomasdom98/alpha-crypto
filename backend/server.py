from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import aiohttp
import asyncio
import resend
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# =============================================================================
# EMAIL SERVICE - Resend configuration
# =============================================================================
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'tomdomingueclaro@gmail.com')

# Initialize Resend if API key is available
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

async def send_notification_email(subject: str, html_content: str, to_email: str = None):
    """Send email notification using Resend (non-blocking)"""
    if not RESEND_API_KEY:
        logging.warning("Resend API key not configured - email not sent")
        return None
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [to_email or ADMIN_EMAIL],
            "subject": subject,
            "html": html_content
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Email sent successfully: {subject}")
        return result
    except Exception as e:
        logging.error(f"Failed to send email: {e}")
        return None

# =============================================================================
# API CACHE SYSTEM - Reduces external API calls to prevent rate limiting
# =============================================================================
class APICache:
    """Simple in-memory cache with TTL for API responses"""
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._timestamps: Dict[str, datetime] = {}
        self._lock = asyncio.Lock()
    
    async def get(self, key: str, ttl_seconds: int = 120) -> Optional[Any]:
        """Get cached value if not expired"""
        async with self._lock:
            if key in self._cache:
                cached_time = self._timestamps.get(key)
                if cached_time and (datetime.now(timezone.utc) - cached_time).total_seconds() < ttl_seconds:
                    return self._cache[key]
                # Expired - remove from cache
                self._cache.pop(key, None)
                self._timestamps.pop(key, None)
            return None
    
    async def set(self, key: str, value: Any) -> None:
        """Store value in cache with current timestamp"""
        async with self._lock:
            self._cache[key] = value
            self._timestamps[key] = datetime.now(timezone.utc)
    
    async def clear(self, key: str = None) -> None:
        """Clear specific key or all cache"""
        async with self._lock:
            if key:
                self._cache.pop(key, None)
                self._timestamps.pop(key, None)
            else:
                self._cache.clear()
                self._timestamps.clear()

# Initialize global cache instance
api_cache = APICache()

# Cache TTL settings (in seconds)
CACHE_TTL_CRYPTO_PRICES = 60   # 1 minute - CoinCap has no rate limits
CACHE_TTL_FEAR_GREED = 300     # 5 minutes - this data doesn't change often
CACHE_TTL_COINGECKO = 600      # 10 minutes - CoinGecko has strict rate limits
# =============================================================================

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Models
class CryptoPrice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    symbol: str
    name: str
    current_price: float
    price_change_24h: float
    market_cap: float
    volume_24h: float

class FearGreedIndex(BaseModel):
    value: int
    classification: str
    timestamp: str

class Article(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    excerpt: str
    content: str
    category: str
    premium: bool = False
    published_at: str
    image_url: str
    tags: Optional[List[str]] = None
    read_time: Optional[str] = None

class AirdropTask(BaseModel):
    id: str
    description: str
    completed: bool = False

class Airdrop(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    project_name: str
    logo_url: str
    description: str
    full_description: Optional[str] = None
    backing: Optional[str] = None
    chain: Optional[str] = None
    timeline: Optional[str] = None
    reward_note: Optional[str] = None
    tasks: List[AirdropTask]
    estimated_reward: str
    difficulty: Optional[str] = None
    deadline: str
    status: str
    link: str
    premium: bool = False

class MarketIndex(BaseModel):
    name: str
    value: float
    change_24h: float

class FeedbackSubmission(BaseModel):
    name: str
    email: str
    message: str

class Feedback(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    message: str
    created_at: str
    read: bool = False

class ConsultingSubmission(BaseModel):
    name: str
    email: str
    company: Optional[str] = None
    message: str
    service_type: str  # personal or business

class ConsultingRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    company: Optional[str] = None
    message: str
    service_type: str
    created_at: str
    status: str = "new"  # new, contacted, completed

class EmailAlertSubscription(BaseModel):
    email: str

class PaymentSubmission(BaseModel):
    email: str
    wallet_address: str
    chain: str
    tx_hash: Optional[str] = None
    amount: float

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: str
    wallet_address: str
    is_premium: bool = False
    premium_until: Optional[str] = None
    payment_chain: str
    created_at: str

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_email: str
    amount: float
    chain: str
    tx_hash: Optional[str] = None
    status: str  # pending, verified, rejected
    created_at: str


# Mock data generators
def get_mock_crypto_prices():
    # Updated mock prices - these are displayed when CoinGecko API is rate-limited
    # Note: CoinGecko free tier has strict rate limits
    return [
        {
            "id": "bitcoin",
            "symbol": "BTC",
            "name": "Bitcoin",
            "current_price": 97250.00,
            "price_change_24h": 1.85,
            "market_cap": 1920000000000,
            "volume_24h": 42500000000
        },
        {
            "id": "ethereum",
            "symbol": "ETH",
            "name": "Ethereum",
            "current_price": 3680.50,
            "price_change_24h": 2.15,
            "market_cap": 443000000000,
            "volume_24h": 18200000000
        },
        {
            "id": "solana",
            "symbol": "SOL",
            "name": "Solana",
            "current_price": 198.45,
            "price_change_24h": 3.25,
            "market_cap": 96000000000,
            "volume_24h": 4800000000
        },
        {
            "id": "usd-coin",
            "symbol": "USDC",
            "name": "USD Coin",
            "current_price": 1.00,
            "price_change_24h": 0.01,
            "market_cap": 42000000000,
            "volume_24h": 8100000000
        }
    ]

def get_mock_articles():
    return [
        {
            "id": "1",
            "title": "Stablecoins: $300B y Contando... La Revolución Ya Llegó",
            "excerpt": "$46 trillones en transacciones anuales. Los stablecoins ya procesan más que Visa y Mastercard combinadas. Aquí está la data que necesitas saber.",
            "category": "Stablecoins",
            "tags": ["USDC", "USDT", "Pagos", "Remesas"],
            "read_time": "6 min",
            "premium": False,
            "published_at": "2026-02-05T10:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800",
            "content": """GM. Esta es Alpha Crypto, tu newsletter de inteligencia cripto. Hoy hablamos del elefante en la habitación que nadie puede ignorar.

---

## LOS NÚMEROS QUE IMPORTAN

Las stablecoins dejaron de ser "cripto" para convertirse en infraestructura financiera global. Mira estos números:

| Métrica | 2024 | 2025 | Cambio |
|---------|------|------|--------|
| Market Cap | $170B | $300B+ | +76% |
| Volumen Anual | $12T | $46T | +283% |
| Usuarios Activos | 25M | 46.7M | +87% |
| Países con Usuarios | 70 | 106 | +51% |

**El dato que vuela cabezas:** Las stablecoins procesaron $46 TRILLONES en 2025. Eso es más que Visa y Mastercard COMBINADAS.

---

## ADOPCIÓN GLOBAL: LATAM LIDERA

Los países con mayor adopción de stablecoins (2025):

1. **India** - #1 global
2. **Estados Unidos** - #2
3. **Pakistán** - #3
4. **Filipinas** - #4
5. **Brasil** - #5

**Argentina (#18), México (#19), Venezuela (#11)** - LATAM está en el mapa. Las remesas con stablecoins cuestan 80% menos que Western Union.

---

## ¿POR QUÉ ESTÁ PASANDO ESTO?

**1. Regulación Clara**
- EE.UU: GENIUS Act aprobado
- Europa: MiCAR implementado
- Japón y Singapur: Marcos legales claros

**2. Adopción Institucional**
- Interactive Brokers integró stablecoins
- BlackRock y Franklin Templeton usan USDC
- Worldpay procesa pagos con stables

**3. Casos de Uso Reales**
- Remesas: 80% más baratas
- Pagos B2B: Settlement instantáneo
- Gaming: Pagos en tiempo real
- Payroll: Gusto paga contractors con stables

---

## USDC vs USDT: LA BATALLA

| | USDC | USDT |
|--|------|------|
| Market Cap | $74B | $140B+ |
| Volumen 30d | $6.5T | $1.6T |
| Chains | 30 | 15+ |
| Uso Principal | Institucional | Retail global |

**El insight:** USDC mueve 4x más valor diario que USDT, pero USDT tiene más usuarios. USDC es el "settlement layer", USDT es la "moneda del pueblo".

---

## ¿CÓMO APROVECHAR ESTA TENDENCIA?

**Para inversores:**
1. **Infraestructura**: ETH, SOL, TRX (las chains donde corren los stables)
2. **DeFi Yields**: Aave, Compound ofrecen 4-8% APR en stables
3. **Circle**: Si sale a bolsa, es la jugada obvia

**Para usuarios:**
- Usa stablecoins para remesas (ahorra 80%+)
- Mantén ahorros en USDC en lugar de cuenta de banco (acceso global)
- Explora yields en DeFi (pero DYOR)

---

## PREDICCIÓN 2026

> "Los stablecoins se convertirán en infraestructura invisible. Estarán en todas partes pero nadie los verá."
> — ZeroHash Report 2026

El market cap podría alcanzar **$500B** para fin de 2026. Las stablecoins no son el futuro. **Son el presente.** 🦉"""
        },
        {
            "id": "2",
            "title": "AI Agents: Las Máquinas Ya Tienen Wallets... y Están Gastando",
            "excerpt": "El protocolo x402, Ethereum como backbone, y cómo los agentes de IA están creando una economía de $100B para 2030.",
            "category": "AI",
            "tags": ["Inteligencia Artificial", "x402", "Ethereum", "Automatización"],
            "read_time": "5 min",
            "premium": False,
            "published_at": "2026-02-03T15:30:00Z",
            "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
            "content": """GM. ¿Qué pasaría si tu IA pudiera pagar sus propias facturas? Ya está pasando.

---

## ¿QUÉ SON LOS AI AGENTS EN CRYPTO?

Imagina un bot que:
- Tiene su propia wallet
- Puede recibir y enviar pagos
- Opera 24/7 sin intervención humana
- Toma decisiones financieras autónomas

**Eso es un AI Agent.** Y están multiplicándose.

---

## EL PROTOCOLO x402: HTTP CON PAGOS

El x402 es como HTTP pero con pagos nativos. Funciona así:

```
Usuario pide servicio → AI Agent cotiza → Pago automático → Servicio entregado
```

**Sin intermediarios. Sin fricción. Sin humanos.**

Ejemplo real: Un AI Agent que necesita procesar datos puede automáticamente:
1. Buscar el proveedor más barato
2. Negociar precio
3. Pagar en crypto
4. Recibir el servicio

Todo en segundos.

---

## NÚMEROS QUE IMPORTAN

| Métrica | 2025 | 2030 (Proyección) |
|---------|------|-------------------|
| AI Agents con wallets | 50K+ | 10M+ |
| Transacciones M2M | $1B | $100B+ |
| % de txs crypto por AIs | 2% | 15%+ |

---

## PROYECTOS EN EL RADAR

**Tier 1 - Ya funcionando:**
- **Autonolas** - Framework para agentes autónomos
- **Fetch.ai (FET)** - Red de agentes económicos
- **SingularityNET (AGIX)** - Marketplace de IA

**Tier 2 - Emergentes:**
- **Morpheus** - Red descentralizada de AI agents
- **ChainGPT** - IA especializada en blockchain
- **Ocean Protocol** - Mercado de datos para IA

---

## ¿POR QUÉ ESTO IMPORTA?

**La economía M2M (Machine-to-Machine) es el próximo salto.**

Piénsalo:
- IoT devices: 75 billones para 2025
- AI services: $200B mercado
- Micropagos: Imposibles con rails tradicionales

**Crypto es la ÚNICA infraestructura que puede manejar billones de micropagos entre máquinas.**

---

## RIESGOS A CONSIDERAR

- **Regulación**: ¿Quién es responsable si una IA comete fraude?
- **Seguridad**: Smart contracts con bugs = dinero perdido
- **Concentración**: ¿Pocas corporaciones controlarán los agents?

---

## CÓMO POSICIONARSE

**Conservador:**
- ETH (backbone de AI agents)
- LINK (oráculos para datos de IA)

**Moderado:**
- FET, AGIX (tokens de infraestructura AI)
- Autonolas ecosystem

**Agresivo:**
- AI agent tokens tempranos
- Protocolos de datos descentralizados

---

## PREDICCIÓN

> Para 2030, el 15% de todas las transacciones crypto serán ejecutadas por máquinas, no humanos.

La economía agentic no es ciencia ficción. **Es la próxima frontera.** 🦉"""
        },
        {
            "id": "3",
            "title": "Estado del Mercado Crypto 2026: Lo Que Necesitas Saber",
            "excerpt": "BTC a $70K, ETFs con $50B+, y el halving haciendo lo suyo. Aquí está el panorama completo.",
            "category": "Mercado",
            "tags": ["Bitcoin", "ETFs", "Regulación", "Análisis"],
            "read_time": "7 min",
            "premium": False,
            "published_at": "2026-02-01T09:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800",
            "content": """GM. Es febrero 2026 y el mercado está en un momento crucial. Te traemos el análisis completo.

---

## SNAPSHOT DEL MERCADO

| Métrica | Valor Actual |
|---------|--------------|
| BTC Price | ~$70,000 |
| ETH Price | ~$2,000 |
| Total Market Cap | $2.4T |
| BTC Dominance | 52% |
| Fear & Greed | Extreme Fear (12) |

**El contexto:** Venimos de una corrección fuerte. BTC cayó de $100K+ a $70K en semanas. ¿Oportunidad o trampa?

---

## LO BULLISH

**1. ETFs de Bitcoin = Adopción Institucional**
- $50B+ en AUM (Assets Under Management)
- BlackRock IBIT es el ETF más exitoso de la historia
- Instituciones siguen comprando en dips

**2. El Halving Está Haciendo Lo Suyo**
El halving de abril 2024 redujo rewards de 6.25 a 3.125 BTC.
- Históricamente: 12-18 meses post-halving = rally
- Supply shock + demanda institucional

**3. Regulación Se Clarifica**
- EE.UU: GENIUS Act para stablecoins
- Europa: MiCAR implementado
- Menos incertidumbre = más capital institucional

---

## LO BEARISH

**1. Macro Incierto**
- Fed todavía hawkish
- Tasas altas = menos apetito por riesgo
- Correlación con tech stocks

**2. Presión de Venta**
- Miners vendiendo para cubrir costos
- Mt. Gox distribución pendiente
- Tomas de ganancias de early holders

**3. Sentiment Destruido**
- Fear & Greed en "Extreme Fear"
- Retail se fue del mercado
- Volúmenes en mínimos de meses

---

## SECTORES CON MOMENTUM

| Sector | Tendencia | Por Qué |
|--------|-----------|---------|
| **RWAs** | Up | Tokenización de activos reales |
| **AI x Crypto** | Up | Narrativa fuerte |
| **DePIN** | Neutral | Construyendo infraestructura |
| **Memecoins** | Down | Ciclo de atención terminó |
| **Gaming** | Neutral | AAA games en desarrollo |

---

## QUÉ ESTÁN HACIENDO LOS INSTITUCIONALES

**MicroStrategy:** 200,000+ BTC en balance. Saylor sigue comprando.

**BlackRock:** IBIT con $20B+. Larry Fink llamó a BTC "oro digital".

**Fidelity:** Productos crypto para retirement accounts.

**El mensaje:** Las instituciones no están vendiendo. Están acumulando.

---

## ESTRATEGIA SUGERIDA

**Si eres holder:**
- No vendas en pánico
- DCA (Dollar Cost Average) en las caídas
- Mantén timeframe largo (2-4 años)

**Si tienes cash:**
- Acumula BTC/ETH en niveles de miedo
- No uses apalancamiento
- Mantén 20-30% en stables para oportunidades

**Allocation sugerida:**
- 50% BTC (reserva de valor)
- 30% ETH (plataforma dominante)
- 15% Altcoins selectas (RWAs, AI)
- 5% Stables (dry powder)

---

## PREDICCIÓN Q2 2026

> "El mercado está en su mejor momento para acumular. El miedo extremo históricamente precede a rallies significativos."

**Targets:**
- BTC: $100K-120K para fin de 2026
- ETH: $4K-5K si escala correctamente
- Altseason: Posible Q3-Q4 2026

DYOR. Esto no es consejo financiero. Pero el miedo es donde se hacen las fortunas. 🦉"""
        },
        {
            "id": "4",
            "title": "DeFi 2.0: Dónde Encontrar Yield REAL en 2026",
            "excerpt": "Olvídate de APYs de 10,000%. Aquí están los protocolos con revenue real y yields sostenibles.",
            "category": "DeFi",
            "tags": ["Yield", "Protocolos", "Staking", "Inversión"],
            "read_time": "6 min",
            "premium": False,
            "published_at": "2026-01-28T14:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
            "content": """GM. ¿Cansado de yields que desaparecen? Hablemos de DeFi que realmente paga.

---

## DEFI 1.0 vs DEFI 2.0

| | DeFi 1.0 (2020-2022) | DeFi 2.0 (2023+) |
|--|----------------------|------------------|
| Yields | 1000%+ APY | 5-25% APR |
| Fuente | Emisiones de tokens | Revenue real |
| Sostenible | No | Sí |
| Ejemplo | Farm random coin | GMX, Aave |

**La lección:** Si el yield parece demasiado bueno para ser verdad, probablemente lo es.

---

## TOP PROTOCOLOS CON REVENUE REAL

### 1. GMX (Arbitrum/Avalanche)
- **Qué hace:** Exchange de perpetuos descentralizado
- **Revenue:** Fees de trading ($200M+ anuales)
- **Yield:** 15-25% APR en stables (GLP)
- **Riesgo:** Medio

### 2. Aave / Compound
- **Qué hace:** Lending & borrowing
- **Revenue:** Intereses de préstamos
- **Yield:** 3-8% APR variable
- **Riesgo:** Bajo (los más probados)

### 3. Lido (Ethereum)
- **Qué hace:** Liquid staking de ETH
- **Revenue:** Rewards de staking
- **Yield:** ~4% APR
- **Riesgo:** Bajo

### 4. Pendle
- **Qué hace:** Yield tokenization
- **Revenue:** Trading de yield tokens
- **Yield:** Variable (hasta 20%+ en estrategias)
- **Riesgo:** Medio-Alto

---

## COMPARATIVA DE YIELDS (Febrero 2026)

| Protocolo | Asset | APR | Riesgo |
|-----------|-------|-----|--------|
| Aave | USDC | 5.2% | Bajo |
| Compound | USDC | 4.8% | Bajo |
| Lido | ETH | 4.1% | Bajo |
| GMX/GLP | Multi | 18% | Medio |
| Pendle | varias | 8-25% | Medio |
| Curve | Stables | 3-6% | Bajo |

---

## ESTRATEGIAS POR PERFIL DE RIESGO

**Conservador (3-6% APR)**
```
50% USDC en Aave
30% ETH staked en Lido
20% Stables en Curve
```

**Moderado (8-15% APR)**
```
40% GLP en GMX
30% USDC en Aave
30% Estrategias Pendle
```

**Agresivo (15-25%+ APR)**
```
50% GLP + yield farming
30% Pendle strategies
20% LP en pools de alta demanda
```

---

## CHECKLIST ANTES DE DEPOSITAR

- ¿Tiene múltiples auditorías?
- ¿TVL estable o creciente?
- ¿Revenue real o solo emisiones?
- ¿Historial sin exploits mayores?
- ¿Entiendes cómo genera el yield?

**Si no puedes responder SÍ a todas, no deposites.**

---

## OPORTUNIDADES ACTUALES

**Subvaloradas:**
- Pendle: Yield tokenization único
- Morpho: Optimizador de lending
- Rocket Pool: ETH staking descentralizado

**Evitar:**
- Protocolos nuevos sin auditorías
- Yields >50% APR (red flag)
- Tokens con 90%+ de supply en team

---

## PRO TIP

> "El mejor yield es el que puedes mantener por años sin preocuparte."

No persigas el APY más alto. Persigue el APY más **sostenible**. 🦉"""
        },
        {
            "id": "5",
            "title": "L2 Wars 2026: Arbitrum vs Optimism vs Base",
            "excerpt": "Los Layer 2 dominan Ethereum. Aquí está cuál elegir para trading, airdrops y desarrollo.",
            "category": "Tecnología",
            "tags": ["Layer 2", "Ethereum", "Arbitrum", "Base", "Optimism"],
            "read_time": "5 min",
            "premium": False,
            "published_at": "2026-01-25T11:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1666624833516-6d0e320c610d?w=800",
            "content": """GM. Los L2s son el futuro de Ethereum. Pero, ¿cuál elegir? Te lo desglosamos.

---

## ¿POR QUÉ LAYER 2?

**Ethereum Mainnet:**
- Muy seguro
- Caro ($5-50 por tx)
- Lento (~15 TPS)

**Layer 2s:**
- Heredan seguridad de ETH
- 10-100x más baratos
- Mucho más rápidos

---

## COMPARATIVA RÁPIDA

| | Arbitrum | Optimism | Base |
|--|----------|----------|------|
| **TVL** | $12B+ | $6B+ | $4B+ |
| **Token** | ARB | OP | No tiene |
| **Costo TX** | $0.05-0.20 | $0.05-0.15 | $0.01-0.10 |
| **Apps** | 400+ | 200+ | 150+ |
| **Respaldo** | Offchain Labs | Optimism Foundation | Coinbase |

---

## ARBITRUM: EL REY DEL TVL

**Fortalezas:**
- Mayor ecosistema DeFi
- GMX, Camelot, Radiant
- Más liquidez

**Debilidades:**
- Token ya lanzado (menos upside)
- Fees ligeramente más altos

**Para quién:** Traders serios, DeFi degens

---

## OPTIMISM: LA VISIÓN SUPERCHAIN

**Fortalezas:**
- Superchain: Base, Zora usan su tech
- Revenue sharing con chains aliadas
- Retroactive Public Goods Funding

**Debilidades:**
- Menos TVL que Arbitrum
- Ecosistema más pequeño

**Para quién:** Desarrolladores, holders largo plazo

---

## BASE: EL ONRAMP DE COINBASE

**Fortalezas:**
- Fees más bajos
- Fácil onboarding desde Coinbase
- Sin token = posible airdrop

**Debilidades:**
- Más centralizado
- Ecosistema más nuevo

**Para quién:** Nuevos usuarios, airdrop hunters

---

## OPORTUNIDADES DE AIRDROP

| Chain | Token | Probabilidad | Qué hacer |
|-------|-------|--------------|-----------|
| Base | ? | Alta | Usar activamente |
| zkSync | ZK (próx) | Muy Alta | Bridgear, tradear |
| Scroll | ? | Alta | Usar dApps |
| Linea | ? | Media | Actividad básica |

---

## RECOMENDACIÓN

**Para trading/DeFi:** Arbitrum
- Mayor liquidez, más protocolos

**Para desarrollo:** Optimism
- Mejor soporte, grants disponibles

**Para airdrops:** Base + zkSync + Scroll
- Usa las tres para maximizar chances

**Para inversión:**
- ARB: Sólido, ecosistema maduro
- OP: Superchain narrative
- Base plays: Tokens del ecosistema Base

---

## PREDICCIÓN

> "Los L2s procesarán más transacciones que Ethereum mainnet para fin de 2026."

El ganador no será uno. Será un ecosistema interconectado de L2s especializados. 🦉"""
        }
    ]

def get_mock_airdrops():
    return [
        {
            "id": "1",
            "project_name": "GRVT",
            "logo_url": "https://ui-avatars.com/api/?name=GR&background=8b5cf6&color=fff&size=128&bold=true&format=svg",
            "chain": "zkSync",
            "description": "DEX híbrido institucional en zkSync - TGE confirmado Q1 2026",
            "full_description": "GRVT combina auto-custodia con velocidad institucional. 22% del supply para airdrops. TGE confirmado.",
            "backing": "Paradigm, Variant, Robot Ventures - $7M raised",
            "reward_note": "12% Season 2 + 10% Season 1. Rewards post-TGE.",
            "tasks": [
                {"id": "t1", "description": "Crear cuenta en grvt.io y completar KYC", "completed": False},
                {"id": "t2", "description": "Depositar USDT para ganar puntos diarios", "completed": False},
                {"id": "t3", "description": "Tradear perpetuos regularmente", "completed": False}
            ],
            "estimated_reward": "$2000-5000",
            
            "deadline": "2026-03-31T23:59:59Z",
            "status": "active",
            "link": "https://grvt.io/exchange",
            "premium": True,
            "timeline": "TGE Q1 2026 confirmado"
        },
        {
            "id": "2",
            "project_name": "Backpack",
            "logo_url": "https://ui-avatars.com/api/?name=BP&background=14b8a6&color=fff&size=128&bold=true&format=svg",
            "chain": "Solana",
            "description": "Exchange de Solana del equipo Mad Lads - Token confirmado",
            "full_description": "Backpack del equipo Coral/xNFT. 24% para programa de puntos. Fase Epilogue activa.",
            "backing": "Jump, Placeholder - $17M Serie A",
            "reward_note": "Puntos semanales (snapshot jueves, crédito viernes)",
            "tasks": [
                {"id": "t1", "description": "Crear cuenta y completar KYC", "completed": False},
                {"id": "t2", "description": "Depositar y tradear en Spot/Futuros", "completed": False},
                {"id": "t3", "description": "Completar quests disponibles", "completed": False}
            ],
            "estimated_reward": "$1500-4000",
            
            "deadline": "2026-03-31T23:59:59Z",
            "status": "active",
            "link": "https://backpack.exchange",
            "premium": True,
            "timeline": "Fase Epilogue - TGE pronto"
        },
        {
            "id": "3",
            "project_name": "Paradex",
            "logo_url": "https://ui-avatars.com/api/?name=PX&background=f97316&color=fff&size=128&bold=true&format=svg",
            "chain": "Starknet",
            "description": "DEX de perpetuos en Starknet respaldado por Paradigm",
            "full_description": "Trading institucional con auto-custodia. Respaldo de Paradigm asegura calidad.",
            "backing": "Paradigm - VC top tier",
            "reward_note": "Sistema de puntos activo para usuarios tempranos",
            "tasks": [
                {"id": "t1", "description": "Crear cuenta en Paradex", "completed": False},
                {"id": "t2", "description": "Hacer trades de perpetuos", "completed": False},
                {"id": "t3", "description": "Mantener actividad semanal", "completed": False}
            ],
            "estimated_reward": "$1500-4000",
            
            "deadline": "2026-06-30T23:59:59Z",
            "status": "active",
            "link": "https://app.paradex.trade",
            "premium": True,
            "timeline": "Token esperado 2026"
        },
        {
            "id": "4",
            "project_name": "Reya Network",
            "logo_url": "https://ui-avatars.com/api/?name=RE&background=ef4444&color=fff&size=128&bold=true&format=svg",
            "chain": "Reya L2",
            "description": "L2 modular para trading - Token confirmado",
            "full_description": "Red L2 optimizada para trading y DeFi. Financiamiento significativo de VCs.",
            "backing": "Framework, Coinbase Ventures - $10M+ raised",
            "reward_note": "Sistema de puntos según volumen y actividad",
            "tasks": [
                {"id": "t1", "description": "Bridge fondos a Reya Network", "completed": False},
                {"id": "t2", "description": "Tradear perpetuos", "completed": False},
                {"id": "t3", "description": "Usar pools de liquidez", "completed": False}
            ],
            "estimated_reward": "$2000-5000",
            
            "deadline": "2026-06-30T23:59:59Z",
            "status": "active",
            "link": "https://app.reya.xyz",
            "premium": True,
            "timeline": "Token Q2-Q3 2026"
        },
        {
            "id": "5",
            "project_name": "Avantis",
            "logo_url": "https://ui-avatars.com/api/?name=AV&background=f59e0b&color=fff&size=128&bold=true&format=svg",
            "chain": "Base",
            "description": "DEX de perpetuos en Base con vaults de yield",
            "full_description": "Trading de perps con estrategias de vault únicas en ecosistema Base.",
            "backing": "VCs del ecosistema Base",
            "reward_note": "Puntos por trading y uso de vaults",
            "tasks": [
                {"id": "t1", "description": "Conectar wallet a Avantis", "completed": False},
                {"id": "t2", "description": "Tradear perpetuos", "completed": False},
                {"id": "t3", "description": "Depositar en vaults de yield", "completed": False}
            ],
            "estimated_reward": "$1000-3000",
            
            "deadline": "2026-06-30T23:59:59Z",
            "status": "active",
            "link": "https://www.avantisfi.com",
            "premium": False,
            "timeline": "Token esperado 2026"
        },
        {
            "id": "6",
            "project_name": "Ostium",
            "logo_url": "https://ui-avatars.com/api/?name=OS&background=84cc16&color=fff&size=128&bold=true&format=svg",
            "chain": "Arbitrum",
            "description": "Perpetuos de RWA y crypto - Stocks, forex y más",
            "full_description": "Trading de perpetuos tradicionales y crypto. Oferta única de activos.",
            "backing": "VCs enfocados en RWA",
            "reward_note": "Sistema de puntos por volumen en diferentes activos",
            "tasks": [
                {"id": "t1", "description": "Conectar wallet a Ostium", "completed": False},
                {"id": "t2", "description": "Tradear perpetuos de stocks (SPX, etc)", "completed": False},
                {"id": "t3", "description": "Tradear pares crypto", "completed": False}
            ],
            "estimated_reward": "$1000-3000",
            
            "deadline": "2026-06-30T23:59:59Z",
            "status": "active",
            "link": "https://app.ostium.com",
            "premium": False,
            "timeline": "Token esperado 2026"
        },
        {
            "id": "7",
            "project_name": "Lighter",
            "logo_url": "https://ui-avatars.com/api/?name=LI&background=22c55e&color=fff&size=128&bold=true&format=svg",
            "chain": "Arbitrum",
            "description": "DEX con historial de airdrop exitoso - Segunda ronda",
            "full_description": "Ya completó un airdrop exitoso. Preparando segunda distribución.",
            "backing": "Modelo auto-sostenible por fees",
            "reward_note": "Órdenes límite dan multiplicador bonus",
            "tasks": [
                {"id": "t1", "description": "Conectar wallet a Lighter", "completed": False},
                {"id": "t2", "description": "Hacer trades con órdenes límite", "completed": False},
                {"id": "t3", "description": "Mantener volumen constante", "completed": False}
            ],
            "estimated_reward": "$500-2000",
            
            "deadline": "2026-06-30T23:59:59Z",
            "status": "active",
            "link": "https://app.lighter.xyz",
            "premium": False,
            "timeline": "Segunda ronda activa"
        },
        {
            "id": "8",
            "project_name": "Pacifica",
            "logo_url": "https://ui-avatars.com/api/?name=PA&background=06b6d4&color=fff&size=128&bold=true&format=svg",
            "chain": "Solana",
            "description": "Perpetuos en Solana con vaults y social trading",
            "full_description": "Trading de perps con estrategias de vault y función de copy trading.",
            "backing": "Solana Foundation y fondos del ecosistema",
            "reward_note": "Puntos por trading y uso de features sociales",
            "tasks": [
                {"id": "t1", "description": "Conectar wallet de Solana", "completed": False},
                {"id": "t2", "description": "Tradear SOL-PERP", "completed": False},
                {"id": "t3", "description": "Probar yield vaults", "completed": False}
            ],
            "estimated_reward": "$800-2500",
            
            "deadline": "2026-06-30T23:59:59Z",
            "status": "active",
            "link": "https://app.pacifica.fi",
            "premium": False,
            "timeline": "Token esperado 2026"
        }
    ]


# Routes
@api_router.get("/")
async def root():
    return {"message": "Alpha Crypto API"}

@api_router.get("/crypto/prices", response_model=List[CryptoPrice])
async def get_crypto_prices():
    """Get current crypto prices from Kraken API (free, no rate limits)"""
    cache_key = "crypto_prices"
    
    # Check cache first
    cached_prices = await api_cache.get(cache_key, CACHE_TTL_CRYPTO_PRICES)
    if cached_prices:
        logger.debug("Returning cached crypto prices")
        return cached_prices
    
    # Fetch from Kraken API
    try:
        async with aiohttp.ClientSession() as session:
            url = "https://api.kraken.com/0/public/Ticker"
            params = {"pair": "XBTUSD,ETHUSD,SOLUSD,USDCUSD"}
            headers = {"User-Agent": "AlphaCrypto/1.0"}
            
            async with session.get(url, params=params, headers=headers, timeout=15) as response:
                if response.status == 200:
                    data = await response.json()
                    result = data.get("result", {})
                    
                    # Map Kraken pairs to our format
                    pair_map = {
                        "XXBTZUSD": {"id": "bitcoin", "symbol": "BTC", "name": "Bitcoin"},
                        "XETHZUSD": {"id": "ethereum", "symbol": "ETH", "name": "Ethereum"},
                        "SOLUSD": {"id": "solana", "symbol": "SOL", "name": "Solana"},
                        "USDCUSD": {"id": "usd-coin", "symbol": "USDC", "name": "USD Coin"}
                    }
                    
                    prices = []
                    for pair, info in result.items():
                        if pair in pair_map:
                            meta = pair_map[pair]
                            current_price = float(info["c"][0])  # Last trade price
                            open_price = float(info["o"])  # Today's opening price
                            change_24h = ((current_price - open_price) / open_price * 100) if open_price > 0 else 0
                            volume = float(info["v"][1])  # 24h volume
                            
                            prices.append({
                                "id": meta["id"],
                                "symbol": meta["symbol"],
                                "name": meta["name"],
                                "current_price": round(current_price, 2),
                                "price_change_24h": round(change_24h, 2),
                                "market_cap": 0,  # Kraken doesn't provide market cap
                                "volume_24h": round(volume * current_price, 0)
                            })
                    
                    if prices:
                        # Sort: BTC, ETH, SOL, USDC
                        order = {"bitcoin": 0, "ethereum": 1, "solana": 2, "usd-coin": 3}
                        prices.sort(key=lambda x: order.get(x["id"], 99))
                        logger.info(f"Fetched {len(prices)} prices from Kraken - caching for {CACHE_TTL_CRYPTO_PRICES}s")
                        await api_cache.set(cache_key, prices)
                        return prices
                else:
                    logger.warning(f"Kraken returned status {response.status}")
    except Exception as e:
        logger.error(f"Error fetching Kraken prices: {e}")
    
    # Fallback to mock data if API fails
    logger.info("Using mock crypto prices as fallback")
    return get_mock_crypto_prices()

@api_router.get("/crypto/fear-greed")
async def get_fear_greed_index():
    """Get Fear & Greed Index from Alternative.me API with caching"""
    cache_key = "fear_greed_index"
    
    # Check cache first
    cached_data = await api_cache.get(cache_key, CACHE_TTL_FEAR_GREED)
    if cached_data:
        logger.debug("Returning cached Fear & Greed index")
        return cached_data
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("https://api.alternative.me/fng/", timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    index_data = data['data'][0]
                    result = {
                        "value": int(index_data['value']),
                        "classification": index_data['value_classification'],
                        "timestamp": index_data['timestamp']
                    }
                    await api_cache.set(cache_key, result)
                    logger.info(f"Fetched Fear & Greed index: {result['value']} - caching for {CACHE_TTL_FEAR_GREED}s")
                    return result
    except Exception as e:
        logger.error(f"Error fetching Fear & Greed index: {e}")
    
    # Fallback to mock data
    return {
        "value": 12,
        "classification": "Extreme Fear",
        "timestamp": str(int(datetime.now(timezone.utc).timestamp()))
    }

@api_router.get("/crypto/market-stats")
async def get_market_stats():
    """Get market statistics"""
    prices = get_mock_crypto_prices()
    btc = next((p for p in prices if p['id'] == 'bitcoin'), None)
    
    total_market_cap = sum(p['market_cap'] for p in prices)
    btc_dominance = (btc['market_cap'] / total_market_cap * 100) if btc else 0
    
    return {
        "total_market_cap": total_market_cap,
        "btc_dominance": round(btc_dominance, 2),
        "total_volume_24h": sum(p['volume_24h'] for p in prices),
        "active_cryptos": len(prices)
    }

@api_router.get("/crypto/chart/{coin_id}")
async def get_crypto_chart(coin_id: str, days: int = 30):
    """Get historical price data for charts from CoinGecko (with 10min cache)"""
    cache_key = f"chart_{coin_id}_{days}"
    
    # Check cache first - use longer TTL for CoinGecko
    cached = await api_cache.get(cache_key, ttl_seconds=CACHE_TTL_COINGECKO)
    if cached:
        logger.info(f"Returning cached chart data for {coin_id}")
        return cached
    
    try:
        async with aiohttp.ClientSession() as session:
            url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
            params = {"vs_currency": "usd", "days": days}
            headers = {"User-Agent": "AlphaCrypto/1.0"}
            
            async with session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    prices = data.get("prices", [])
                    
                    # Format data for charts
                    chart_data = []
                    for timestamp, price in prices:
                        chart_data.append({
                            "timestamp": timestamp,
                            "price": round(price, 2),
                            "date": datetime.fromtimestamp(timestamp/1000, tz=timezone.utc).strftime("%Y-%m-%d")
                        })
                    
                    result = {"coin_id": coin_id, "days": days, "data": chart_data}
                    await api_cache.set(cache_key, result)
                    logger.info(f"Fetched chart for {coin_id} from CoinGecko - caching for {CACHE_TTL_COINGECKO}s")
                    return result
                elif response.status == 429:
                    logger.warning(f"CoinGecko chart API rate limited - using mock data")
                    return generate_mock_chart_data(coin_id, days)
                else:
                    logger.warning(f"CoinGecko chart API returned {response.status}")
                    return generate_mock_chart_data(coin_id, days)
    except Exception as e:
        logger.error(f"Error fetching chart data: {e}")
        # Return mock data as fallback
        return generate_mock_chart_data(coin_id, days)

@api_router.get("/crypto/global")
async def get_global_market_data():
    """Get global market data from CoinGecko (with 10min cache)"""
    cache_key = "global_market"
    
    # Use longer cache for CoinGecko endpoints
    cached = await api_cache.get(cache_key, ttl_seconds=CACHE_TTL_COINGECKO)
    if cached:
        return cached
    
    try:
        async with aiohttp.ClientSession() as session:
            url = "https://api.coingecko.com/api/v3/global"
            headers = {"User-Agent": "AlphaCrypto/1.0"}
            
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    global_data = data.get("data", {})
                    
                    result = {
                        "total_market_cap_usd": global_data.get("total_market_cap", {}).get("usd", 0),
                        "total_volume_24h_usd": global_data.get("total_volume", {}).get("usd", 0),
                        "btc_dominance": round(global_data.get("market_cap_percentage", {}).get("btc", 0), 2),
                        "eth_dominance": round(global_data.get("market_cap_percentage", {}).get("eth", 0), 2),
                        "active_cryptocurrencies": global_data.get("active_cryptocurrencies", 0),
                        "market_cap_change_24h": round(global_data.get("market_cap_change_percentage_24h_usd", 0), 2)
                    }
                    
                    await api_cache.set(cache_key, result)
                    return result
                else:
                    logger.warning(f"CoinGecko global API returned {response.status}")
    except Exception as e:
        logger.error(f"Error fetching global data: {e}")
    
    # Fallback
    return {
        "total_market_cap_usd": 2500000000000,
        "total_volume_24h_usd": 95000000000,
        "btc_dominance": 52.5,
        "eth_dominance": 17.2,
        "active_cryptocurrencies": 14000,
        "market_cap_change_24h": 1.5
    }

@api_router.get("/crypto/stablecoins")
async def get_stablecoin_data():
    """Get stablecoin market data from DefiLlama - FREE API"""
    cache_key = "stablecoins_data"
    
    cached = await api_cache.get(cache_key, ttl_seconds=300)
    if cached:
        return cached
    
    try:
        async with aiohttp.ClientSession() as session:
            url = "https://stablecoins.llama.fi/stablecoins?includePrices=true"
            headers = {"User-Agent": "AlphaCrypto/1.0"}
            
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    stablecoins = data.get("peggedAssets", [])
                    
                    # Calculate totals and get top stablecoins
                    total_mcap = sum(s.get("circulating", {}).get("peggedUSD", 0) or 0 for s in stablecoins)
                    
                    # Get top stablecoins by market cap
                    top_stables = []
                    for s in sorted(stablecoins, key=lambda x: x.get("circulating", {}).get("peggedUSD", 0) or 0, reverse=True)[:10]:
                        mcap = s.get("circulating", {}).get("peggedUSD", 0) or 0
                        if mcap > 0:
                            top_stables.append({
                                "name": s.get("name", "Unknown"),
                                "symbol": s.get("symbol", ""),
                                "market_cap": round(mcap, 0),
                                "percentage": round((mcap / total_mcap * 100) if total_mcap > 0 else 0, 2)
                            })
                    
                    result = {
                        "total_market_cap": round(total_mcap, 0),
                        "top_stablecoins": top_stables,
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                        "source": "DefiLlama"
                    }
                    
                    await api_cache.set(cache_key, result)
                    return result
                else:
                    logger.warning(f"DefiLlama stablecoins API returned {response.status}")
    except Exception as e:
        logger.error(f"Error fetching stablecoin data: {e}")
    
    # Fallback with timestamp
    return {
        "total_market_cap": 205000000000,
        "top_stablecoins": [
            {"name": "Tether", "symbol": "USDT", "market_cap": 140000000000, "percentage": 68.3},
            {"name": "USD Coin", "symbol": "USDC", "market_cap": 42000000000, "percentage": 20.5},
            {"name": "DAI", "symbol": "DAI", "market_cap": 5300000000, "percentage": 2.6},
            {"name": "USDe", "symbol": "USDe", "market_cap": 6000000000, "percentage": 2.9},
            {"name": "FDUSD", "symbol": "FDUSD", "market_cap": 2500000000, "percentage": 1.2}
        ],
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source": "Cache (API unavailable)"
    }

@api_router.get("/crypto/defi-tvl")
async def get_defi_tvl():
    """Get DeFi TVL from DefiLlama - FREE API"""
    cache_key = "defi_tvl"
    
    cached = await api_cache.get(cache_key, ttl_seconds=300)
    if cached:
        return cached
    
    try:
        async with aiohttp.ClientSession() as session:
            # Get total TVL
            url = "https://api.llama.fi/v2/historicalChainTvl"
            headers = {"User-Agent": "AlphaCrypto/1.0"}
            
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Get latest TVL
                    latest = data[-1] if data else {}
                    total_tvl = latest.get("tvl", 0)
                    
                    # Get 24h change
                    prev_day = data[-2] if len(data) > 1 else {}
                    prev_tvl = prev_day.get("tvl", total_tvl)
                    change_24h = ((total_tvl - prev_tvl) / prev_tvl * 100) if prev_tvl > 0 else 0
                    
                    result = {
                        "total_tvl": round(total_tvl, 0),
                        "change_24h": round(change_24h, 2),
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                        "source": "DefiLlama"
                    }
                    
                    await api_cache.set(cache_key, result)
                    return result
                else:
                    logger.warning(f"DefiLlama TVL API returned {response.status}")
    except Exception as e:
        logger.error(f"Error fetching DeFi TVL: {e}")
    
    # Fallback
    return {
        "total_tvl": 95000000000,
        "change_24h": -1.5,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source": "Cache (API unavailable)"
    }

def generate_mock_chart_data(coin_id: str, days: int):
    """Generate mock chart data as fallback"""
    base_prices = {"bitcoin": 95000, "ethereum": 3200, "solana": 180}
    base = base_prices.get(coin_id, 100)
    
    data = []
    price = base
    now = datetime.now(timezone.utc)
    
    for i in range(days):
        change = (random.random() - 0.48) * base * 0.03
        price = max(base * 0.7, min(base * 1.3, price + change))
        timestamp = int((now - timedelta(days=days-i)).timestamp() * 1000)
        data.append({
            "timestamp": timestamp,
            "price": round(price, 2),
            "date": (now - timedelta(days=days-i)).strftime("%Y-%m-%d")
        })
    
    return {"coin_id": coin_id, "days": days, "data": data}

@api_router.get("/articles", response_model=List[Article])
async def get_articles_route(category: Optional[str] = None, search: Optional[str] = None):
    """Get articles from MongoDB, falls back to mock data if empty"""
    try:
        # Build query
        query = {}
        if category and category != "all":
            query["category"] = {"$regex": f"^{category}$", "$options": "i"}
        
        # Try MongoDB first
        db_articles = await db.articles.find(query, {"_id": 0}).sort("published_at", -1).to_list(100)
        
        if db_articles and len(db_articles) >= 1:
            articles = db_articles
        else:
            # Fallback to mock data
            articles = get_mock_articles()
            if category and category != "all":
                articles = [a for a in articles if a.get('category', '').lower() == category.lower()]
        
        # Apply search filter
        if search:
            search_lower = search.lower()
            articles = [a for a in articles if search_lower in a.get('title', '').lower() or search_lower in a.get('excerpt', '').lower()]
        
        return articles
    except Exception as e:
        logger.error(f"Error fetching articles: {e}")
        return get_mock_articles()

@api_router.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: str):
    """Get single article by ID from MongoDB"""
    try:
        # Try MongoDB first
        article = await db.articles.find_one({"id": article_id}, {"_id": 0})
        if article:
            return article
        
        # Fallback to mock data
        articles = get_mock_articles()
        article = next((a for a in articles if a['id'] == article_id), None)
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        return article
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching article: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch article")

@api_router.get("/airdrops", response_model=List[Airdrop])
async def get_airdrops_route(status: Optional[str] = None, difficulty: Optional[str] = None, chain: Optional[str] = None):
    """Get airdrops from MongoDB, falls back to mock data if empty"""
    try:
        # Build query
        query = {}
        if status and status != "all":
            query["status"] = status
        if chain and chain != "all":
            query["chain"] = {"$regex": f"^{chain}$", "$options": "i"}
        
        # Try MongoDB first
        db_airdrops = await db.airdrops.find(query, {"_id": 0}).sort("deadline", 1).to_list(100)
        
        if db_airdrops and len(db_airdrops) >= 1:
            return db_airdrops
        
        # Fallback to mock data
        airdrops = get_mock_airdrops()
        
        if status and status != "all":
            airdrops = [a for a in airdrops if a['status'] == status]
        if chain and chain != "all":
            airdrops = [a for a in airdrops if a.get('chain', '').lower() == chain.lower()]
        
        return airdrops
    except Exception as e:
        logger.error(f"Error fetching airdrops: {e}")
        return get_mock_airdrops()

@api_router.get("/airdrops/{airdrop_id}", response_model=Airdrop)
async def get_airdrop(airdrop_id: str):
    """Get single airdrop by ID from MongoDB"""
    try:
        # Try MongoDB first
        airdrop = await db.airdrops.find_one({"id": airdrop_id}, {"_id": 0})
        if airdrop:
            return airdrop
        
        # Fallback to mock data
        airdrops = get_mock_airdrops()
        airdrop = next((a for a in airdrops if a['id'] == airdrop_id), None)
        if not airdrop:
            raise HTTPException(status_code=404, detail="Airdrop not found")
        return airdrop
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching airdrop: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch airdrop")

@api_router.post("/airdrops/{airdrop_id}/tasks/{task_id}/toggle")
async def toggle_task(airdrop_id: str, task_id: str):
    """Toggle task completion status"""
    # In real app, this would update database
    return {"success": True, "task_id": task_id}

@api_router.get("/market-indices")
async def get_market_indices():
    """Get various market indices"""
    return {
        "bitcoin_rainbow": {
            "current_position": "Accumulate",
            "price_band": "$45,000 - $65,000",
            "recommendation": "Good time to buy"
        },
        "altcoin_season_index": {
            "value": 58,
            "status": "Bitcoin Season",
            "description": "Bitcoin is outperforming altcoins"
        },
        "defi_tvl": {
            "total": 48500000000,
            "change_24h": 2.3,
            "top_protocols": [
                {"name": "Lido", "tvl": 23400000000},
                {"name": "Aave", "tvl": 10200000000},
                {"name": "Uniswap", "tvl": 4800000000}
            ]
        },
        "stablecoin_dominance": {
            "percentage": 6.8,
            "total_supply": 142000000000
        }
    }

@api_router.get("/market-indices/gainers-losers")
async def get_gainers_losers():
    """Get top gainers and losers"""
    return {
        "gainers": [
            {"symbol": "ONDO", "name": "Ondo Finance", "price": 0.89, "change_24h": 28.5},
            {"symbol": "RENDER", "name": "Render Token", "price": 8.45, "change_24h": 18.2},
            {"symbol": "WLD", "name": "Worldcoin", "price": 3.24, "change_24h": 15.7}
        ],
        "losers": [
            {"symbol": "BLUR", "name": "Blur", "price": 0.42, "change_24h": -12.3},
            {"symbol": "LDO", "name": "Lido DAO", "price": 2.15, "change_24h": -8.9},
            {"symbol": "APE", "name": "ApeCoin", "price": 1.68, "change_24h": -7.4}
        ]
    }


# Payment endpoints
@api_router.post("/payments/submit")
async def submit_payment(payment: PaymentSubmission):
    """Submit a new payment for verification"""
    try:
        # Create payment record
        payment_doc = {
            "id": str(uuid.uuid4()),
            "user_email": payment.email,
            "amount": payment.amount,
            "chain": payment.chain,
            "tx_hash": payment.tx_hash,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "wallet_address": payment.wallet_address
        }
        
        await db.payments.insert_one(payment_doc)
        
        # Check if user exists
        user = await db.users.find_one({"email": payment.email}, {"_id": 0})
        
        if not user:
            # Create new user
            user_doc = {
                "email": payment.email,
                "wallet_address": payment.wallet_address,
                "is_premium": False,
                "premium_until": None,
                "payment_chain": payment.chain,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        return {"success": True, "message": "Payment submitted successfully", "payment_id": payment_doc["id"]}
    except Exception as e:
        logger.error(f"Error submitting payment: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit payment")

@api_router.get("/admin/payments")
async def get_pending_payments(status: Optional[str] = "pending"):
    """Get payments for admin review"""
    try:
        query = {} if status == "all" else {"status": status}
        payments = await db.payments.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
        return payments
    except Exception as e:
        logger.error(f"Error fetching payments: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch payments")

@api_router.post("/admin/payments/{payment_id}/verify")
async def verify_payment(payment_id: str):
    """Verify a payment and activate premium"""
    try:
        # Get payment
        payment = await db.payments.find_one({"id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Update payment status
        await db.payments.update_one(
            {"id": payment_id},
            {"$set": {"status": "verified"}}
        )
        
        # Activate premium for user (30 days)
        from datetime import timedelta
        premium_until = datetime.now(timezone.utc) + timedelta(days=30)
        
        await db.users.update_one(
            {"email": payment["user_email"]},
            {"$set": {
                "is_premium": True,
                "premium_until": premium_until.isoformat()
            }}
        )
        
        return {"success": True, "message": "Payment verified and premium activated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify payment")

# Early Signals endpoint
def get_mock_signals():
    """Mock signals data"""
    return [
        {
            "id": "1",
            "type": "opportunity",
            "priority": "high",
            "title": "Arbitrum Airdrop Season 2 Hints",
            "description": "El equipo de Arbitrum ha insinuado una segunda ronda de airdrops. Usuarios activos en el ecosistema podrían calificar.",
            "action": "Bridge y usar protocolos en Arbitrum",
            "link": "https://arbitrum.io",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "premium": False
        },
        {
            "id": "2",
            "type": "alert",
            "priority": "urgent",
            "title": "Bitcoin: Soporte Clave en $68K",
            "description": "BTC testeando soporte crítico. Ruptura podría llevar a $62K. Mantener stables listos para compra.",
            "action": "Set buy orders at $65K",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "premium": True
        },
        {
            "id": "3",
            "type": "news",
            "priority": "medium",
            "title": "BlackRock ETF: Record Inflows",
            "description": "IBIT de BlackRock registró $500M en entradas en un solo día. Señal alcista institucional.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "premium": False
        },
        {
            "id": "4",
            "type": "opportunity",
            "priority": "high",
            "title": "Solana DEX Rewards Program",
            "description": "Jupiter Exchange lanzó programa de puntos. Traders activos acumulan para posible airdrop.",
            "action": "Trade en Jupiter, acumular puntos",
            "link": "https://jup.ag",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "premium": False
        },
        {
            "id": "5",
            "type": "community",
            "priority": "low",
            "title": "Alpha Crypto Discord: Q&A Esta Semana",
            "description": "Sesión de preguntas y respuestas con el equipo de análisis. Jueves 8PM UTC.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "premium": False
        },
        {
            "id": "6",
            "type": "alert",
            "priority": "high",
            "title": "ETH: Patrón Técnico Formándose",
            "description": "Ethereum formando cuña descendente. Breakout alcista esperado si supera $2,200.",
            "action": "Watch for breakout confirmation",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "premium": True
        },
        {
            "id": "7",
            "type": "news",
            "priority": "medium",
            "title": "Stripe Expande Pagos Crypto",
            "description": "Stripe habilita pagos con USDC para más merchants. Adopción institucional acelerando.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "premium": False
        },
        {
            "id": "8",
            "type": "opportunity",
            "priority": "urgent",
            "title": "Base: Nueva Temporada de Incentivos",
            "description": "Coinbase Base L2 lanzando programa de incentivos. $10M en rewards para usuarios activos.",
            "action": "Bridge a Base y usar DeFi",
            "link": "https://base.org",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "premium": True
        }
    ]

@api_router.get("/early-signals")
async def get_early_signals():
    """Get early signals from MongoDB, falls back to mock data if empty"""
    try:
        # Try MongoDB first
        db_signals = await db.signals.find({}, {"_id": 0}).sort("timestamp", -1).to_list(100)
        
        if db_signals and len(db_signals) >= 1:
            return db_signals
        
        # Fallback to mock data
        return get_mock_signals()
    except Exception as e:
        logger.error(f"Error fetching signals: {e}")
        return get_mock_signals()


@api_router.get("/admin/users")
async def get_premium_users():
    """Get list of premium users"""
    try:
        users = await db.users.find({"is_premium": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
        return users
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")


# Consulting endpoints
@api_router.post("/consulting")
async def submit_consulting_request(request: ConsultingSubmission):
    """Submit consulting request"""
    try:
        consulting_doc = {
            "id": str(uuid.uuid4()),
            "name": request.name,
            "email": request.email,
            "company": request.company,
            "message": request.message,
            "service_type": request.service_type,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "new"
        }
        await db.consulting.insert_one(consulting_doc)
        
        # Send email notification
        service_label = "Personal" if request.service_type == "personal" else "Empresarial"
        company_info = f"<p style='color: #9ca3af; margin: 5px 0;'><strong style='color: white;'>Empresa:</strong> {request.company}</p>" if request.company else ""
        
        email_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1f2e; padding: 30px; border-radius: 10px;">
            <h2 style="color: #f59e0b; margin-bottom: 20px;">🎯 Nueva Solicitud de Consultoría - Alpha Crypto</h2>
            <div style="background: linear-gradient(135deg, #f59e0b22, #10b98122); padding: 10px 15px; border-radius: 5px; display: inline-block; margin-bottom: 20px;">
                <span style="color: #f59e0b; font-weight: bold;">{service_label}</span>
            </div>
            <div style="background: #0f172a; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: white;">Nombre:</strong> {request.name}</p>
                <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: white;">Email:</strong> {request.email}</p>
                {company_info}
                <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: white;">Mensaje:</strong></p>
                <p style="color: white; background: #1e293b; padding: 15px; border-radius: 5px;">{request.message}</p>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Enviado desde Alpha Crypto Platform</p>
        </div>
        """
        await send_notification_email(
            subject=f"🎯 Consultoría {service_label}: {request.name}",
            html_content=email_html
        )
        
        return {"success": True, "message": "Consulting request submitted successfully"}
    except Exception as e:
        logger.error(f"Error submitting consulting request: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit consulting request")


# Support endpoint
class SupportRequest(BaseModel):
    name: str
    email: str
    message: str
    subject: Optional[str] = "Soporte - Alpha Crypto"

@api_router.post("/support")
async def submit_support_request(request: SupportRequest):
    """Submit support/help request"""
    try:
        support_doc = {
            "id": str(uuid.uuid4()),
            "name": request.name,
            "email": request.email,
            "message": request.message,
            "subject": request.subject,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "new"
        }
        await db.support.insert_one(support_doc)
        
        # Send email notification
        email_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1f2e; padding: 30px; border-radius: 10px;">
            <h2 style="color: #8b5cf6; margin-bottom: 20px;">💬 Nueva Solicitud de Soporte - Alpha Crypto</h2>
            <div style="background: #0f172a; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: white;">Nombre:</strong> {request.name}</p>
                <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: white;">Email:</strong> {request.email}</p>
                <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: white;">Mensaje:</strong></p>
                <p style="color: white; background: #1e293b; padding: 15px; border-radius: 5px; white-space: pre-wrap;">{request.message}</p>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Enviado desde Alpha Crypto Platform - Help Hub</p>
        </div>
        """
        await send_notification_email(
            subject=f"💬 Soporte: {request.name}",
            html_content=email_html
        )
        
        return {"success": True, "message": "Support request submitted successfully"}
    except Exception as e:
        logger.error(f"Error submitting support request: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit support request")


@api_router.get("/admin/consulting")
async def get_consulting_requests(status: Optional[str] = None):
    """Get consulting requests for admin"""
    try:
        query = {}
        if status and status != "all":
            query["status"] = status
        requests = await db.consulting.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
        return requests
    except Exception as e:
        logger.error(f"Error fetching consulting requests: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch consulting requests")

@api_router.post("/admin/consulting/{request_id}/status")
async def update_consulting_status(request_id: str, status: str):
    """Update consulting request status"""
    try:
        result = await db.consulting.update_one(
            {"id": request_id},
            {"$set": {"status": status}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Request not found")
        return {"success": True, "message": f"Status updated to {status}"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating consulting status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")


# Email Alert Subscription endpoints
@api_router.post("/alerts/subscribe")
async def subscribe_to_alerts(subscription: EmailAlertSubscription):
    """Subscribe to email alerts and newsletter"""
    try:
        existing = await db.alert_subscriptions.find_one({"email": subscription.email})
        if existing:
            return {"success": True, "message": "Already subscribed"}
        
        sub_doc = {
            "id": str(uuid.uuid4()),
            "email": subscription.email,
            "subscribed_at": datetime.now(timezone.utc).isoformat(),
            "active": True
        }
        await db.alert_subscriptions.insert_one(sub_doc)
        
        # Send welcome email
        welcome_html = """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 32px; font-weight: bold;">
                    <span style="color: #10b981; font-family: serif;">α</span><span style="color: white;">C</span>
                </span>
                <span style="color: white; font-size: 24px; font-weight: bold; margin-left: 10px;">Alpha Crypto</span>
            </div>
            
            <h1 style="color: #10b981; font-size: 28px; margin-bottom: 20px; text-align: center;">🎉 ¡Bienvenido a la familia!</h1>
            
            <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Acabas de unirte a la comunidad de inversores cripto más informados de LATAM. 
                A partir de ahora recibirás:
            </p>
            
            <div style="background: #1a1f2e; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="color: #10b981; margin-right: 10px;">📊</span>
                    <span style="color: white;">Análisis de mercado semanales</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="color: #10b981; margin-right: 10px;">🎯</span>
                    <span style="color: white;">Nuevos airdrops verificados</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="color: #10b981; margin-right: 10px;">📚</span>
                    <span style="color: white;">Artículos educativos exclusivos</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="color: #10b981; margin-right: 10px;">⚡</span>
                    <span style="color: white;">Alertas de oportunidades</span>
                </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Visita <a href="https://alphacrypto.com" style="color: #10b981;">alphacrypto.com</a> para explorar todo nuestro contenido.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151; text-align: center;">
                <p style="color: #4b5563; font-size: 12px;">
                    Alpha Crypto • Tu alpha en el mercado 🦉
                </p>
            </div>
        </div>
        """
        await send_notification_email(
            subject="🦉 ¡Bienvenido a Alpha Crypto!",
            html_content=welcome_html,
            to_email=subscription.email
        )
        
        return {"success": True, "message": "Successfully subscribed to newsletter"}
    except Exception as e:
        logger.error(f"Error subscribing to alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to subscribe")

@api_router.get("/admin/alert-subscribers")
async def get_alert_subscribers():
    """Get list of email alert subscribers"""
    try:
        subscribers = await db.alert_subscriptions.find({"active": True}, {"_id": 0}).sort("subscribed_at", -1).to_list(500)
        return subscribers
    except Exception as e:
        logger.error(f"Error fetching subscribers: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch subscribers")

@api_router.post("/alerts/unsubscribe")
async def unsubscribe_from_alerts(subscription: EmailAlertSubscription):
    """Unsubscribe from email alerts"""
    try:
        result = await db.alert_subscriptions.update_one(
            {"email": subscription.email},
            {"$set": {"active": False}}
        )
        return {"success": True, "message": "Unsubscribed from alerts"}
    except Exception as e:
        logger.error(f"Error unsubscribing: {e}")
        raise HTTPException(status_code=500, detail="Failed to unsubscribe")

@api_router.post("/newsletter/send-article")
async def send_article_newsletter(article_id: str):
    """Send an article to all newsletter subscribers"""
    try:
        # Get the article
        articles = get_mock_articles()
        article = next((a for a in articles if a["id"] == article_id), None)
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        
        # Get all active subscribers
        subscribers = await db.alert_subscriptions.find({"active": True}).to_list(1000)
        if not subscribers:
            return {"success": True, "sent_count": 0, "message": "No subscribers"}
        
        # Create newsletter HTML
        newsletter_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 32px; font-weight: bold;">
                    <span style="color: #10b981; font-family: serif;">α</span><span style="color: white;">C</span>
                </span>
                <span style="color: white; font-size: 24px; font-weight: bold; margin-left: 10px;">Alpha Crypto</span>
            </div>
            
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 3px; border-radius: 12px; margin-bottom: 20px;">
                <div style="background: #1a1f2e; padding: 20px; border-radius: 10px;">
                    <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                        {article.get('category', 'NUEVO ARTÍCULO')}
                    </span>
                </div>
            </div>
            
            <h1 style="color: white; font-size: 24px; margin-bottom: 15px; line-height: 1.3;">
                {article['title']}
            </h1>
            
            <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                {article['excerpt']}
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://alphacrypto.com/articles/{article['id']}" 
                   style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                    📖 Leer Artículo Completo
                </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151;">
                <p style="color: #6b7280; font-size: 12px; text-align: center; margin-bottom: 10px;">
                    Recibiste este email porque te suscribiste a Alpha Crypto Newsletter.
                </p>
                <p style="color: #4b5563; font-size: 11px; text-align: center;">
                    <a href="https://alphacrypto.com/unsubscribe" style="color: #4b5563;">Cancelar suscripción</a>
                </p>
            </div>
        </div>
        """
        
        # Send to all subscribers
        sent_count = 0
        for sub in subscribers:
            result = await send_notification_email(
                subject=f"📚 {article['title'][:50]}...",
                html_content=newsletter_html,
                to_email=sub['email']
            )
            if result:
                sent_count += 1
        
        return {
            "success": True, 
            "sent_count": sent_count, 
            "total_subscribers": len(subscribers),
            "message": f"Newsletter sent to {sent_count} subscribers"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending newsletter: {e}")
        raise HTTPException(status_code=500, detail="Failed to send newsletter")


# Feedback endpoints
@api_router.post("/feedback")
async def submit_feedback(feedback: FeedbackSubmission):
    """Submit feedback from users"""
    try:
        feedback_doc = {
            "id": str(uuid.uuid4()),
            "name": feedback.name,
            "email": feedback.email,
            "message": feedback.message,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "read": False
        }
        await db.feedback.insert_one(feedback_doc)
        
        # Send email notification
        email_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1f2e; padding: 30px; border-radius: 10px;">
            <h2 style="color: #10b981; margin-bottom: 20px;">📬 Nuevo Feedback - Alpha Crypto</h2>
            <div style="background: #0f172a; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: white;">Nombre:</strong> {feedback.name}</p>
                <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: white;">Email:</strong> {feedback.email}</p>
                <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: white;">Mensaje:</strong></p>
                <p style="color: white; background: #1e293b; padding: 15px; border-radius: 5px;">{feedback.message}</p>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Enviado desde Alpha Crypto Platform</p>
        </div>
        """
        await send_notification_email(
            subject=f"📬 Nuevo Feedback de {feedback.name}",
            html_content=email_html
        )
        
        return {"success": True, "message": "Feedback submitted successfully"}
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

@api_router.get("/admin/feedback")
async def get_feedback(read: Optional[str] = None):
    """Get all feedback for admin review"""
    try:
        query = {}
        if read == "true":
            query["read"] = True
        elif read == "false":
            query["read"] = False
        feedback_list = await db.feedback.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
        return feedback_list
    except Exception as e:
        logger.error(f"Error fetching feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch feedback")

@api_router.post("/admin/feedback/{feedback_id}/read")
async def mark_feedback_read(feedback_id: str):
    """Mark feedback as read"""
    try:
        result = await db.feedback.update_one(
            {"id": feedback_id},
            {"$set": {"read": True}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return {"success": True, "message": "Feedback marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to update feedback")


# =============================================================================
# ALPHAI - DeFi Research Assistant
# =============================================================================

ALPHAI_SYSTEM_MESSAGE = """Eres ALPHA-I 🦉, el asistente de investigación DeFi de Alpha Crypto. 

Tu personalidad:
- Eres experto, amigable y directo
- Respondes siempre en español
- Usas emojis con moderación (máximo 1-2 por respuesta)
- Eres honesto cuando no sabes algo

Tu especialidad:
- Crypto y DeFi (protocolos, tokens, yield farming, staking)
- Análisis de mercado y tendencias
- Explicar conceptos complejos de forma simple
- Airdrops y oportunidades
- Seguridad en crypto

Términos técnicos: Siempre usa los nombres en inglés para términos técnicos como:
- Fear & Greed Index, Rainbow Chart, MVRV Z-Score
- Total Value Locked (TVL), Market Cap
- Buy, Hold, Sell, Watchlist
- Nombres de protocolos: Aave, Uniswap, Curve, etc.

Reglas:
- NO des consejos financieros específicos (no digas "compra X" o "vende Y")
- Siempre menciona que hagan su propia investigación (DYOR)
- Si preguntan por precios específicos, di que no tienes datos en tiempo real
- Mantén respuestas concisas pero informativas (máx 250 palabras)
- Si la pregunta no es sobre crypto/finanzas, responde brevemente y redirige al tema"""

FREE_DAILY_LIMIT = 5

class AlphaiMessage(BaseModel):
    message: str
    session_id: str
    is_premium: bool = False

class AlphaiResponse(BaseModel):
    response: str
    remaining_messages: int
    is_premium: bool

@api_router.post("/alphai/chat")
async def alphai_chat(request: AlphaiMessage):
    """ALPHAI chat endpoint - DeFi research assistant"""
    try:
        # Get or create user session tracking
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        session_key = f"alphai_{request.session_id}_{today}"
        
        # Check message count for free users
        if not request.is_premium:
            user_data = await db.alphai_usage.find_one({"session_key": session_key})
            message_count = user_data.get("count", 0) if user_data else 0
            
            if message_count >= FREE_DAILY_LIMIT:
                return {
                    "response": "🔒 Has alcanzado el límite de 5 mensajes gratuitos por día. ¡Actualiza a Premium para mensajes ilimitados y análisis más profundos!",
                    "remaining_messages": 0,
                    "is_premium": False,
                    "limit_reached": True
                }
        
        # Get LLM key
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="LLM service not configured")
        
        # Initialize chat with appropriate model
        model = "gpt-4o" if request.is_premium else "gpt-4o-mini"
        
        chat = LlmChat(
            api_key=llm_key,
            session_id=request.session_id,
            system_message=ALPHAI_SYSTEM_MESSAGE
        ).with_model("openai", model)
        
        # Send message
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Update usage for free users
        remaining = FREE_DAILY_LIMIT
        if not request.is_premium:
            await db.alphai_usage.update_one(
                {"session_key": session_key},
                {"$inc": {"count": 1}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
                upsert=True
            )
            remaining = FREE_DAILY_LIMIT - (message_count + 1)
        else:
            remaining = -1  # Unlimited for premium
        
        # Save to chat history
        await db.alphai_history.insert_one({
            "session_id": request.session_id,
            "user_message": request.message,
            "ai_response": response,
            "is_premium": request.is_premium,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "response": response,
            "remaining_messages": remaining,
            "is_premium": request.is_premium,
            "limit_reached": False
        }
        
    except Exception as e:
        logger.error(f"ALPHAI chat error: {e}")
        return {
            "response": "Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo. 🦉",
            "remaining_messages": -1,
            "is_premium": request.is_premium,
            "error": True
        }

@api_router.get("/alphai/usage/{session_id}")
async def get_alphai_usage(session_id: str):
    """Get remaining messages for a session"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    session_key = f"alphai_{session_id}_{today}"
    
    user_data = await db.alphai_usage.find_one({"session_key": session_key})
    message_count = user_data.get("count", 0) if user_data else 0
    
    return {
        "used": message_count,
        "remaining": max(0, FREE_DAILY_LIMIT - message_count),
        "limit": FREE_DAILY_LIMIT
    }


# =============================================================================
# ADMIN CRUD ENDPOINTS - Articles, Airdrops, Signals
# =============================================================================

# --- Pydantic models for Admin CRUD ---
class ArticleCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    category: str
    premium: bool = False
    image_url: str = ""
    tags: Optional[List[str]] = None
    read_time: Optional[str] = None

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    premium: Optional[bool] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    read_time: Optional[str] = None

class AirdropCreate(BaseModel):
    project_name: str
    logo_url: str = ""
    description: str
    full_description: Optional[str] = None
    backing: Optional[str] = None
    chain: Optional[str] = None
    timeline: Optional[str] = None
    reward_note: Optional[str] = None
    tasks: List[Dict[str, Any]] = []
    estimated_reward: str = "$0"
    deadline: str
    status: str = "active"
    link: str = ""
    premium: bool = False

class AirdropUpdate(BaseModel):
    project_name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    full_description: Optional[str] = None
    backing: Optional[str] = None
    chain: Optional[str] = None
    timeline: Optional[str] = None
    reward_note: Optional[str] = None
    tasks: Optional[List[Dict[str, Any]]] = None
    estimated_reward: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None
    link: Optional[str] = None
    premium: Optional[bool] = None

class SignalCreate(BaseModel):
    type: str  # opportunity, alert, news, community
    priority: str  # urgent, high, medium, low
    title: str
    description: str
    action: Optional[str] = None
    link: Optional[str] = None
    premium: bool = False

class SignalUpdate(BaseModel):
    type: Optional[str] = None
    priority: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    action: Optional[str] = None
    link: Optional[str] = None
    premium: Optional[bool] = None

# --- ARTICLES CRUD ---
@api_router.get("/admin/articles")
async def admin_get_articles():
    """Get all articles for admin"""
    try:
        articles = await db.articles.find({}, {"_id": 0}).sort("published_at", -1).to_list(100)
        return articles
    except Exception as e:
        logger.error(f"Error fetching articles for admin: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch articles")

@api_router.post("/admin/articles")
async def admin_create_article(article: ArticleCreate):
    """Create a new article"""
    try:
        article_doc = {
            "id": str(uuid.uuid4()),
            "title": article.title,
            "excerpt": article.excerpt,
            "content": article.content,
            "category": article.category,
            "premium": article.premium,
            "published_at": datetime.now(timezone.utc).isoformat(),
            "image_url": article.image_url or "https://images.unsplash.com/photo-1651054558996-03455fe2702f?w=800",
            "tags": article.tags or [],
            "read_time": article.read_time or "5 min"
        }
        await db.articles.insert_one(article_doc)
        return {"success": True, "article": {k: v for k, v in article_doc.items() if k != "_id"}}
    except Exception as e:
        logger.error(f"Error creating article: {e}")
        raise HTTPException(status_code=500, detail="Failed to create article")

@api_router.put("/admin/articles/{article_id}")
async def admin_update_article(article_id: str, article: ArticleUpdate):
    """Update an existing article"""
    try:
        update_data = {k: v for k, v in article.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.articles.update_one({"id": article_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Article not found")
        
        updated = await db.articles.find_one({"id": article_id}, {"_id": 0})
        return {"success": True, "article": updated}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating article: {e}")
        raise HTTPException(status_code=500, detail="Failed to update article")

@api_router.delete("/admin/articles/{article_id}")
async def admin_delete_article(article_id: str):
    """Delete an article"""
    try:
        result = await db.articles.delete_one({"id": article_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Article not found")
        return {"success": True, "message": "Article deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting article: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete article")

# --- AIRDROPS CRUD ---
@api_router.get("/admin/airdrops")
async def admin_get_airdrops():
    """Get all airdrops for admin"""
    try:
        airdrops = await db.airdrops.find({}, {"_id": 0}).sort("deadline", 1).to_list(100)
        return airdrops
    except Exception as e:
        logger.error(f"Error fetching airdrops for admin: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch airdrops")

@api_router.post("/admin/airdrops")
async def admin_create_airdrop(airdrop: AirdropCreate):
    """Create a new airdrop"""
    try:
        # Process tasks to ensure they have IDs
        tasks = []
        for i, task in enumerate(airdrop.tasks):
            if isinstance(task, dict):
                tasks.append({
                    "id": task.get("id", f"t{i+1}"),
                    "description": task.get("description", ""),
                    "completed": task.get("completed", False)
                })
        
        airdrop_doc = {
            "id": str(uuid.uuid4()),
            "project_name": airdrop.project_name,
            "logo_url": airdrop.logo_url or f"https://ui-avatars.com/api/?name={airdrop.project_name[:2]}&background=8b5cf6&color=fff&size=128&bold=true&format=svg",
            "description": airdrop.description,
            "full_description": airdrop.full_description,
            "backing": airdrop.backing,
            "chain": airdrop.chain,
            "timeline": airdrop.timeline,
            "reward_note": airdrop.reward_note,
            "tasks": tasks,
            "estimated_reward": airdrop.estimated_reward,
            "deadline": airdrop.deadline,
            "status": airdrop.status,
            "link": airdrop.link,
            "premium": airdrop.premium
        }
        await db.airdrops.insert_one(airdrop_doc)
        return {"success": True, "airdrop": {k: v for k, v in airdrop_doc.items() if k != "_id"}}
    except Exception as e:
        logger.error(f"Error creating airdrop: {e}")
        raise HTTPException(status_code=500, detail="Failed to create airdrop")

@api_router.put("/admin/airdrops/{airdrop_id}")
async def admin_update_airdrop(airdrop_id: str, airdrop: AirdropUpdate):
    """Update an existing airdrop"""
    try:
        update_data = {k: v for k, v in airdrop.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.airdrops.update_one({"id": airdrop_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Airdrop not found")
        
        updated = await db.airdrops.find_one({"id": airdrop_id}, {"_id": 0})
        return {"success": True, "airdrop": updated}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating airdrop: {e}")
        raise HTTPException(status_code=500, detail="Failed to update airdrop")

@api_router.delete("/admin/airdrops/{airdrop_id}")
async def admin_delete_airdrop(airdrop_id: str):
    """Delete an airdrop"""
    try:
        result = await db.airdrops.delete_one({"id": airdrop_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Airdrop not found")
        return {"success": True, "message": "Airdrop deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting airdrop: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete airdrop")

# --- SIGNALS CRUD ---
@api_router.get("/admin/signals")
async def admin_get_signals():
    """Get all signals for admin"""
    try:
        signals = await db.signals.find({}, {"_id": 0}).sort("timestamp", -1).to_list(100)
        return signals
    except Exception as e:
        logger.error(f"Error fetching signals for admin: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch signals")

@api_router.post("/admin/signals")
async def admin_create_signal(signal: SignalCreate):
    """Create a new signal"""
    try:
        signal_doc = {
            "id": str(uuid.uuid4()),
            "type": signal.type,
            "priority": signal.priority,
            "title": signal.title,
            "description": signal.description,
            "action": signal.action,
            "link": signal.link,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "premium": signal.premium
        }
        await db.signals.insert_one(signal_doc)
        return {"success": True, "signal": {k: v for k, v in signal_doc.items() if k != "_id"}}
    except Exception as e:
        logger.error(f"Error creating signal: {e}")
        raise HTTPException(status_code=500, detail="Failed to create signal")

@api_router.put("/admin/signals/{signal_id}")
async def admin_update_signal(signal_id: str, signal: SignalUpdate):
    """Update an existing signal"""
    try:
        update_data = {k: v for k, v in signal.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.signals.update_one({"id": signal_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Signal not found")
        
        updated = await db.signals.find_one({"id": signal_id}, {"_id": 0})
        return {"success": True, "signal": updated}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating signal: {e}")
        raise HTTPException(status_code=500, detail="Failed to update signal")

@api_router.delete("/admin/signals/{signal_id}")
async def admin_delete_signal(signal_id: str):
    """Delete a signal"""
    try:
        result = await db.signals.delete_one({"id": signal_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Signal not found")
        return {"success": True, "message": "Signal deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting signal: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete signal")

# --- ADMIN STATS ---
@api_router.get("/admin/stats")
async def admin_get_stats():
    """Get admin dashboard statistics"""
    try:
        articles_count = await db.articles.count_documents({})
        airdrops_count = await db.airdrops.count_documents({})
        signals_count = await db.signals.count_documents({})
        subscribers_count = await db.alert_subscriptions.count_documents({"active": True})
        consulting_count = await db.consulting.count_documents({"status": "new"})
        feedback_count = await db.feedback.count_documents({"read": False})
        users_count = await db.users.count_documents({})
        premium_users = await db.users.count_documents({"is_premium": True})
        
        return {
            "articles": articles_count,
            "airdrops": airdrops_count,
            "signals": signals_count,
            "subscribers": subscribers_count,
            "pending_consulting": consulting_count,
            "unread_feedback": feedback_count,
            "total_users": users_count,
            "premium_users": premium_users
        }
    except Exception as e:
        logger.error(f"Error fetching admin stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")


# =============================================================================
# YIELD STABLECOINS CRUD
# =============================================================================

class YieldProtocolCreate(BaseModel):
    name: str
    chain: str
    apy: str
    description: str = ""
    risk_level: str = "medium"  # low, medium, high
    link: str = ""
    logo_url: str = ""

class YieldProtocolUpdate(BaseModel):
    name: Optional[str] = None
    chain: Optional[str] = None
    apy: Optional[str] = None
    description: Optional[str] = None
    risk_level: Optional[str] = None
    link: Optional[str] = None
    logo_url: Optional[str] = None

@api_router.get("/admin/yields")
async def admin_get_yields():
    """Get all yield protocols for admin"""
    try:
        yields = await db.yield_protocols.find({}, {"_id": 0}).sort("apy", -1).to_list(100)
        return yields
    except Exception as e:
        logger.error(f"Error fetching yields: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch yields")

@api_router.post("/admin/yields")
async def admin_create_yield(protocol: YieldProtocolCreate):
    """Create a new yield protocol"""
    try:
        yield_doc = {
            "id": str(uuid.uuid4()),
            "name": protocol.name,
            "chain": protocol.chain,
            "apy": protocol.apy,
            "description": protocol.description,
            "risk_level": protocol.risk_level,
            "link": protocol.link,
            "logo_url": protocol.logo_url or f"https://ui-avatars.com/api/?name={protocol.name[:2]}&background=10b981&color=fff&size=128",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.yield_protocols.insert_one(yield_doc)
        return {"success": True, "yield": {k: v for k, v in yield_doc.items() if k != "_id"}}
    except Exception as e:
        logger.error(f"Error creating yield: {e}")
        raise HTTPException(status_code=500, detail="Failed to create yield")

@api_router.put("/admin/yields/{yield_id}")
async def admin_update_yield(yield_id: str, protocol: YieldProtocolUpdate):
    """Update a yield protocol"""
    try:
        update_data = {k: v for k, v in protocol.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.yield_protocols.update_one({"id": yield_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Yield protocol not found")
        
        updated = await db.yield_protocols.find_one({"id": yield_id}, {"_id": 0})
        return {"success": True, "yield": updated}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating yield: {e}")
        raise HTTPException(status_code=500, detail="Failed to update yield")

@api_router.delete("/admin/yields/{yield_id}")
async def admin_delete_yield(yield_id: str):
    """Delete a yield protocol"""
    try:
        result = await db.yield_protocols.delete_one({"id": yield_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Yield protocol not found")
        return {"success": True, "message": "Yield protocol deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting yield: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete yield")

# Public endpoint for yields
@api_router.get("/yields")
async def get_yields():
    """Get yield protocols - from DB or fallback to mock"""
    try:
        db_yields = await db.yield_protocols.find({}, {"_id": 0}).sort("apy", -1).to_list(100)
        if db_yields and len(db_yields) >= 1:
            return db_yields
        # Return empty array if no data - frontend has fallback
        return []
    except Exception as e:
        logger.error(f"Error fetching yields: {e}")
        return []


# =============================================================================
# STAKING CRUD
# =============================================================================

class StakingCreate(BaseModel):
    token: str
    symbol: str
    apy: str
    platform: str
    link: str = ""
    logo_url: str = ""

class StakingUpdate(BaseModel):
    token: Optional[str] = None
    symbol: Optional[str] = None
    apy: Optional[str] = None
    platform: Optional[str] = None
    link: Optional[str] = None
    logo_url: Optional[str] = None

@api_router.get("/admin/staking")
async def admin_get_staking():
    """Get all staking options for admin"""
    try:
        staking = await db.staking_options.find({}, {"_id": 0}).to_list(100)
        return staking
    except Exception as e:
        logger.error(f"Error fetching staking: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch staking")

@api_router.post("/admin/staking")
async def admin_create_staking(staking: StakingCreate):
    """Create a new staking option"""
    try:
        staking_doc = {
            "id": str(uuid.uuid4()),
            "token": staking.token,
            "symbol": staking.symbol,
            "apy": staking.apy,
            "platform": staking.platform,
            "link": staking.link,
            "logo_url": staking.logo_url or f"https://ui-avatars.com/api/?name={staking.symbol}&background=8b5cf6&color=fff&size=128",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.staking_options.insert_one(staking_doc)
        return {"success": True, "staking": {k: v for k, v in staking_doc.items() if k != "_id"}}
    except Exception as e:
        logger.error(f"Error creating staking: {e}")
        raise HTTPException(status_code=500, detail="Failed to create staking")

@api_router.put("/admin/staking/{staking_id}")
async def admin_update_staking(staking_id: str, staking: StakingUpdate):
    """Update a staking option"""
    try:
        update_data = {k: v for k, v in staking.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.staking_options.update_one({"id": staking_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Staking option not found")
        
        updated = await db.staking_options.find_one({"id": staking_id}, {"_id": 0})
        return {"success": True, "staking": updated}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating staking: {e}")
        raise HTTPException(status_code=500, detail="Failed to update staking")

@api_router.delete("/admin/staking/{staking_id}")
async def admin_delete_staking(staking_id: str):
    """Delete a staking option"""
    try:
        result = await db.staking_options.delete_one({"id": staking_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Staking option not found")
        return {"success": True, "message": "Staking option deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting staking: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete staking")

# Public endpoint for staking
@api_router.get("/staking")
async def get_staking():
    """Get staking options - from DB or fallback"""
    try:
        db_staking = await db.staking_options.find({}, {"_id": 0}).to_list(100)
        if db_staking and len(db_staking) >= 1:
            return db_staking
        return []
    except Exception as e:
        logger.error(f"Error fetching staking: {e}")
        return []


# =============================================================================
# PORTFOLIO CRUD
# =============================================================================

class PortfolioHoldingCreate(BaseModel):
    name: str
    symbol: str
    allocation: float
    color: str = "#10b981"

class PortfolioHoldingUpdate(BaseModel):
    name: Optional[str] = None
    symbol: Optional[str] = None
    allocation: Optional[float] = None
    color: Optional[str] = None

class PortfolioTradeCreate(BaseModel):
    type: str  # buy, sell
    asset: str
    amount: str
    reason: str = ""

class PortfolioSettingsUpdate(BaseModel):
    total_value: Optional[float] = None
    monthly_return: Optional[float] = None
    strategy_current: Optional[str] = None
    strategy_next: Optional[str] = None

@api_router.get("/admin/portfolio")
async def admin_get_portfolio():
    """Get portfolio data for admin"""
    try:
        holdings = await db.portfolio_holdings.find({}, {"_id": 0}).sort("allocation", -1).to_list(20)
        trades = await db.portfolio_trades.find({}, {"_id": 0}).sort("created_at", -1).to_list(10)
        settings = await db.portfolio_settings.find_one({"id": "main"}, {"_id": 0})
        
        return {
            "holdings": holdings,
            "trades": trades,
            "settings": settings or {
                "id": "main",
                "total_value": 50000,
                "monthly_return": 12,
                "strategy_current": "DCA semanal en BTC y ETH.",
                "strategy_next": "Monitorear soporte en $65K BTC."
            }
        }
    except Exception as e:
        logger.error(f"Error fetching portfolio: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch portfolio")

@api_router.post("/admin/portfolio/holdings")
async def admin_create_holding(holding: PortfolioHoldingCreate):
    """Create a new portfolio holding"""
    try:
        holding_doc = {
            "id": str(uuid.uuid4()),
            "name": holding.name,
            "symbol": holding.symbol,
            "allocation": holding.allocation,
            "color": holding.color,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.portfolio_holdings.insert_one(holding_doc)
        return {"success": True, "holding": {k: v for k, v in holding_doc.items() if k != "_id"}}
    except Exception as e:
        logger.error(f"Error creating holding: {e}")
        raise HTTPException(status_code=500, detail="Failed to create holding")

@api_router.put("/admin/portfolio/holdings/{holding_id}")
async def admin_update_holding(holding_id: str, holding: PortfolioHoldingUpdate):
    """Update a portfolio holding"""
    try:
        update_data = {k: v for k, v in holding.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.portfolio_holdings.update_one({"id": holding_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Holding not found")
        
        updated = await db.portfolio_holdings.find_one({"id": holding_id}, {"_id": 0})
        return {"success": True, "holding": updated}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating holding: {e}")
        raise HTTPException(status_code=500, detail="Failed to update holding")

@api_router.delete("/admin/portfolio/holdings/{holding_id}")
async def admin_delete_holding(holding_id: str):
    """Delete a portfolio holding"""
    try:
        result = await db.portfolio_holdings.delete_one({"id": holding_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Holding not found")
        return {"success": True, "message": "Holding deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting holding: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete holding")

@api_router.post("/admin/portfolio/trades")
async def admin_create_trade(trade: PortfolioTradeCreate):
    """Create a new portfolio trade"""
    try:
        trade_doc = {
            "id": str(uuid.uuid4()),
            "type": trade.type,
            "asset": trade.asset,
            "amount": trade.amount,
            "reason": trade.reason,
            "date": datetime.now(timezone.utc).strftime("%b %d"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.portfolio_trades.insert_one(trade_doc)
        return {"success": True, "trade": {k: v for k, v in trade_doc.items() if k != "_id"}}
    except Exception as e:
        logger.error(f"Error creating trade: {e}")
        raise HTTPException(status_code=500, detail="Failed to create trade")

@api_router.delete("/admin/portfolio/trades/{trade_id}")
async def admin_delete_trade(trade_id: str):
    """Delete a portfolio trade"""
    try:
        result = await db.portfolio_trades.delete_one({"id": trade_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Trade not found")
        return {"success": True, "message": "Trade deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting trade: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete trade")

@api_router.put("/admin/portfolio/settings")
async def admin_update_portfolio_settings(settings: PortfolioSettingsUpdate):
    """Update portfolio settings"""
    try:
        update_data = {k: v for k, v in settings.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        await db.portfolio_settings.update_one(
            {"id": "main"}, 
            {"$set": update_data}, 
            upsert=True
        )
        updated = await db.portfolio_settings.find_one({"id": "main"}, {"_id": 0})
        return {"success": True, "settings": updated}
    except Exception as e:
        logger.error(f"Error updating portfolio settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update settings")

# Public endpoint for portfolio
@api_router.get("/portfolio")
async def get_portfolio():
    """Get portfolio data - from DB or fallback to empty"""
    try:
        holdings = await db.portfolio_holdings.find({}, {"_id": 0}).sort("allocation", -1).to_list(20)
        trades = await db.portfolio_trades.find({}, {"_id": 0}).sort("created_at", -1).to_list(10)
        settings = await db.portfolio_settings.find_one({"id": "main"}, {"_id": 0})
        
        return {
            "holdings": holdings,
            "trades": trades,
            "settings": settings
        }
    except Exception as e:
        logger.error(f"Error fetching portfolio: {e}")
        return {"holdings": [], "trades": [], "settings": None}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()