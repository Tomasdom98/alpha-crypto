# Alpha Crypto - Product Requirements Document

## Overview
Alpha Crypto is a full-stack crypto alpha platform providing market insights, airdrop tracking, premium content, portfolio transparency, and investment analysis for crypto investors.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Recharts
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
- ✅ 5 articles including 3 new Spanish articles
- ✅ Relevant images for each article
- ✅ Category filtering, Premium badges

### 3. Airdrops Page (`/airdrops`)
- ✅ 15 DEX airdrops with DiceBear logos
- ✅ Reward clarification notes
- ✅ Premium badges, Chain badges

### 4. Airdrop Detail Page (`/airdrops/:id`)
- ✅ Full info, interactive task checklist
- ✅ Investors & backing, Timeline

### 5. Market Indices Page (`/indices`)
- ✅ Buy/Hold/Sell recommendations
- ✅ Signal explanations on each card
- ✅ Fear & Greed gauge

### 6. **Investment Analysis Page (`/analysis`)** - NEW FASE 2
- ✅ Market Report styled like Atlantis report
- ✅ Market Overview (BTC, ETH, MCap, Fear & Greed)
- ✅ Alpha Crypto Assessment with recommendations
- ✅ Key Insights (bullish/bearish/neutral signals)
- ✅ Sector Analysis table (L1s, L2s, DeFi, AI, Memecoins)
- ✅ Recommended Allocations (Conservative/Balanced/Aggressive)

### 7. **Portfolio Page (`/portfolio`)** - NEW FASE 2
- ✅ Milk Road style portfolio display
- ✅ Total Value: $50,000, Monthly Return: +12%
- ✅ 6-Month Performance bar chart
- ✅ Allocation breakdown (BTC 35%, ETH 25%, SOL 20%, USDC 15%, ALTS 5%)
- ✅ Holdings table with live values
- ✅ Recent Trades section
- ✅ Strategy Notes (Current Strategy, Next Moves)

### 8. **Early Signals Page (`/signals`)** - NEW FASE 2
- ✅ Live Updates indicator
- ✅ Urgent Signals section (red border, PREMIUM badges)
- ✅ All Signals with priority badges (HIGH, MEDIUM, LOW)
- ✅ Signal types: opportunity, alert, news, community
- ✅ Action recommendations
- ✅ External links and timestamps

### 9. Admin Page (`/admin`)
- ✅ Payment verification dashboard
- ✅ Premium users list
- ✅ Feedback tab with submissions

### 10. Premium Subscription
- ✅ $20/month, Multi-chain payments
- ✅ Manual verification

### 11. Feedback System
- ✅ Footer form, MongoDB storage
- ✅ Admin panel review

## Navigation
- Home | Articles | Airdrops | Indices | Analysis | Portfolio | Signals

## Completed Tasks

### FASE 1 (February 2026)
- [x] Market Indices with Buy/Hold/Sell recommendations
- [x] Live crypto prices from CoinGecko API
- [x] 3 new Spanish articles
- [x] Airdrops with reward clarification
- [x] Feedback form + Admin panel

### FASE 2 (February 2026)
- [x] Investment Analysis page (Atlantis style)
- [x] Portfolio page (Milk Road style)
- [x] Early Signals page

## Upcoming Tasks - FASE 3 (P1)
- [ ] Consulting section with contact form
- [ ] Email alerts for new premium airdrops
- [ ] Sync data with Sanity CMS

## Future Tasks (P2)
- [ ] Migrate to Next.js for Vercel deployment
- [ ] Export project to GitHub
- [ ] User authentication system

## Backlog (P3)
- [ ] Automatic on-chain payment verification
- [ ] Real portfolio data connection
- [ ] Saved airdrops/favorites

## Key Endpoints

### New Endpoints (FASE 2)
- `GET /api/early-signals` - Get signals and opportunities

### Existing Endpoints
- `GET /api/articles` - List articles
- `GET /api/airdrops` - List airdrops
- `GET /api/crypto/prices` - Live CoinGecko prices
- `POST /api/feedback` - Submit feedback
- `GET /api/admin/feedback` - Admin feedback view

## Test Reports
- `/app/test_reports/iteration_1.json` - 15 DEX Airdrops feature
- `/app/test_reports/pytest/fase1_results.xml` - FASE 1 tests (21 passed)

## User's Preferred Language
Spanish (Español)
