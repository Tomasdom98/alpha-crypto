# Alpha Crypto - Product Requirements Document

## Overview
Alpha Crypto is a full-stack crypto alpha platform providing market insights, airdrop tracking, premium content, portfolio transparency, and investment analysis for crypto investors.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Recharts
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **CMS:** Sanity.io (Project ID: 15c5x8s5) - Integrated with automatic fallback to mock data
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
- ✅ **Sanity CMS integration** (uses Sanity if 3+ articles, otherwise mock data)

### 3. Airdrops Page (`/airdrops`)
- ✅ 15 perpetuals DEX airdrops
- ✅ **Professional UI Avatar logos** with project initials and distinct colors
- ✅ Reward clarification notes
- ✅ Premium badges, Chain badges
- ✅ **Sanity CMS integration** (uses Sanity if 5+ airdrops, otherwise mock data)

### 4. Airdrop Detail Page (`/airdrops/:id`)
- ✅ Full info, interactive task checklist
- ✅ Investors & backing, Timeline

### 5. Market Indices Page (`/indices`)
- ✅ Buy/Hold/Sell recommendations
- ✅ Signal explanations on each card
- ✅ Fear & Greed gauge

### 6. Investment Analysis Page (`/analysis`)
- ✅ Market Report styled like Atlantis report
- ✅ Market Overview (BTC, ETH, MCap, Fear & Greed)
- ✅ Alpha Crypto Assessment with recommendations
- ✅ Key Insights (bullish/bearish/neutral signals)
- ✅ Sector Analysis table (L1s, L2s, DeFi, AI, Memecoins)
- ✅ Recommended Allocations (Conservative/Balanced/Aggressive)

### 7. Portfolio Page (`/portfolio`)
- ✅ Milk Road style portfolio display
- ✅ Total Value: $50,000, Monthly Return: +12%
- ✅ 6-Month Performance bar chart
- ✅ Allocation breakdown (BTC 35%, ETH 25%, SOL 20%, USDC 15%, ALTS 5%)
- ✅ Holdings table with live values
- ✅ Recent Trades section
- ✅ Strategy Notes (Current Strategy, Next Moves)

### 8. Early Signals Page (`/signals`)
- ✅ Live Updates indicator
- ✅ Urgent Signals section (red border, PREMIUM badges)
- ✅ All Signals with priority badges (HIGH, MEDIUM, LOW)
- ✅ Signal types: opportunity, alert, news, community
- ✅ Action recommendations
- ✅ External links and timestamps
- ✅ Email Alert Subscription (FASE 3)
- ✅ **Sanity CMS integration** (uses Sanity if 3+ signals, otherwise mock data)

### 9. Consulting Page (`/consulting`) - FASE 3 ✅
- ✅ Service type selection (Personal/Business Consulting)
- ✅ Contact form (name, email, company optional, message)
- ✅ Success state with "Message Sent!" confirmation
- ✅ Privacy commitment section
- ✅ Submissions saved to MongoDB

### 10. Admin Page (`/admin`)
- ✅ Payment verification dashboard (Pending/Verified tabs)
- ✅ Premium users list (Users tab)
- ✅ Feedback tab with submissions
- ✅ Consulting tab (FASE 3) - View/manage consulting requests
- ✅ Subscribers tab (FASE 3) - View email alert subscribers

### 11. Premium Subscription
- ✅ $20/month, Multi-chain payments
- ✅ Manual verification

### 12. Feedback System
- ✅ Footer form, MongoDB storage
- ✅ Admin panel review

## Navigation
Home | Articles | Airdrops | Indices | Analysis | Portfolio | Signals | Consulting

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

### FASE 3 (February 2026) ✅
- [x] Consulting page with Personal/Business service types
- [x] Consulting form with contact info and message
- [x] Email alert subscription in Signals page
- [x] Admin Consulting tab with status management
- [x] Admin Subscribers tab showing email list

### P1 Tasks (February 2026) ✅
- [x] **Sanity CMS Integration** - Backend connects to Sanity with intelligent fallback:
  - Articles: Uses Sanity if 3+ articles exist, otherwise mock data
  - Airdrops: Uses Sanity if 5+ airdrops exist, otherwise mock data
  - Signals: Uses Sanity if 3+ signals exist, otherwise mock data
- [x] **Professional Airdrop Logos** - UI Avatars with project initials (HL, DR, GR, etc.) and distinct brand colors
- [x] **Sanity Schema Documentation** - Created `/app/docs/SANITY_SCHEMAS.md` with complete schema definitions

## Sanity CMS Setup

### How Content Management Works
1. Backend attempts to fetch content from Sanity CMS first
2. If Sanity has sufficient content (3+ articles, 5+ airdrops, 3+ signals), it uses Sanity data
3. If Sanity has less content, it falls back to mock data
4. This ensures the app always has content while you build up CMS content

### Schemas Available
See `/app/docs/SANITY_SCHEMAS.md` for complete schema definitions:
- **article**: Title, slug, excerpt, content, category, premium, publishedAt, imageUrl
- **airdrop**: projectName, logoUrl, chain, description, fullDescription, backing, timeline, rewardNote, steps, estimatedReward, difficulty, deadline, status, link, premium
- **signal**: title, type, priority, description, action, link, timestamp, premium

## Future Tasks - P2
- [ ] Integrate real email service (Resend/SendGrid) for notifications
- [ ] Migrate to Next.js for Vercel deployment
- [ ] Export project to GitHub
- [ ] User authentication system

## Backlog - P3
- [ ] Automatic on-chain payment verification
- [ ] Real portfolio data connection
- [ ] Saved airdrops/favorites
- [ ] Search/filter functionality

## Key API Endpoints

### Sanity-Integrated Endpoints
- `GET /api/articles` - Articles from Sanity or mock data
- `GET /api/articles/{id}` - Single article
- `GET /api/airdrops` - Airdrops from Sanity or mock data
- `GET /api/airdrops/{id}` - Single airdrop
- `GET /api/early-signals` - Signals from Sanity or mock data

### FASE 3 Endpoints
- `POST /api/consulting` - Submit consulting request
- `GET /api/admin/consulting` - Get consulting requests (admin)
- `POST /api/admin/consulting/{id}/status` - Update consulting status
- `POST /api/alerts/subscribe` - Subscribe to email alerts
- `GET /api/admin/alert-subscribers` - Get alert subscribers (admin)

### Other Endpoints
- `GET /api/crypto/prices` - Live CoinGecko prices
- `GET /api/crypto/fear-greed` - Fear & Greed Index
- `POST /api/feedback` - Submit feedback
- `GET /api/admin/feedback` - Admin feedback view
- `GET /api/admin/payments` - Admin payments
- `GET /api/admin/users` - Premium users

## Database Collections (MongoDB)
- `payments` - Payment records
- `users` - User accounts
- `feedback` - Feedback submissions
- `consulting` - Consulting requests
- `alert_subscriptions` - Email alert subscribers

## Test Reports
- `/app/test_reports/iteration_1.json` - Airdrops feature
- `/app/test_reports/iteration_2.json` - FASE 3 (100% pass rate)
- `/app/test_reports/pytest/fase1_results.xml` - FASE 1 tests
- `/app/test_reports/pytest/fase3_results.xml` - FASE 3 tests

## User's Preferred Language
Spanish (Español)
