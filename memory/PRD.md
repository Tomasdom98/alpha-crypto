# Alpha Crypto - Product Requirements Document

## Overview
Alpha Crypto is a full-stack crypto alpha platform providing market insights, airdrop tracking, and premium content for crypto investors.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **CMS:** Sanity.io (Project ID: 15c5x8s5)
- **APIs:** CoinGecko (prices), Alternative.me (Fear & Greed Index)

## Core Features

### 1. Homepage
- Live crypto price ticker
- Fear & Greed Index with gauge visualization
- Market indicators with glassmorphism cards
- Article and airdrop previews from Sanity CMS
- Premium subscription CTA

### 2. Articles Page (`/articles`)
- List of articles from Sanity CMS
- Category filtering
- Search functionality

### 3. Airdrops Page (`/airdrops`)
- **COMPLETED:** List of 15 DEX airdrops with detailed info
- Clickable cards showing: project name, logo, description, chain, difficulty, deadline, estimated reward, timeline, tasks preview
- Premium badge for exclusive airdrops
- Filters: status, difficulty

### 4. Airdrop Detail Page (`/airdrops/:id`)
- **COMPLETED:** Full airdrop information display
- Logo, title, premium badge
- Full description ("About This Airdrop")
- Investor & backing information
- Timeline info
- Interactive task checklist with progress bar
- "Start This Airdrop" button with referral link
- Back navigation

### 5. Market Indices Page (`/indices`)
- Comprehensive dashboard of market metrics
- Bitcoin Rainbow indicator
- Altcoin Season Index
- DeFi TVL tracking
- Top gainers/losers

### 6. Admin Page (`/admin`)
- Payment verification dashboard
- View pending and verified payments
- Manual payment verification for premium subscriptions

### 7. Premium Subscription
- $20/month pricing
- Multi-chain payments: Solana, Base, Arbitrum (USDC)
- QR code payment flow
- Manual verification process

## Data Sources

### Live APIs
- Fear & Greed Index: Alternative.me API
- Crypto prices: CoinGecko API

### MOCKED Data (Intentional)
- 15 DEX Airdrops with full details (in `backend/server.py`)
- Market indicators (Bitcoin dominance, DeFi TVL, etc.)

## Completed Tasks (December 2025)
- [x] Sanity CMS integration for articles and airdrops
- [x] Homepage UI/UX with glassmorphism and professional fintech design
- [x] Market Indices dashboard
- [x] Premium subscription payment flow (Solana/Base/Arbitrum)
- [x] Admin panel for payment verification
- [x] **15 DEX Airdrops with detail pages** - Full implementation with:
  - List view showing all 15 airdrops
  - Detail view with full info, tasks, backing, timeline
  - Interactive task checklist with progress tracking
  - Premium badges for exclusive airdrops

## Upcoming Tasks (P1)
- [ ] Sync airdrop data with Sanity CMS (replace mock data)
- [ ] Add search/filter to airdrops page

## Future Tasks (P2)
- [ ] Migrate to Next.js for Vercel deployment
- [ ] Export project to GitHub
- [ ] Implement Investment Analysis page (`/analysis`)
- [ ] Add article detail pages

## Backlog (P3)
- [ ] Automatic on-chain payment verification
- [ ] User authentication system
- [ ] Saved airdrops/favorites feature

## Key Endpoints

### Airdrops API
- `GET /api/airdrops` - List all airdrops (currently mock data)
- `GET /api/airdrops/:id` - Get single airdrop by ID
- `POST /api/airdrops/:id/tasks/:taskId/toggle` - Toggle task completion

### Articles API
- `GET /api/articles` - List articles from Sanity
- `GET /api/articles/:id` - Get single article

### Market Data API
- `GET /api/crypto/prices` - Crypto prices
- `GET /api/crypto/fear-greed` - Fear & Greed Index (live)
- `GET /api/market-indices` - Market indicators

### Payments API
- `POST /api/payments/submit` - Submit payment
- `GET /api/admin/payments` - Get payments (admin)
- `POST /api/admin/payments/:id/verify` - Verify payment

## Test Reports
- `/app/test_reports/iteration_1.json` - 15 DEX Airdrops feature (100% pass rate)
