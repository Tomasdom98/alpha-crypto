# Alpha Crypto - Product Requirements Document

## Overview
Alpha Crypto is a full-stack crypto alpha platform providing market insights, airdrop tracking, premium content, portfolio transparency, and investment analysis for crypto investors.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Recharts
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **CMS:** Sanity.io (Project ID: 15c5x8s5) - Integrated with automatic fallback
- **APIs:** CoinGecko (live prices), Alternative.me (Fear & Greed Index)

## Pricing Structure (Two-Tier)

### Free Content
- Articles
- Market Indices
- Basic education

### Alpha Access ($30/month USDC)
- Airdrops with detailed guides
- Portfolio tracking
- Early Signals and alerts
- Premium market analysis
- Advanced indicators

### Alpha Pro ($100/month USDC)
- Everything in Alpha Access
- Personal & business consulting
- Priority support
- Exclusive research
- Monthly strategy calls

### Payment Methods
- Solana (USDC-SPL): `2X7DSWNgegbCCk1A9cdiSQm5Fk3zpkesDRpQrSqETKiv`
- Base (USDC): `0x8b1624c8b184Edb4e7430194865490Ba5e860f0C`
- Arbitrum (USDC): `0x8b1624c8b184Edb4e7430194865490Ba5e860f0C`

## Navigation Structure

### Free Section
- Home
- Artículos
- Índices
- Airdrops

### Premium Section (highlighted with crown icon)
- Portfolio
- Señales
- Consultoría

## Core Features

### 1. Homepage ✅
- Live crypto ticker (BTC, ETH, SOL, USDC)
- Fear & Greed Index gauge (compact)
- Market indicators
- Two-tier premium banner

### 2. Articles Page (`/articles`) ✅
- 5 complete educational articles in Spanish
- Dark-themed professional images
- Full article content with formatting
- Click to read full article

### 3. Airdrops Page (`/airdrops`) ✅
- **15 verified airdrops with referral links:**
  1. Hyena Trade - https://app.hyena.trade/ref/ALPHACRYPTO
  2. Extended Exchange - https://app.extended.exchange/join/TOMDEFI
  3. GRVT - https://grvt.io (ref: tomd411)
  4. Based.one - https://app.based.one/r/TOMDEFI
  5. Backpack - https://backpack.exchange/join/da5e1eb4-cbc1-4faf-afa6-9f11e80ce47a
  6. Avantis - https://www.avantisfi.com/referral?code=tomdefi
  7. StandX - https://standx.com/referral?code=tomdefi
  8. Variational - https://omni.variational.io/perpetual/SOL
  9. Pacifica - https://app.pacifica.fi?referral=tomdefi
  10. Hibachi - https://hibachi.xyz/r/alphacrypto
  11. Reya - https://app.reya.xyz/trade?referredBy=roxzmgsj
  12. Ostium - https://app.ostium.com/trade?from=SPX&to=USD&ref=01XAZ
  13. Ethereal - https://app.ethereal.trade
  14. Paradex - https://app.paradex.trade/r/collaborativeclaimerr
  15. Lighter - https://app.lighter.xyz

### 4. Market Indices Page (`/indices`) ✅
- Fear & Greed, MVRV, BTC Dominance, Rainbow Chart, Puell Multiple
- Buy/Hold/Sell recommendations

### 5. Investment Analysis Page (`/analysis`) ✅
- Market Report styled after Atlantis
- Sector Analysis table
- Recommended Allocations

### 6. Portfolio Page (`/portfolio`) ✅
- Milk Road style display
- Holdings and performance charts

### 7. Early Signals Page (`/signals`) ✅
- Real-time alerts and opportunities
- Email subscription form

### 8. Consulting Page (`/consulting`) ✅
- Personal/Business consulting form
- MongoDB storage

### 9. Admin Page (`/admin`) ✅
- Payment verification
- Feedback, Consulting, Subscribers tabs

## Completed Tasks (February 2026)

### Priority Alta ✅
- [x] Fix Airdrops List - Restored 15 airdrops with correct referral links
- [x] Fix Article Click - Navigation and full content
- [x] Two-Tier Pricing - $30 Alpha Access / $100 Alpha Pro modal

### Navigation Update ✅
- [x] Restructured navigation: Free vs Premium sections
- [x] Premium items highlighted with amber/crown icon

### Articles Update ✅
- [x] Stablecoins: Dark theme professional image
- [x] AI Agents: Full educational content
- [x] Crypto 2026: Complete market analysis
- [x] DeFi 2.0: Real yield protocols guide
- [x] L2 Wars: Arbitrum vs Optimism vs Base comparison

## In Progress / Upcoming Tasks

### Priority Media (Next)
- [x] Airdrops Educational Intro - "¿Qué es un Airdrop?" section ✅
- [x] Indices Charts - Mini sparkline charts for each indicator ✅
- [x] CoinGecko API Cache System - Server-side caching implemented ✅
- [ ] Visual identity improvements (Milk Road inspired)
- [ ] Full-size charts for Total Market Cap, Stablecoin Market Cap, DeFi TVL

### Future Tasks
- [ ] Integrate real email service (Resend/SendGrid)
- [ ] Search/Filter functionality for articles and airdrops
- [ ] Automatic on-chain payment verification
- [ ] Migrate to Next.js
- [ ] Export to GitHub

## Test Reports
- `/app/test_reports/iteration_2.json` - FASE 3 (100% pass rate)

## User's Preferred Language
Spanish (Español)

## Key Files
- `/app/backend/server.py` - All backend logic, mock data, API endpoints
- `/app/frontend/src/components/Navigation.js` - Free/Premium nav structure
- `/app/frontend/src/components/PremiumModal.js` - Two-tier pricing modal
- `/app/frontend/src/pages/ArticleDetailPage.js` - Full article view
- `/app/docs/SANITY_SCHEMAS.md` - CMS schema documentation
