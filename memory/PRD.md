# Alpha Crypto - Product Requirements Document

## Overview
Alpha Crypto is a full-stack crypto alpha platform providing market insights, airdrop tracking, premium content, and investment analysis for crypto investors.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **CMS:** Sanity.io (Project ID: 15c5x8s5) - For future content management
- **APIs:** CoinGecko (live prices), Alternative.me (Fear & Greed Index)

## Core Features

### 1. Homepage
- ✅ Live crypto price ticker (BTC, ETH, SOL, USDC from CoinGecko)
- ✅ Fear & Greed Index with gauge visualization
- ✅ Market indicators with glassmorphism cards
- ✅ Article and airdrop previews
- ✅ Premium subscription CTA ($20/mo)
- ✅ Feedback form in footer

### 2. Articles Page (`/articles`)
- ✅ 5 articles including 3 new Spanish articles:
  - "Stablecoins: La Revolución Silenciosa del Sistema Financiero"
  - "AI Agents y la Economía del Futuro" (Premium)
  - "¿Qué está pasando en Crypto en 2026?"
- ✅ Relevant images for each article
- ✅ Category filtering
- ✅ Premium badges

### 3. Airdrops Page (`/airdrops`)
- ✅ 15 DEX airdrops with detailed info
- ✅ DiceBear generated logos (unique per project)
- ✅ "Estimated Reward*" with clarification note
- ✅ "*Based on volume & points" displayed on all cards
- ✅ Chain badges (Arbitrum, Solana, Base, etc.)
- ✅ Premium badges for exclusive airdrops

### 4. Airdrop Detail Page (`/airdrops/:id`)
- ✅ Full airdrop information
- ✅ reward_note explaining reward variability
- ✅ Interactive task checklist with progress bar
- ✅ Investors & backing information
- ✅ Timeline info
- ✅ "Start This Airdrop" button with referral link

### 5. Market Indices Page (`/indices`)
- ✅ **NEW: Recommendation card** (BUY/HOLD/SELL ZONE)
- ✅ **NEW: Signal summary** (counts of Buy/Hold/Sell signals)
- ✅ **NEW: 1-line explanation** on each metric card
- ✅ **NEW: Smaller Fear & Greed gauge** in recommendation card
- ✅ On-Chain Metrics (MVRV, NUPL, Realized Price)
- ✅ Sentiment Indicators (Fear & Greed, Bitcoin Rainbow)
- ✅ Liquidity Metrics (SSR, Exchange Reserves)
- ✅ Market Structure (BTC Dominance, Altcoin Season, Total MCap)

### 6. Admin Page (`/admin`)
- ✅ Payment verification dashboard
- ✅ Premium users list
- ✅ **NEW: Feedback tab** with submitted user feedback
- ✅ Mark feedback as read functionality

### 7. Premium Subscription
- ✅ $20/month pricing
- ✅ Multi-chain payments: Solana, Base, Arbitrum (USDC)
- ✅ QR code payment flow
- ✅ Manual verification process

### 8. Feedback System
- ✅ **NEW: Feedback form in footer**
- ✅ Fields: Name, Email, Message
- ✅ "What would you like to see on Alpha Crypto?"
- ✅ Saves to MongoDB
- ✅ Viewable in Admin panel

## Data Sources

### Live APIs
- ✅ **CoinGecko API** - Real-time prices for BTC, ETH, SOL, USDC
- ✅ **Alternative.me API** - Live Fear & Greed Index

### MOCKED Data (Intentional)
- 15 DEX Airdrops with full details (in `backend/server.py`)
- 5 Articles including 3 new Spanish articles
- Market indicators (Bitcoin dominance, DeFi TVL, etc.)

## Completed Tasks - FASE 1 (February 2026)
- [x] Market Indices Page with Buy/Hold/Sell recommendations
- [x] Signal explanations on each metric card
- [x] Smaller Fear & Greed gauge in recommendation card
- [x] Live crypto prices from CoinGecko API
- [x] 3 new Spanish articles (Stablecoins, AI Agents, Crypto 2026)
- [x] Airdrops with reward clarification notes
- [x] DiceBear logos for all airdrops
- [x] Feedback form in footer
- [x] Feedback management in Admin panel

## Upcoming Tasks - FASE 2 (P1)
- [ ] Investment Analysis tab with market report (Atlantis style)
- [ ] Portfolio section (Milk Road style) with holdings display
- [ ] Early Signals tab for quick investment opportunities

## Future Tasks - FASE 3 (P2)
- [ ] Consulting section with contact form
- [ ] Sync airdrop/article data with Sanity CMS
- [ ] Migrate to Next.js for Vercel deployment
- [ ] Export project to GitHub

## Backlog (P3)
- [ ] Automatic on-chain payment verification
- [ ] User authentication system
- [ ] Saved airdrops/favorites feature

## Key Endpoints

### Articles API
- `GET /api/articles` - List articles (mock data)
- `GET /api/articles/:id` - Get single article

### Airdrops API
- `GET /api/airdrops` - List all 15 airdrops
- `GET /api/airdrops/:id` - Get single airdrop with reward_note

### Market Data API
- `GET /api/crypto/prices` - Live prices from CoinGecko
- `GET /api/crypto/fear-greed` - Live Fear & Greed Index
- `GET /api/market-indices` - Market indicators

### Feedback API
- `POST /api/feedback` - Submit feedback
- `GET /api/admin/feedback` - Get all feedback (admin)
- `POST /api/admin/feedback/:id/read` - Mark as read

### Payments API
- `POST /api/payments/submit` - Submit payment
- `GET /api/admin/payments` - Get payments (admin)
- `POST /api/admin/payments/:id/verify` - Verify payment

## Test Reports
- `/app/test_reports/iteration_1.json` - 15 DEX Airdrops feature (100% pass)
- `/app/test_reports/pytest/fase1_results.xml` - FASE 1 features (21 tests, 100% pass)

## User's Preferred Language
Spanish (Español)
