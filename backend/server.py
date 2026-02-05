from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import aiohttp
from sanity_client import (
    get_articles as sanity_get_articles, 
    get_article_by_slug as sanity_get_article_by_slug,
    get_article_by_id as sanity_get_article_by_id, 
    get_airdrops as sanity_get_airdrops, 
    get_airdrop_by_id as sanity_get_airdrop_by_id,
    get_signals as sanity_get_signals
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
    premium: bool
    published_at: str
    image_url: str

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
    difficulty: str
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
            "title": "Stablecoins: La Revolución Silenciosa del Sistema Financiero",
            "excerpt": "Stripe, Visa y Mastercard se unen a la revolución. Los bancos adoptan stablecoins y las remesas nunca fueron más baratas.",
            "content": """Las stablecoins están transformando silenciosamente el sistema financiero global. En los últimos meses, gigantes como Stripe, Visa y Mastercard han anunciado integraciones con USDC y otras stablecoins, marcando un punto de inflexión histórico.

**Los números no mienten:**
- Volumen de transacciones en stablecoins: $7.4 trillones en 2024
- Crecimiento interanual: +156%
- Costo promedio de remesa con stablecoins: 0.5% (vs 6.2% tradicional)

**¿Por qué las stablecoins son importantes?**

Las stablecoins resuelven el problema de volatilidad de las criptomonedas tradicionales. Al estar vinculadas 1:1 con el dólar u otras monedas fiat, permiten a usuarios y empresas aprovechar la velocidad y eficiencia de blockchain sin exposición a fluctuaciones de precio.

**Adopción institucional acelerada:**

Stripe lanzó pagos en USDC para merchants globales. Visa procesa más de $1 billón mensual en settlements con stablecoins. Los bancos tradicionales como JPMorgan y HSBC están experimentando con stablecoins propias.

PayPal lanzó PYUSD, su propia stablecoin en Ethereum y Solana. Circle (emisor de USDC) alcanzó una valoración de $9 billones. Tether (USDT) reportó ganancias récord de $4.5 billones en 2024.

**El impacto en remesas:**

Para Latinoamérica, esto es revolucionario. Enviar dinero de EE.UU. a México o Colombia ahora cuesta centavos en lugar de decenas de dólares. El tiempo de transferencia pasó de días a segundos.

Las remesas globales representan $700 billones anuales. Con stablecoins, los trabajadores migrantes pueden ahorrar hasta el 90% en fees de transferencia.

**Regulación:**

Los reguladores están siguiendo de cerca estos desarrollos. La aprobación de MiCA en Europa y las nuevas regulaciones en EE.UU. sugieren que las stablecoins serán el puente entre las finanzas tradicionales y cripto.

**Oportunidades de inversión:**

- Circle (USDC): La stablecoin más transparente, con auditorías mensuales
- Tokens de infraestructura que facilitan stablecoins (Ethereum, Solana)
- Protocolos DeFi que ofrecen yield en stablecoins (Aave, Compound)

**Conclusión:**

Las stablecoins no son solo una herramienta de trading. Son la infraestructura financiera del futuro. Los inversores inteligentes están posicionándose en el ecosistema alrededor de estos activos.""",
            "category": "Stablecoins",
            "premium": False,
            "published_at": "2024-02-01T10:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1670367248899-a7d385c732b5?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
        },
        {
            "id": "2",
            "title": "AI Agents y la Economía del Futuro",
            "excerpt": "El protocolo x402, Ethereum como backbone, y cómo los agentes de IA están creando una nueva economía autónoma.",
            "content": """Los AI Agents están dejando de ser ciencia ficción para convertirse en actores económicos reales. El surgimiento del protocolo x402 en Ethereum marca el inicio de una nueva era donde las máquinas no solo ejecutan tareas, sino que participan activamente en la economía.

**¿Qué son los AI Agents en crypto?**

Son programas de inteligencia artificial que pueden poseer wallets, ejecutar transacciones, y operar de forma autónoma en blockchains. No necesitan intermediarios humanos para actuar. Pueden ganar, gastar e invertir recursos digitales de manera independiente.

**El protocolo x402:**

Desarrollado sobre Ethereum, x402 permite que los agentes de IA realicen micropagos automáticos por servicios computacionales. Imagina AIs pagándose entre sí por procesamiento, datos, o API calls. Es HTTP pero con pagos nativos.

Este protocolo abre la puerta a una economía machine-to-machine (M2M) donde billones de transacciones ocurren sin intervención humana.

**Casos de uso emergentes:**

- Trading bots que reinvierten sus propias ganancias
- Agentes de soporte 24/7 que pagan por servicios cuando los necesitan
- Sistemas de gobernanza delegados a IA para DAOs
- Creación automatizada de contenido con monetización instantánea
- Agentes que negocian precios y ejecutan contratos automáticamente

**El tamaño de la oportunidad:**

Se estima que para 2030, los AI agents gestionarán más de $100 billones en activos digitales. Las redes que soporten esta infraestructura (Ethereum, Solana, etc.) capturarán valor significativo.

**Cómo aprovechar esta tendencia:**

1. Invertir en tokens de infraestructura (Ethereum, Chainlink para oracles)
2. Participar en protocolos de AI agents como Fetch.ai, Ocean Protocol
3. Desarrollar o utilizar herramientas que integren IA con smart contracts
4. Prestar atención a proyectos que construyen la "economía agentic"

**Proyectos a seguir:**

- Autonolas: Framework para agentes autónomos
- Morpheus: Red de AI agents descentralizada
- ChainGPT: IA especializada en blockchain
- Fetch.ai: Infraestructura para economía multi-agente
- SingularityNET: Marketplace de servicios de IA

**Riesgos a considerar:**

- Regulación incierta sobre IA autónoma con capacidad financiera
- Vulnerabilidades de seguridad en smart contracts
- Concentración de poder si pocos actores controlan los agentes más poderosos

**Conclusión:**

La economía agentic apenas comienza. Los primeros en entender y posicionarse tendrán ventaja significativa. No se trata solo de especular con tokens, sino de entender cómo la IA transformará la economía digital.""",
            "category": "AI",
            "premium": True,
            "published_at": "2024-01-30T15:30:00Z",
            "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
        },
        {
            "id": "3",
            "title": "¿Qué está pasando en Crypto en 2026?",
            "excerpt": "Un panorama completo del mercado: conflictos regulatorios, avances tecnológicos, minería y adopción institucional.",
            "content": """El mercado cripto en 2026 presenta un panorama de contrastes fascinantes. Por un lado, avances tecnológicos sin precedentes; por otro, batallas regulatorias que definen el futuro de la industria.

**Estado del mercado:**

- Bitcoin dominance: 52%
- Total market cap: $2.4 trillones
- Volumen diario: $85 billones
- Usuarios activos de DeFi: 15 millones+

**El ciclo de halving:**

El halving de Bitcoin de 2024 redujo la recompensa de bloque de 6.25 a 3.125 BTC. Históricamente, esto precede rally alcistas de 12-18 meses. El modelo stock-to-flow sugiere targets de $100K-150K para BTC.

**Conflictos regulatorios actuales:**

La SEC continúa su batalla legal con exchanges, pero perdió casos importantes contra Grayscale y Ripple. La aprobación de ETFs de Bitcoin spot marcó un antes y después. Europa avanza con MiCA mientras Asia lidera en adopción.

Hong Kong y Dubai se posicionan como hubs crypto-friendly. EE.UU. debate si perderá su liderazgo financiero por regulación excesiva.

**Avances en minería:**

- El hashrate de Bitcoin alcanzó nuevos máximos (600+ EH/s)
- Tendencia hacia energías renovables (48% del mining usa energía limpia)
- ASIC de nueva generación reducen costos operativos en 30%
- Mining pools descentralizados ganan tracción

**Adopción institucional:**

BlackRock, Fidelity, y otros gigantes tradicionales ahora ofrecen productos crypto. Los fondos de pensión europeos comienzan a diversificar con Bitcoin (máximo 2% del portfolio).

Los ETFs de Bitcoin acumulan más de $50 billones en AUM en su primer año. MicroStrategy tiene 200,000+ BTC en su balance.

**Desarrollos técnicos clave:**

- Ethereum completó sus upgrades de escalabilidad (Proto-danksharding)
- Layer 2s procesan más transacciones que Ethereum mainnet
- Solana recuperó credibilidad tras mejoras de uptime
- Cross-chain bridges más seguros gracias a nuevos estándares
- Bitcoin Ordinals y inscripciones revivieron el interés en BTC

**Sectores con momentum:**

1. Real World Assets (RWA): Tokenización de deuda, inmuebles, commodities
2. DePIN: Infraestructura física descentralizada
3. AI x Crypto: Proyectos que combinan ambas tendencias
4. Gaming: Grandes estudios entrando a Web3

**Perspectivas:**

El mercado está en fase de maduración. Los proyectos sin fundamentos sólidos desaparecen mientras la infraestructura seria atrae capital institucional. La narrativa ha cambiado: de especulación a utilidad real.

**Para inversores:**

Focus en fundamentales, no en hype. Las oportunidades están en infraestructura, stablecoins, y proyectos con revenue real. Diversificar entre BTC (reserva de valor), ETH (plataforma dominante), y altcoins selectas (5-10% máximo del portfolio).""",
            "category": "Analysis",
            "premium": False,
            "published_at": "2024-01-28T09:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1642790106117-e829e14a795f?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
        },
        {
            "id": "4",
            "title": "DeFi 2.0: Protocolos con Yield Real",
            "excerpt": "Guía completa de los protocolos DeFi que generan rendimiento sostenible y real.",
            "content": """El DeFi ha madurado significativamente desde el "DeFi Summer" de 2020. Los yields inflados por emisiones de tokens dieron paso a protocolos con revenue real y tokenomics sostenibles.

**La evolución de DeFi:**

DeFi 1.0 ofrecía yields de 1000%+ APY pagados en tokens que se devaluaban rápidamente. DeFi 2.0 prioriza ingresos reales: fees de trading, intereses de préstamos, y servicios con demanda orgánica.

**Protocolos con Revenue Real:**

1. **GMX/GLP (Arbitrum/Avalanche):**
   - Revenue: Fees de trading de perpetuos
   - Yield: 15-25% APR en stablecoins
   - Holders de GMX reciben 30% de fees del protocolo

2. **Aave/Compound:**
   - Revenue: Intereses de préstamos
   - Yield: 3-8% APR variable
   - Los más seguros y probados

3. **Lido (Ethereum):**
   - Revenue: Recompensas de staking de ETH
   - Yield: 4-5% APR
   - Mayor protocolo de liquid staking

4. **Pendle (Multi-chain):**
   - Revenue: Trading de yield tokens
   - Permite especular/hedge en yields futuros
   - Innovación en yield tokenization

**Estrategias de bajo riesgo:**

- Stablecoins en Aave: 3-5% APR
- ETH staking vía Lido: ~4% APR
- GLP (GMX) para yield en stables: 15-20% APR

**Estrategias de riesgo moderado:**

- Liquidity providing en pools de alta demanda
- Yield farming en protocolos establecidos
- Leverage farming con gestión activa de riesgo

**Métricas clave a evaluar:**

- Revenue real (no emisiones inflacionarias)
- TVL estable o creciente
- Auditorías de seguridad múltiples
- Historial sin exploits mayores
- Tokenomics con value accrual

**Riesgos de DeFi:**

- Smart contract bugs/exploits
- Impermanent loss en LPs
- Oracle manipulation
- Regulatory uncertainty

**Conclusión:**

DeFi ofrece oportunidades genuinas de yield, pero requiere due diligence. Prioriza protocolos con track record, auditorías, y revenue real sobre yields inflados por emisiones.""",
            "category": "DeFi",
            "premium": True,
            "published_at": "2024-01-25T14:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1543358021-87eba7df3eb5?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
        },
        {
            "id": "5",
            "title": "Layer 2 Wars: Arbitrum vs Optimism vs Base",
            "excerpt": "Análisis comparativo de los principales L2s y cuál ofrece mejores oportunidades de inversión.",
            "content": """Los Layer 2s de Ethereum dominan el landscape de escalabilidad. Arbitrum, Optimism y Base compiten por usuarios, desarrolladores y TVL. ¿Cuál ofrece mejores oportunidades?

**¿Por qué Layer 2s?**

Ethereum mainnet es seguro pero caro y lento (~15 TPS). Los L2s procesan transacciones off-chain y publican pruebas en Ethereum, heredando su seguridad con 10-100x menos costo.

**Arbitrum:**

- TVL: $12+ billones (líder indiscutible)
- Token: ARB
- Tecnología: Optimistic Rollup
- Ecosistema: GMX, Camelot, Radiant, +400 protocolos
- Fortaleza: Ecosistema DeFi más maduro

**Optimism:**

- TVL: $6+ billones
- Token: OP
- Tecnología: Optimistic Rollup
- Ecosistema: Velodrome, Synthetix, +200 protocolos
- Fortaleza: Superchain vision (Base, Zora usan su stack)

**Base:**

- TVL: $4+ billones
- Token: No tiene (respaldado por Coinbase)
- Tecnología: OP Stack
- Ecosistema: Aerodrome, Degen, memecoins
- Fortaleza: Onboarding desde Coinbase

**Comparación de costos (tx promedio):**

- Ethereum mainnet: $5-50
- Arbitrum: $0.05-0.20
- Optimism: $0.05-0.15
- Base: $0.01-0.10

**¿Cuál elegir para inversión?**

**Arbitrum (ARB):**
- Mayor ecosistema y volumen
- Token ya lanzado, menor upside de airdrop
- Mejor para DeFi serio

**Optimism (OP):**
- Superchain narrative (múltiples L2s usando su tech)
- Revenue sharing con chains que adoptan OP Stack
- Retroactive Public Goods Funding atrae desarrolladores

**Base:**
- Sin token propio (backed by Coinbase)
- Mejor para usuarios nuevos
- Potencial de airdrop si lanzan token

**Estrategia recomendada:**

1. Usa los tres para diversificar exposición
2. Mantén posiciones en ARB y OP
3. Farmea actividad en Base por posible airdrop
4. Presta atención a nuevos L2s (zkSync, Scroll, Linea)

**El futuro:**

Los L2s continuarán absorbiendo actividad de Ethereum mainnet. La competencia beneficia a usuarios con menores costos. El ganador a largo plazo será quien atraiga más desarrolladores y mantenga mejor seguridad.""",
            "category": "Technology",
            "premium": False,
            "published_at": "2024-01-20T11:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1666624833516-6d0e320c610d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
        }
    ]

def get_mock_airdrops():
    return [
        {
            "id": "1",
            "project_name": "Hyena Trade",
            "logo_url": "https://ui-avatars.com/api/?name=HT&background=10b981&color=fff&size=128&bold=true&format=svg",
            "chain": "Arbitrum",
            "description": "Perpetuals DEX en Arbitrum con fees competitivos y trading con apalancamiento",
            "full_description": "Hyena Trade es un exchange de perpetuos descentralizado en Arbitrum que ofrece hasta 50x de apalancamiento. Conocido por sus bajos fees y ejecución rápida. Sin airdrop confirmado pero fuertes indicios del equipo.",
            "backing": "Respaldado por VCs líderes en DeFi, equipo experimentado de TradFi",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Conectar wallet y completar KYC (si es requerido)", "completed": False},
                {"id": "t2", "description": "Hacer tu primer trade (mín $100 volumen)", "completed": False},
                {"id": "t3", "description": "Tradear al menos 3 pares diferentes", "completed": False},
                {"id": "t4", "description": "Proveer liquidez a cualquier pool", "completed": False}
            ],
            "estimated_reward": "$500-2000",
            "difficulty": "Medium",
            "deadline": "2024-06-30T23:59:59Z",
            "status": "active",
            "link": "https://app.hyena.trade/ref/ALPHACRYPTO",
            "premium": False,
            "timeline": "Esperado Q2 2024"
        },
        {
            "id": "2",
            "project_name": "Extended Exchange",
            "logo_url": "https://ui-avatars.com/api/?name=EX&background=6366f1&color=fff&size=128&bold=true&format=svg",
            "chain": "Arbitrum",
            "description": "Plataforma avanzada de perpetuos con características únicas y APRs competitivos",
            "full_description": "Extended Exchange está construyendo la próxima generación de trading de perpetuos con características innovadoras como estrategias de vaults y social trading. Fuertes indicios de airdrop de la comunidad.",
            "backing": "Seed round de VCs crypto de primer nivel, equipo de Binance y FTX",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Registrarse usando código de referido: TOMDEFI", "completed": False},
                {"id": "t2", "description": "Completar al menos $500 en volumen de trading", "completed": False},
                {"id": "t3", "description": "Usar estrategias de vault (depositar mín $100)", "completed": False},
                {"id": "t4", "description": "Tradear por 5+ días consecutivos", "completed": False}
            ],
            "estimated_reward": "$1000-3000",
            "difficulty": "Medium",
            "deadline": "2024-07-15T23:59:59Z",
            "status": "active",
            "link": "https://app.extended.exchange/join/TOMDEFI",
            "premium": False,
            "timeline": "Esperado Q3 2024"
        },
        {
            "id": "3",
            "project_name": "GRVT",
            "logo_url": "https://ui-avatars.com/api/?name=GR&background=8b5cf6&color=fff&size=128&bold=true&format=svg",
            "chain": "zkSync",
            "description": "DEX híbrido de grado institucional en zkSync con rendimiento tipo CEX",
            "full_description": "GRVT combina lo mejor de CEX y DEX: auto-custodia con velocidad y liquidez institucional. Construido sobre zkSync Era con respaldo de VCs crypto importantes. Lanzamiento de token confirmado.",
            "backing": "Respaldado por Paradigm, Variant, Robot Ventures - $7M raised",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Crear cuenta con referido: tomd411", "completed": False},
                {"id": "t2", "description": "Completar verificación de identidad", "completed": False},
                {"id": "t3", "description": "Hacer al menos 10 trades (cualquier tamaño)", "completed": False},
                {"id": "t4", "description": "Mantener actividad de trading por 30 días", "completed": False}
            ],
            "estimated_reward": "$2000-5000",
            "difficulty": "Easy",
            "deadline": "2024-08-31T23:59:59Z",
            "status": "active",
            "link": "https://grvt.io",
            "premium": True,
            "timeline": "Lanzamiento de token Q3 2024"
        },
        {
            "id": "4",
            "project_name": "Based.one",
            "logo_url": "https://ui-avatars.com/api/?name=B1&background=3b82f6&color=fff&size=128&bold=true&format=svg",
            "chain": "Base",
            "description": "DEX nativo de perpetuos en Base con bajos fees y alto apalancamiento",
            "full_description": "Based.one es la plataforma líder de perps en Base L2, ofreciendo hasta 100x de apalancamiento con fees mínimos. Comunidad fuerte y altos volúmenes de trading indican probable airdrop.",
            "backing": "Impulsado por la comunidad, partnerships con proyectos del ecosistema Base",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Conectar wallet usando ref: TOMDEFI", "completed": False},
                {"id": "t2", "description": "Tradear al menos $1000 volumen", "completed": False},
                {"id": "t3", "description": "Probar trading con apalancamiento (5x o más)", "completed": False},
                {"id": "t4", "description": "Invitar a 2 amigos a tradear", "completed": False}
            ],
            "estimated_reward": "$800-2500",
            "difficulty": "Medium",
            "deadline": "2024-07-31T23:59:59Z",
            "status": "active",
            "link": "https://app.based.one/r/TOMDEFI",
            "premium": False,
            "timeline": "Esperado Q2-Q3 2024"
        },
        {
            "id": "5",
            "project_name": "Backpack",
            "logo_url": "https://ui-avatars.com/api/?name=BP&background=14b8a6&color=fff&size=128&bold=true&format=svg",
            "chain": "Solana",
            "description": "El exchange principal de Solana del equipo de Mad Lads con token confirmado",
            "full_description": "Backpack está construido por el equipo detrás de Mad Lads NFT (Coral/xNFT). Recientemente levantó $17M y confirmó lanzamiento de token. Uno de los airdrops más anticipados de Solana.",
            "backing": "Respaldado por Jump, Placeholder, $17M Serie A",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Registrarse con código de referido", "completed": False},
                {"id": "t2", "description": "Completar verificación KYC", "completed": False},
                {"id": "t3", "description": "Tradear al menos $500 volumen", "completed": False},
                {"id": "t4", "description": "Tener xNFT o Mad Lads (bonus)", "completed": False}
            ],
            "estimated_reward": "$1500-4000",
            "difficulty": "Easy",
            "deadline": "2024-09-30T23:59:59Z",
            "status": "active",
            "link": "https://backpack.exchange/join/da5e1eb4-cbc1-4faf-afa6-9f11e80ce47a",
            "premium": True,
            "timeline": "Lanzamiento Q3 2024 confirmado"
        },
        {
            "id": "6",
            "project_name": "Avantis",
            "logo_url": "https://ui-avatars.com/api/?name=AV&background=f59e0b&color=fff&size=128&bold=true&format=svg",
            "chain": "Base",
            "description": "DEX de perps en Base con modelo de airdrop probado y trading competitivo",
            "full_description": "Avantis tiene un historial probado de recompensar a usuarios tempranos. Ofrece trading de perpetuos con estrategias únicas de vault. Fuertes indicios de lanzamiento de token con generosa asignación de airdrop.",
            "backing": "Incubado por VCs líderes del ecosistema Base",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Registrarse con código: tomdefi", "completed": False},
                {"id": "t2", "description": "Hacer primer trade (cualquier par)", "completed": False},
                {"id": "t3", "description": "Depositar en estrategias de vault", "completed": False},
                {"id": "t4", "description": "Tradear semanalmente por 1 mes", "completed": False}
            ],
            "estimated_reward": "$1200-3500",
            "difficulty": "Medium",
            "deadline": "2024-08-15T23:59:59Z",
            "status": "active",
            "link": "https://www.avantisfi.com/referral?code=tomdefi",
            "premium": False,
            "timeline": "Esperado Q3 2024"
        },
        {
            "id": "7",
            "project_name": "StandX",
            "logo_url": "https://ui-avatars.com/api/?name=SX&background=ec4899&color=fff&size=128&bold=true&format=svg",
            "chain": "Multi-chain",
            "description": "Plataforma de perpetuos cross-chain con características de trading innovadoras",
            "full_description": "StandX ofrece trading de perpetuos a través de múltiples chains con liquidez unificada. Conocido por bajo slippage y alta eficiencia de capital. El equipo ha insinuado recompensas de token para adoptadores tempranos.",
            "backing": "Respaldado por angels prominentes de DeFi y DAOs",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Registrarse con referido: tomdefi", "completed": False},
                {"id": "t2", "description": "Tradear en al menos 2 chains diferentes", "completed": False},
                {"id": "t3", "description": "Alcanzar $2000+ de volumen total", "completed": False},
                {"id": "t4", "description": "Participar en competencias de trading", "completed": False}
            ],
            "estimated_reward": "$1000-3000",
            "difficulty": "Hard",
            "deadline": "2024-07-31T23:59:59Z",
            "status": "active",
            "link": "https://standx.com/referral?code=tomdefi",
            "premium": True,
            "timeline": "Esperado Q2-Q3 2024"
        },
        {
            "id": "8",
            "project_name": "Variational",
            "logo_url": "https://ui-avatars.com/api/?name=VA&background=a855f7&color=fff&size=128&bold=true&format=svg",
            "chain": "Omni-chain",
            "description": "DEX de perpetuos omni-chain con tipos de órdenes avanzados",
            "full_description": "Variational permite trading de perpetuos a través de múltiples chains con una interfaz unificada. Presenta tipos de órdenes avanzados y herramientas de gestión de riesgo típicamente encontradas en CEXs.",
            "backing": "Seed funding de VCs crypto-nativos",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Conectar wallet y empezar a tradear", "completed": False},
                {"id": "t2", "description": "Tradear perpetuos de SOL", "completed": False},
                {"id": "t3", "description": "Usar tipos de órdenes avanzados", "completed": False},
                {"id": "t4", "description": "Mantener $500+ de volumen de trading", "completed": False}
            ],
            "estimated_reward": "$600-1800",
            "difficulty": "Medium",
            "deadline": "2024-06-30T23:59:59Z",
            "status": "active",
            "link": "https://omni.variational.io/perpetual/SOL",
            "premium": False,
            "timeline": "Esperado Q2 2024"
        },
        {
            "id": "9",
            "project_name": "Pacifica",
            "logo_url": "https://ui-avatars.com/api/?name=PA&background=06b6d4&color=fff&size=128&bold=true&format=svg",
            "chain": "Solana",
            "description": "Plataforma de perps de próxima generación en Solana con estrategias de vault y social trading",
            "full_description": "Pacifica combina trading de perpetuos con estrategias innovadoras de vault en Solana. Conocido por ejecución ultrarrápida y bajos fees. Fuerte crecimiento de la comunidad indica lanzamiento inminente de token.",
            "backing": "Respaldado por Solana Foundation y fondos del ecosistema",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Registrarse con referido: tomdefi", "completed": False},
                {"id": "t2", "description": "Hacer tu primer trade de SOL-PERP", "completed": False},
                {"id": "t3", "description": "Depositar en yield vaults", "completed": False},
                {"id": "t4", "description": "Seguir top traders (función social)", "completed": False}
            ],
            "estimated_reward": "$1000-2800",
            "difficulty": "Easy",
            "deadline": "2024-08-31T23:59:59Z",
            "status": "active",
            "link": "https://app.pacifica.fi?referral=tomdefi",
            "premium": False,
            "timeline": "Esperado Q3 2024"
        },
        {
            "id": "10",
            "project_name": "Hibachi",
            "logo_url": "https://ui-avatars.com/api/?name=HI&background=eab308&color=fff&size=128&bold=true&format=svg",
            "chain": "Blast",
            "description": "DEX nativo en Blast L2 con sistema de puntos y oportunidades de yield",
            "full_description": "Hibachi está construyendo la plataforma de trading principal en Blast L2. Se beneficia del yield nativo de Blast y sistema de puntos. Fase de adopción temprana con generosas recompensas esperadas.",
            "backing": "Grants del ecosistema Blast e inversores ángeles",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Conectar con referido: alphacrypto", "completed": False},
                {"id": "t2", "description": "Bridge de activos a Blast", "completed": False},
                {"id": "t3", "description": "Completar $300+ en trades", "completed": False},
                {"id": "t4", "description": "Ganar puntos Blast a través de trading", "completed": False}
            ],
            "estimated_reward": "$800-2200",
            "difficulty": "Medium",
            "deadline": "2024-07-15T23:59:59Z",
            "status": "active",
            "link": "https://hibachi.xyz/r/alphacrypto",
            "premium": False,
            "timeline": "Esperado Q2 2024"
        },
        {
            "id": "11",
            "project_name": "Reya",
            "logo_url": "https://ui-avatars.com/api/?name=RE&background=ef4444&color=fff&size=128&bold=true&format=svg",
            "chain": "Reya Network (L2)",
            "description": "L2 modular optimizado para trading con respaldo institucional",
            "full_description": "Reya Network es un L2 modular construido específicamente para trading y DeFi. Levantó financiamiento significativo y confirmó token. Uno de los airdrops más anticipados con potencialmente grandes asignaciones para usuarios tempranos.",
            "backing": "Respaldado por Framework, Coinbase Ventures - $10M+ raised",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Registrarse con referido: roxzmgsj", "completed": False},
                {"id": "t2", "description": "Bridge a Reya Network", "completed": False},
                {"id": "t3", "description": "Tradear perpetuos (mín $1000 volumen)", "completed": False},
                {"id": "t4", "description": "Usar pools de liquidez", "completed": False}
            ],
            "estimated_reward": "$2000-5000",
            "difficulty": "Medium",
            "deadline": "2024-09-30T23:59:59Z",
            "status": "active",
            "link": "https://app.reya.xyz/trade?referredBy=roxzmgsj",
            "premium": True,
            "timeline": "Lanzamiento de token Q3-Q4 2024"
        },
        {
            "id": "12",
            "project_name": "Ostium",
            "logo_url": "https://ui-avatars.com/api/?name=OS&background=84cc16&color=fff&size=128&bold=true&format=svg",
            "chain": "Arbitrum",
            "description": "Plataforma de perpetuos de RWA y crypto con ofertas de activos únicas",
            "full_description": "Ostium permite trading de perpetuos tanto tradicionales (RWA) como crypto en Arbitrum. Oferta única incluye acciones, forex y commodities junto con crypto. Fuerte interés institucional.",
            "backing": "Respaldado por VCs enfocados en RWA y partners de finanzas tradicionales",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Registrarse con ref: 01XAZ", "completed": False},
                {"id": "t2", "description": "Tradear perpetuos de SPX (S&P 500)", "completed": False},
                {"id": "t3", "description": "Tradear al menos 3 pares crypto", "completed": False},
                {"id": "t4", "description": "Alcanzar $1500+ de volumen total", "completed": False}
            ],
            "estimated_reward": "$1200-3500",
            "difficulty": "Medium",
            "deadline": "2024-08-31T23:59:59Z",
            "status": "active",
            "link": "https://app.ostium.com/trade?from=SPX&to=USD&ref=01XAZ",
            "premium": False,
            "timeline": "Esperado Q3 2024"
        },
        {
            "id": "13",
            "project_name": "Ethereal",
            "logo_url": "https://ui-avatars.com/api/?name=ET&background=6d28d9&color=fff&size=128&bold=true&format=svg",
            "chain": "Ethereum",
            "description": "Plataforma de trading descentralizada en Ethereum mainnet",
            "full_description": "Ethereal es un exchange descentralizado en Ethereum ofreciendo trading de perpetuos con características innovadoras. Construido por un equipo experimentado con fuerte enfoque en seguridad y experiencia de usuario.",
            "backing": "Proyecto respaldado por la comunidad con base de usuarios creciente",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Conectar wallet de Ethereum", "completed": False},
                {"id": "t2", "description": "Hacer tu primer trade", "completed": False},
                {"id": "t3", "description": "Alcanzar $500 de volumen de trading", "completed": False},
                {"id": "t4", "description": "Unirse a la comunidad Discord", "completed": False}
            ],
            "estimated_reward": "$500-2000",
            "difficulty": "Medium",
            "deadline": "2024-12-31T23:59:59Z",
            "status": "active",
            "link": "https://app.ethereal.trade",
            "premium": False,
            "timeline": "Esperado Q4 2024"
        },
        {
            "id": "14",
            "project_name": "Paradex",
            "logo_url": "https://ui-avatars.com/api/?name=PX&background=f97316&color=fff&size=128&bold=true&format=svg",
            "chain": "Starknet",
            "description": "DEX de perpetuos respaldado por Paradigm en Starknet con enfoque institucional",
            "full_description": "Paradex está construido en Starknet con respaldo de Paradigm (uno de los top VCs de crypto). Ofrece trading de perpetuos de grado institucional con auto-custodia. Lanzamiento de token confirmado para 2024.",
            "backing": "Respaldado por Paradigm - respaldo de VC importante asegura fuerte valor del token",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Crear cuenta en Paradex", "completed": False},
                {"id": "t2", "description": "Completar verificación de identidad", "completed": False},
                {"id": "t3", "description": "Hacer al menos 5 trades", "completed": False},
                {"id": "t4", "description": "Tradear múltiples pares", "completed": False}
            ],
            "estimated_reward": "$1500-4000",
            "difficulty": "Easy",
            "deadline": "2024-09-15T23:59:59Z",
            "status": "active",
            "link": "https://app.paradex.trade/r/collaborativeclaimerr",
            "premium": True,
            "timeline": "Lanzamiento Q3 2024 confirmado"
        },
        {
            "id": "15",
            "project_name": "Lighter",
            "logo_url": "https://ui-avatars.com/api/?name=LI&background=22c55e&color=fff&size=128&bold=true&format=svg",
            "chain": "Arbitrum",
            "description": "Historial de airdrop probado - distribución exitosa pasada a usuarios tempranos",
            "full_description": "Lighter ya completó un airdrop exitoso y se prepara para una segunda ronda. Conocido por recompensas generosas a traders activos. Fuerte liquidez del orderbook y ecosistema creciente.",
            "backing": "Auto-sostenible a través de fees de trading, modelo de negocio probado",
            "reward_note": "La recompensa varía según volumen de trading, puntos ganados y nivel de participación",
            "tasks": [
                {"id": "t1", "description": "Conectar wallet a Lighter", "completed": False},
                {"id": "t2", "description": "Hacer tu primer trade", "completed": False},
                {"id": "t3", "description": "Tradear al menos $500 de volumen", "completed": False},
                {"id": "t4", "description": "Usar órdenes límite (multiplicador bonus)", "completed": False}
            ],
            "estimated_reward": "$800-2500",
            "difficulty": "Easy",
            "deadline": "2024-07-31T23:59:59Z",
            "status": "active",
            "link": "https://app.lighter.xyz",
            "premium": False,
            "timeline": "Segundo airdrop Q2-Q3 2024"
        }
    ]


# Routes
@api_router.get("/")
async def root():
    return {"message": "Alpha Crypto API"}

@api_router.get("/crypto/prices", response_model=List[CryptoPrice])
async def get_crypto_prices():
    """Get current crypto prices from CoinGecko API"""
    try:
        async with aiohttp.ClientSession() as session:
            url = "https://api.coingecko.com/api/v3/coins/markets"
            params = {
                "vs_currency": "usd",
                "ids": "bitcoin,ethereum,solana,usd-coin",
                "order": "market_cap_desc",
                "per_page": 10,
                "page": 1,
                "sparkline": "false",
                "price_change_percentage": "24h"
            }
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
            }
            async with session.get(url, params=params, headers=headers, timeout=15) as response:
                if response.status == 200:
                    data = await response.json()
                    prices = []
                    for coin in data:
                        prices.append({
                            "id": coin.get("id", ""),
                            "symbol": coin.get("symbol", "").upper(),
                            "name": coin.get("name", ""),
                            "current_price": coin.get("current_price", 0),
                            "price_change_24h": coin.get("price_change_percentage_24h", 0) or 0,
                            "market_cap": coin.get("market_cap", 0) or 0,
                            "volume_24h": coin.get("total_volume", 0) or 0
                        })
                    if prices:
                        logger.info(f"Fetched {len(prices)} prices from CoinGecko")
                        return prices
                else:
                    logger.warning(f"CoinGecko returned status {response.status}")
    except Exception as e:
        logger.error(f"Error fetching CoinGecko prices: {e}")
    
    # Fallback to mock data if API fails
    logger.info("Using mock crypto prices as fallback")
    return get_mock_crypto_prices()

@api_router.get("/crypto/fear-greed")
async def get_fear_greed_index():
    """Get Fear & Greed Index from Alternative.me API"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("https://api.alternative.me/fng/") as response:
                if response.status == 200:
                    data = await response.json()
                    index_data = data['data'][0]
                    return {
                        "value": int(index_data['value']),
                        "classification": index_data['value_classification'],
                        "timestamp": index_data['timestamp']
                    }
    except Exception as e:
        # Fallback to mock data
        return {
            "value": 62,
            "classification": "Greed",
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

@api_router.get("/articles", response_model=List[Article])
async def get_articles_route(category: Optional[str] = None, search: Optional[str] = None):
    """Get articles - tries Sanity CMS first, falls back to mock data if not enough content"""
    try:
        # Try Sanity CMS first
        sanity_articles = await sanity_get_articles(category)
        
        # Use Sanity if it has at least 3 articles, otherwise use mock data
        if sanity_articles and len(sanity_articles) >= 3:
            logger.info(f"Using {len(sanity_articles)} articles from Sanity CMS")
            articles = sanity_articles
        else:
            logger.info(f"Sanity has only {len(sanity_articles) if sanity_articles else 0} articles, using mock data")
            articles = get_mock_articles()
            
            # Apply category filter to mock data
            if category and category != "all":
                articles = [a for a in articles if a.get('category', '').lower() == category.lower()]
        
        # Apply search filter if provided
        if search:
            search_lower = search.lower()
            articles = [a for a in articles if search_lower in a.get('title', '').lower() or search_lower in a.get('excerpt', '').lower()]
        
        return articles
    except Exception as e:
        logger.error(f"Error fetching articles: {e}")
        return get_mock_articles()

@api_router.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: str):
    """Get single article by ID - tries Sanity CMS first, falls back to mock data"""
    try:
        # Try Sanity CMS first
        article = await sanity_get_article_by_id(article_id)
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
async def get_airdrops_route(status: Optional[str] = None, difficulty: Optional[str] = None):
    """Get airdrops - tries Sanity CMS first, falls back to mock data if not enough content"""
    try:
        # Try Sanity CMS first
        sanity_airdrops = await sanity_get_airdrops(status, difficulty)
        
        # Use Sanity if it has at least 5 airdrops, otherwise use mock data
        if sanity_airdrops and len(sanity_airdrops) >= 5:
            logger.info(f"Using {len(sanity_airdrops)} airdrops from Sanity CMS")
            return sanity_airdrops
        
        # Fallback to mock data
        logger.info(f"Sanity has only {len(sanity_airdrops) if sanity_airdrops else 0} airdrops, using mock data")
        airdrops = get_mock_airdrops()
        
        # Apply filters
        if status and status != "all":
            airdrops = [a for a in airdrops if a['status'] == status]
        
        if difficulty and difficulty != "all":
            airdrops = [a for a in airdrops if a['difficulty'].lower() == difficulty.lower()]
        
        return airdrops
    except Exception as e:
        logger.error(f"Error fetching airdrops: {e}")
        return get_mock_airdrops()

@api_router.get("/airdrops/{airdrop_id}", response_model=Airdrop)
async def get_airdrop(airdrop_id: str):
    """Get single airdrop by ID - tries Sanity CMS first, falls back to mock data"""
    try:
        # Try Sanity CMS first
        airdrop = await sanity_get_airdrop_by_id(airdrop_id)
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
    """Get early signals - tries Sanity CMS first, falls back to mock data if not enough content"""
    try:
        # Try Sanity CMS first
        sanity_signals = await sanity_get_signals()
        
        # Use Sanity if it has at least 3 signals, otherwise use mock data
        if sanity_signals and len(sanity_signals) >= 3:
            logger.info(f"Using {len(sanity_signals)} signals from Sanity CMS")
            return sanity_signals
        
        # Fallback to mock data
        logger.info(f"Sanity has only {len(sanity_signals) if sanity_signals else 0} signals, using mock data")
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
        return {"success": True, "message": "Consulting request submitted successfully"}
    except Exception as e:
        logger.error(f"Error submitting consulting request: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit consulting request")

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
    """Subscribe to email alerts for premium airdrops"""
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
        return {"success": True, "message": "Successfully subscribed to alerts"}
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