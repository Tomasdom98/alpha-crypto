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
            "project_name": "Hyena Trade",
            "logo_url": "https://cdn.jsdelivr.net/gh/nickcisco/coinlogos@master/coins/128x128/HT.png",
            "chain": "Arbitrum",
            "description": "Perpetuals DEX on Arbitrum with competitive fees and leverage trading",
            "full_description": "Hyena Trade is a decentralized perpetual exchange on Arbitrum offering up to 50x leverage. Known for low fees and fast execution. No confirmed airdrop but strong hints from the team.",
            "backing": "Backed by leading DeFi VCs, experienced team from TradFi",
            "reward_note": "Reward varies based on trading volume, points earned, and participation level",
            "tasks": [
                {"id": "t1", "description": "Connect wallet and complete KYC (if required)", "completed": False},
                {"id": "t2", "description": "Make your first trade (min $100 volume)", "completed": False},
                {"id": "t3", "description": "Trade at least 3 different pairs", "completed": False},
                {"id": "t4", "description": "Provide liquidity to any pool", "completed": False}
            ],
            "estimated_reward": "$500-2000",
            "difficulty": "Medium",
            "deadline": "2024-06-30T23:59:59Z",
            "status": "active",
            "link": "https://app.hyena.trade/ref/ALPHACRYPTO",
            "premium": False,
            "timeline": "Expected Q2 2024"
        },
        {
            "id": "2",
            "project_name": "Extended Exchange",
            "logo_url": "https://cdn.jsdelivr.net/gh/nickcisco/coinlogos@master/coins/128x128/BTC.png",
            "chain": "Arbitrum",
            "description": "Advanced perpetuals platform with unique trading features and competitive APRs",
            "full_description": "Extended Exchange is building the next generation of perpetual trading with innovative features like vault strategies and social trading. Strong airdrop hints from the community.",
            "backing": "Seed round from top-tier crypto VCs, team from Binance and FTX",
            "reward_note": "Reward varies based on trading volume, points earned, and participation level",
            "tasks": [
                {"id": "t1", "description": "Sign up using referral code: TOMDEFI", "completed": False},
                {"id": "t2", "description": "Complete at least $500 in trading volume", "completed": False},
                {"id": "t3", "description": "Use vault strategies (deposit min $100)", "completed": False},
                {"id": "t4", "description": "Trade for 5+ consecutive days", "completed": False}
            ],
            "estimated_reward": "$1000-3000",
            "difficulty": "Medium",
            "deadline": "2024-07-15T23:59:59Z",
            "status": "active",
            "link": "https://app.extended.exchange/join/TOMDEFI",
            "premium": False,
            "timeline": "Expected Q3 2024"
        },
        {
            "id": "3",
            "project_name": "GRVT",
            "logo_url": "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400",
            "chain": "zkSync",
            "description": "Institutional-grade hybrid DEX on zkSync with CEX-like performance",
            "full_description": "GRVT combines the best of CEX and DEX: self-custody with institutional-grade speed and liquidity. Built on zkSync Era with backing from major crypto VCs. Confirmed token launch.",
            "backing": "Backed by Paradigm, Variant, Robot Ventures - $7M raised",
            "tasks": [
                {"id": "t1", "description": "Create account with referral: tomd411", "completed": False},
                {"id": "t2", "description": "Complete identity verification", "completed": False},
                {"id": "t3", "description": "Make at least 10 trades (any size)", "completed": False},
                {"id": "t4", "description": "Maintain trading activity for 30 days", "completed": False}
            ],
            "estimated_reward": "$2000-5000",
            "difficulty": "Easy",
            "deadline": "2024-08-31T23:59:59Z",
            "status": "active",
            "link": "https://grvt.io",
            "premium": True,
            "timeline": "Token launch Q3 2024"
        },
        {
            "id": "4",
            "project_name": "Based.one",
            "logo_url": "https://images.unsplash.com/photo-1643000296927-f4f1c8722b7d?w=400",
            "chain": "Base",
            "description": "Native perpetuals DEX on Base with low fees and high leverage",
            "full_description": "Based.one is the leading perps platform on Base L2, offering up to 100x leverage with minimal fees. Strong community and high trading volumes indicate likely airdrop.",
            "backing": "Community-driven, partnerships with Base ecosystem projects",
            "tasks": [
                {"id": "t1", "description": "Connect wallet using ref: TOMDEFI", "completed": False},
                {"id": "t2", "description": "Trade at least $1000 volume", "completed": False},
                {"id": "t3", "description": "Try leverage trading (5x or higher)", "completed": False},
                {"id": "t4", "description": "Invite 2 friends to trade", "completed": False}
            ],
            "estimated_reward": "$800-2500",
            "difficulty": "Medium",
            "deadline": "2024-07-31T23:59:59Z",
            "status": "active",
            "link": "https://app.based.one/r/TOMDEFI",
            "premium": False,
            "timeline": "Expected Q2-Q3 2024"
        },
        {
            "id": "5",
            "project_name": "Backpack",
            "logo_url": "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400",
            "chain": "Solana",
            "description": "Solana's premier exchange from the Mad Lads team with confirmed token",
            "full_description": "Backpack is built by the team behind Mad Lads NFT (Coral/xNFT). Recently raised $17M and confirmed token launch. One of the most anticipated Solana airdrops.",
            "backing": "Backed by Jump, Placeholder, $17M Series A",
            "tasks": [
                {"id": "t1", "description": "Sign up with referral code", "completed": False},
                {"id": "t2", "description": "Complete KYC verification", "completed": False},
                {"id": "t3", "description": "Trade at least $500 volume", "completed": False},
                {"id": "t4", "description": "Hold xNFT or Mad Lads (bonus)", "completed": False}
            ],
            "estimated_reward": "$1500-4000",
            "difficulty": "Easy",
            "deadline": "2024-09-30T23:59:59Z",
            "status": "active",
            "link": "https://backpack.exchange/join/da5e1eb4-cbc1-4faf-afa6-9f11e80ce47a",
            "premium": True,
            "timeline": "Token launch Q3 2024 confirmed"
        },
        {
            "id": "6",
            "project_name": "Avantis",
            "logo_url": "https://images.unsplash.com/photo-1642543492411-d3a059c72441?w=400",
            "chain": "Base",
            "description": "Proven airdrop model perps DEX on Base with competitive trading",
            "full_description": "Avantis has a proven track record of rewarding early users. Offers perpetual trading with unique vault strategies. Strong hints of token launch with generous airdrop allocation.",
            "backing": "Incubated by leading Base ecosystem VCs",
            "tasks": [
                {"id": "t1", "description": "Register with code: tomdefi", "completed": False},
                {"id": "t2", "description": "Make first trade (any pair)", "completed": False},
                {"id": "t3", "description": "Deposit into vault strategies", "completed": False},
                {"id": "t4", "description": "Trade weekly for 1 month", "completed": False}
            ],
            "estimated_reward": "$1200-3500",
            "difficulty": "Medium",
            "deadline": "2024-08-15T23:59:59Z",
            "status": "active",
            "link": "https://www.avantisfi.com/referral?code=tomdefi",
            "premium": False,
            "timeline": "Expected Q3 2024"
        },
        {
            "id": "7",
            "project_name": "StandX",
            "logo_url": "https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=400",
            "chain": "Multi-chain",
            "description": "Cross-chain perpetuals platform with innovative trading features",
            "full_description": "StandX offers perpetual trading across multiple chains with unified liquidity. Known for low slippage and high capital efficiency. Team has hinted at token rewards for early adopters.",
            "backing": "Backed by prominent DeFi angels and DAOs",
            "tasks": [
                {"id": "t1", "description": "Sign up with referral: tomdefi", "completed": False},
                {"id": "t2", "description": "Trade on at least 2 different chains", "completed": False},
                {"id": "t3", "description": "Achieve $2000+ total volume", "completed": False},
                {"id": "t4", "description": "Participate in trading competitions", "completed": False}
            ],
            "estimated_reward": "$1000-3000",
            "difficulty": "Hard",
            "deadline": "2024-07-31T23:59:59Z",
            "status": "active",
            "link": "https://standx.com/referral?code=tomdefi",
            "premium": True,
            "timeline": "Expected Q2-Q3 2024"
        },
        {
            "id": "8",
            "project_name": "Variational",
            "logo_url": "https://images.unsplash.com/photo-1644925295849-f057b6ee1c66?w=400",
            "chain": "Omni-chain",
            "description": "Omni-chain perpetuals DEX with advanced order types",
            "full_description": "Variational enables perpetual trading across multiple chains with a unified interface. Features advanced order types and risk management tools typically found on CEXs.",
            "backing": "Seed funding from crypto-native VCs",
            "tasks": [
                {"id": "t1", "description": "Connect wallet and start trading", "completed": False},
                {"id": "t2", "description": "Trade SOL perpetuals", "completed": False},
                {"id": "t3", "description": "Use advanced order types", "completed": False},
                {"id": "t4", "description": "Maintain $500+ trading volume", "completed": False}
            ],
            "estimated_reward": "$600-1800",
            "difficulty": "Medium",
            "deadline": "2024-06-30T23:59:59Z",
            "status": "active",
            "link": "https://omni.variational.io/perpetual/SOL",
            "premium": False,
            "timeline": "Expected Q2 2024"
        },
        {
            "id": "9",
            "project_name": "Pacifica",
            "logo_url": "https://images.unsplash.com/photo-1642790551116-c0fc82ccbdae?w=400",
            "chain": "Solana",
            "description": "Solana's next-gen perps platform with vault strategies and social trading",
            "full_description": "Pacifica combines perpetual trading with innovative vault strategies on Solana. Known for lightning-fast execution and low fees. Strong community growth indicates imminent token launch.",
            "backing": "Backed by Solana Foundation and ecosystem funds",
            "tasks": [
                {"id": "t1", "description": "Register with referral: tomdefi", "completed": False},
                {"id": "t2", "description": "Make your first SOL-PERP trade", "completed": False},
                {"id": "t3", "description": "Deposit into yield vaults", "completed": False},
                {"id": "t4", "description": "Follow top traders (social feature)", "completed": False}
            ],
            "estimated_reward": "$1000-2800",
            "difficulty": "Easy",
            "deadline": "2024-08-31T23:59:59Z",
            "status": "active",
            "link": "https://app.pacifica.fi?referral=tomdefi",
            "premium": False,
            "timeline": "Expected Q3 2024"
        },
        {
            "id": "10",
            "project_name": "Hibachi",
            "logo_url": "https://images.unsplash.com/photo-1639152201720-5e536d254d81?w=400",
            "chain": "Blast",
            "description": "Native DEX on Blast L2 with points system and yield opportunities",
            "full_description": "Hibachi is building the premier trading platform on Blast L2. Benefits from Blast's native yield and points system. Early adoption phase with generous rewards expected.",
            "backing": "Blast ecosystem grants and angel investors",
            "tasks": [
                {"id": "t1", "description": "Connect with referral: alphacrypto", "completed": False},
                {"id": "t2", "description": "Bridge assets to Blast", "completed": False},
                {"id": "t3", "description": "Complete $300+ in trades", "completed": False},
                {"id": "t4", "description": "Earn Blast points through trading", "completed": False}
            ],
            "estimated_reward": "$800-2200",
            "difficulty": "Medium",
            "deadline": "2024-07-15T23:59:59Z",
            "status": "active",
            "link": "https://hibachi.xyz/r/alphacrypto",
            "premium": False,
            "timeline": "Expected Q2 2024"
        },
        {
            "id": "11",
            "project_name": "Reya",
            "logo_url": "https://images.unsplash.com/photo-1666624833516-6d0e320c610d?w=400",
            "chain": "Reya Network (L2)",
            "description": "Modular trading-optimized L2 with institutional backing",
            "full_description": "Reya Network is a modular L2 built specifically for trading and DeFi. Raised significant funding and confirmed token. One of the most anticipated airdrops with potentially large allocations for early users.",
            "backing": "Backed by Framework, Coinbase Ventures - $10M+ raised",
            "tasks": [
                {"id": "t1", "description": "Sign up with referral: roxzmgsj", "completed": False},
                {"id": "t2", "description": "Bridge to Reya Network", "completed": False},
                {"id": "t3", "description": "Trade perpetuals (min $1000 volume)", "completed": False},
                {"id": "t4", "description": "Use liquidity pools", "completed": False}
            ],
            "estimated_reward": "$2000-5000",
            "difficulty": "Medium",
            "deadline": "2024-09-30T23:59:59Z",
            "status": "active",
            "link": "https://app.reya.xyz/trade?referredBy=roxzmgsj",
            "premium": True,
            "timeline": "Token launch Q3-Q4 2024"
        },
        {
            "id": "12",
            "project_name": "Ostium",
            "logo_url": "https://images.unsplash.com/photo-1642543348745-03e8e5c849e3?w=400",
            "chain": "Arbitrum",
            "description": "RWA and crypto perpetuals platform with unique asset offerings",
            "full_description": "Ostium enables trading of both traditional (RWA) and crypto perpetuals on Arbitrum. Unique offering includes stocks, forex, and commodities alongside crypto. Strong institutional interest.",
            "backing": "Backed by RWA-focused VCs and traditional finance partners",
            "tasks": [
                {"id": "t1", "description": "Register with ref: 01XAZ", "completed": False},
                {"id": "t2", "description": "Trade SPX (S&P 500) perpetuals", "completed": False},
                {"id": "t3", "description": "Trade at least 3 crypto pairs", "completed": False},
                {"id": "t4", "description": "Achieve $1500+ total volume", "completed": False}
            ],
            "estimated_reward": "$1200-3500",
            "difficulty": "Medium",
            "deadline": "2024-08-31T23:59:59Z",
            "status": "active",
            "link": "https://app.ostium.com/trade?from=SPX&to=USD&ref=01XAZ",
            "premium": False,
            "timeline": "Expected Q3 2024"
        },
        {
            "id": "13",
            "project_name": "Ethereal",
            "logo_url": "https://images.unsplash.com/photo-1666624833516-6d0e320c610d?w=400",
            "chain": "Ethereum",
            "description": "Decentralized trading platform on Ethereum mainnet",
            "full_description": "Ethereal is a decentralized exchange on Ethereum offering perpetual trading with innovative features.",
            "backing": "Community-backed project with growing user base",
            "tasks": [],
            "estimated_reward": "$3000",
            "difficulty": "Medium",
            "deadline": "2024-12-31T23:59:59Z",
            "status": "active",
            "link": "https://app.ethereal.trade",
            "premium": False,
            "timeline": "Expected Q4 2024"
        },
        {
            "id": "14",
            "project_name": "Paradex",
            "logo_url": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400",
            "chain": "Starknet",
            "description": "Paradigm-backed perpetuals DEX on Starknet with institutional focus",
            "full_description": "Paradex is built on Starknet with backing from Paradigm (one of crypto's top VCs). Offers institutional-grade perpetual trading with self-custody. Token launch confirmed for 2024.",
            "backing": "Backed by Paradigm - Major VC backing ensures strong token value",
            "tasks": [
                {"id": "t1", "description": "Create Paradex account", "completed": False},
                {"id": "t2", "description": "Complete identity verification", "completed": False},
                {"id": "t3", "description": "Make at least 5 trades", "completed": False},
                {"id": "t4", "description": "Trade across multiple pairs", "completed": False}
            ],
            "estimated_reward": "$1500-4000",
            "difficulty": "Easy",
            "deadline": "2024-09-15T23:59:59Z",
            "status": "active",
            "link": "https://app.paradex.trade",
            "premium": True,
            "timeline": "Token launch Q3 2024 confirmed"
        },
        {
            "id": "15",
            "project_name": "Lighter",
            "logo_url": "https://images.unsplash.com/photo-1643000296927-f4f1c8722b7d?w=400",
            "chain": "Arbitrum",
            "description": "Proven airdrop history - successful past distribution to early users",
            "full_description": "Lighter has already completed one successful airdrop and is preparing for a second round. Known for generous rewards to active traders. Strong orderbook liquidity and growing ecosystem.",
            "backing": "Self-sustaining through trading fees, proven business model",
            "tasks": [
                {"id": "t1", "description": "Connect wallet to Lighter", "completed": False},
                {"id": "t2", "description": "Make your first trade", "completed": False},
                {"id": "t3", "description": "Trade at least $500 volume", "completed": False},
                {"id": "t4", "description": "Use limit orders (bonus multiplier)", "completed": False}
            ],
            "estimated_reward": "$800-2500",
            "difficulty": "Easy",
            "deadline": "2024-07-31T23:59:59Z",
            "status": "active",
            "link": "https://app.lighter.xyz",
            "premium": False,
            "timeline": "Second airdrop Q2-Q3 2024"
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
            async with session.get(url, params=params, timeout=10) as response:
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
                        return prices
    except Exception as e:
        logger.error(f"Error fetching CoinGecko prices: {e}")
    
    # Fallback to mock data if API fails
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
    """Get airdrops - uses mock data for the 15 DEX airdrops"""
    try:
        # Use the comprehensive mock data with 15 airdrops
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
    """Get single airdrop by ID from mock data"""
    try:
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

@api_router.get("/admin/users")
async def get_premium_users():
    """Get list of premium users"""
    try:
        users = await db.users.find({"is_premium": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
        return users
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")


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