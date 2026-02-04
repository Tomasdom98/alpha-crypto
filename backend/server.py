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
from sanity_client import get_articles, get_article_by_slug, get_airdrops, get_airdrop_by_id


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
    return [
        {
            "id": "bitcoin",
            "symbol": "BTC",
            "name": "Bitcoin",
            "current_price": 64250.00,
            "price_change_24h": 2.3,
            "market_cap": 1250000000000,
            "volume_24h": 28500000000
        },
        {
            "id": "ethereum",
            "symbol": "ETH",
            "name": "Ethereum",
            "current_price": 3420.50,
            "price_change_24h": 1.8,
            "market_cap": 410000000000,
            "volume_24h": 15200000000
        },
        {
            "id": "solana",
            "symbol": "SOL",
            "name": "Solana",
            "current_price": 152.30,
            "price_change_24h": -0.5,
            "market_cap": 69000000000,
            "volume_24h": 2800000000
        },
        {
            "id": "usd-coin",
            "symbol": "USDC",
            "name": "USD Coin",
            "current_price": 1.00,
            "price_change_24h": 0.01,
            "market_cap": 32000000000,
            "volume_24h": 5100000000
        }
    ]

def get_mock_articles():
    return [
        {
            "id": "1",
            "title": "Bitcoin Halving: What Investors Need to Know",
            "excerpt": "The upcoming Bitcoin halving could reshape the crypto market. Here's our complete analysis.",
            "content": "Detailed analysis of Bitcoin halving...",
            "category": "Analysis",
            "premium": False,
            "published_at": "2024-01-15T10:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1651054558996-03455fe2702f?crop=entropy&cs=srgb&fm=jpg&q=85"
        },
        {
            "id": "2",
            "title": "DeFi Summer 2.0: Top Protocols to Watch",
            "excerpt": "A comprehensive guide to the hottest DeFi protocols delivering real yield.",
            "content": "Deep dive into DeFi protocols...",
            "category": "DeFi",
            "premium": True,
            "published_at": "2024-01-14T15:30:00Z",
            "image_url": "https://images.unsplash.com/photo-1643000296927-f4f1c8722b7d?crop=entropy&cs=srgb&fm=jpg&q=85"
        },
        {
            "id": "3",
            "title": "AI Crypto Projects Gaining Traction",
            "excerpt": "How artificial intelligence is revolutionizing blockchain infrastructure.",
            "content": "AI and crypto convergence...",
            "category": "AI",
            "premium": False,
            "published_at": "2024-01-13T09:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1666624833516-6d0e320c610d?crop=entropy&cs=srgb&fm=jpg&q=85"
        },
        {
            "id": "4",
            "title": "Stablecoin Regulations: The New Landscape",
            "excerpt": "Understanding the regulatory framework shaping the future of stablecoins.",
            "content": "Stablecoin regulation analysis...",
            "category": "Stablecoins",
            "premium": False,
            "published_at": "2024-01-12T14:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1644925295849-f057b6ee1c66?crop=entropy&cs=srgb&fm=jpg&q=85"
        },
        {
            "id": "5",
            "title": "Breaking: Major Exchange Announces New Listing",
            "excerpt": "Exclusive coverage of the latest crypto exchange developments.",
            "content": "Exchange news...",
            "category": "News",
            "premium": True,
            "published_at": "2024-01-11T11:00:00Z",
            "image_url": "https://images.unsplash.com/photo-1642413598014-7742a18e85aa?crop=entropy&cs=srgb&fm=jpg&q=85"
        }
    ]

def get_mock_airdrops():
    return [
        {
            "id": "1",
            "project_name": "LayerZero",
            "logo_url": "https://images.unsplash.com/photo-1642413598014-7742a18e85aa?crop=entropy&cs=srgb&fm=jpg&q=85",
            "description": "Omnichain interoperability protocol with confirmed airdrop",
            "tasks": [
                {"id": "t1", "description": "Bridge assets using Stargate Finance", "completed": False},
                {"id": "t2", "description": "Interact with LayerZero apps (at least 3)", "completed": False},
                {"id": "t3", "description": "Complete cross-chain transactions", "completed": False}
            ],
            "estimated_reward": "$500-2000",
            "difficulty": "Medium",
            "deadline": "2024-03-31T23:59:59Z",
            "status": "active",
            "link": "https://layerzero.network",
            "premium": False
        },
        {
            "id": "2",
            "project_name": "zkSync Era",
            "logo_url": "https://images.unsplash.com/photo-1666624833516-6d0e320c610d?crop=entropy&cs=srgb&fm=jpg&q=85",
            "description": "Layer 2 scaling solution with likely token launch",
            "tasks": [
                {"id": "t4", "description": "Bridge ETH to zkSync Era", "completed": False},
                {"id": "t5", "description": "Swap tokens on zkSync DEX", "completed": False},
                {"id": "t6", "description": "Provide liquidity", "completed": False},
                {"id": "t7", "description": "Mint NFT on zkSync", "completed": False}
            ],
            "estimated_reward": "$1000-5000",
            "difficulty": "Easy",
            "deadline": "2024-04-15T23:59:59Z",
            "status": "active",
            "link": "https://zksync.io",
            "premium": False
        },
        {
            "id": "3",
            "project_name": "Scroll Alpha",
            "logo_url": "https://images.unsplash.com/photo-1643000296927-f4f1c8722b7d?crop=entropy&cs=srgb&fm=jpg&q=85",
            "description": "zkEVM rollup with exclusive testnet rewards",
            "tasks": [
                {"id": "t8", "description": "Bridge to Scroll testnet", "completed": False},
                {"id": "t9", "description": "Deploy smart contract", "completed": False},
                {"id": "t10", "description": "Complete developer tasks", "completed": False}
            ],
            "estimated_reward": "$800-3000",
            "difficulty": "Hard",
            "deadline": "2024-02-28T23:59:59Z",
            "status": "active",
            "link": "https://scroll.io",
            "premium": True
        }
    ]


# Routes
@api_router.get("/")
async def root():
    return {"message": "Alpha Crypto API"}

@api_router.get("/crypto/prices", response_model=List[CryptoPrice])
async def get_crypto_prices():
    """Get current crypto prices"""
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
    """Get articles from Sanity CMS with optional filtering"""
    try:
        articles = await get_articles(category)
        
        # If no Sanity data, fall back to mock data
        if not articles:
            articles = get_mock_articles()
        
        # Apply search filter if provided
        if search:
            search_lower = search.lower()
            articles = [a for a in articles if search_lower in a.get('title', '').lower() or search_lower in a.get('excerpt', '').lower()]
        
        return articles
    except Exception as e:
        logger.error(f"Error fetching articles: {e}")
        # Fallback to mock data on error
        return get_mock_articles()

@api_router.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: str):
    """Get single article by ID or slug from Sanity"""
    try:
        article = await get_article_by_slug(article_id)
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        return article
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching article: {e}")
        # Fallback to mock data
        articles = get_mock_articles()
        article = next((a for a in articles if a['id'] == article_id), None)
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        return article

@api_router.get("/airdrops", response_model=List[Airdrop])
async def get_airdrops_route(status: Optional[str] = None, difficulty: Optional[str] = None):
    """Get airdrops from Sanity with optional filtering"""
    try:
        airdrops = await get_airdrops(status, difficulty)
        
        # If no Sanity data, fall back to mock data
        if not airdrops:
            airdrops = get_mock_airdrops()
            
            # Apply filters to mock data
            if status and status != "all":
                airdrops = [a for a in airdrops if a['status'] == status]
            
            if difficulty and difficulty != "all":
                airdrops = [a for a in airdrops if a['difficulty'].lower() == difficulty.lower()]
        
        return airdrops
    except Exception as e:
        logger.error(f"Error fetching airdrops: {e}")
        # Fallback to mock data
        return get_mock_airdrops()

@api_router.get("/airdrops/{airdrop_id}", response_model=Airdrop)
async def get_airdrop(airdrop_id: str):
    """Get single airdrop by ID from Sanity"""
    try:
        airdrop = await get_airdrop_by_id(airdrop_id)
        if not airdrop:
            raise HTTPException(status_code=404, detail="Airdrop not found")
        return airdrop
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching airdrop: {e}")
        # Fallback to mock data
        airdrops = get_mock_airdrops()
        airdrop = next((a for a in airdrops if a['id'] == airdrop_id), None)
        if not airdrop:
            raise HTTPException(status_code=404, detail="Airdrop not found")
        return airdrop

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

@api_router.get("/admin/users")
async def get_premium_users():
    """Get list of premium users"""
    try:
        users = await db.users.find({"is_premium": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
        return users
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")


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