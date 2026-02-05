# Alpha Crypto - Product Requirements Document

## Overview
Alpha Crypto is a full-stack crypto alpha platform providing market insights, airdrop tracking, educational content, and investment analysis for crypto investors. The platform is designed with a dark, professional theme inspired by "The Milk Road".

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Recharts
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **CMS:** Sanity.io (Project ID: 15c5x8s5) - Integrated with automatic fallback
- **APIs:** CoinGecko (live prices), Alternative.me (Fear & Greed Index)
- **Email:** Resend (for form notifications)

## Language
- Site language: **Spanish (LATAM)**
- All sections translated to Spanish

## Brand Identity
- **Logo:** Text-based `αC Alpha Crypto`
  - α (alpha) in emerald-400
  - C in white
  - "Alpha Crypto" in white with green hover
  - Location: Header and Footer
  
- **Owl Seal:** Component `/app/frontend/src/components/OwlSeal.js`
  - Fixed position bottom-right on all pages
  - Opacity: 35%
  - Professional technological design

## Core Features

### 1. Homepage ✅
- Live crypto ticker (BTC, ETH, SOL, USDC)
- Fear & Greed Index gauge
- Market indicators
- Two-tier premium banner

### 2. Articles Page (`/articles`) ✅
- 5 complete educational articles in Spanish
- Milk Road style content with tables, blockquotes, emojis
- Category tags displayed (USDC, USDT, Pagos, etc.)
- Read time indicator
- Click to read full article

### 3. Article Detail Page ✅ (Updated Feb 2026)
- Rich markdown rendering (headers, lists, blockquotes, tables)
- Dynamic read time from backend
- Category tags from article data
- Share functionality
- Responsive design

### 4. Airdrops Page (`/airdrops`) ✅
- 15 verified airdrops with referral links
- Educational intro section
- Task tracking
- Difficulty indicators

### 5. Market Indices Page (`/indices`) ✅
- Fear & Greed, MVRV, BTC Dominance, Rainbow Chart
- Sparkline charts
- Large format charts with mock data
- Buy/Hold/Sell recommendations

### 6. Premium Features
- Portfolio tracking
- Early Signals
- Consulting services

## Email Integration (Feb 2026)
- **Service:** Resend
- **Configured for:**
  - Feedback form notifications
  - Consulting request notifications
  - Newsletter welcome emails (on subscription)
  - Newsletter article distribution
- **Admin Email:** tomdomingueclaro@gmail.com
- **Note:** Requires domain verification for production use

## Newsletter System (Feb 2026) - NEW
- **Components:** 
  - `/app/frontend/src/components/NewsletterSignup.js` - Hero variant for homepage
  - `/app/frontend/src/components/NewsletterPopup.js` - Popup for articles page (5s delay)
- **Features:**
  - Popup appears after 5 seconds on Articles page
  - Saves to localStorage to avoid repeat popups
  - Welcome email on subscription
  - Article distribution endpoint
- **Backend Endpoints:**
  - `POST /api/alerts/subscribe` - Subscribe to newsletter
  - `POST /api/newsletter/send-article?article_id=X` - Send article to all subscribers
  - `GET /api/admin/alert-subscribers` - List all subscribers
  - `POST /api/alerts/unsubscribe` - Unsubscribe

## Real-Time Charts API (Feb 2026) - NEW
- **Data Source:** CoinGecko API with caching + mock fallback
- **Endpoints:**
  - `GET /api/crypto/chart/{coin_id}?days=30` - Historical price data
  - `GET /api/crypto/global` - Global market data (dominance, market cap)
- **Caching:** 5 minutes for charts, 2 minutes for global data
- **Fallback:** Auto-generates mock data if CoinGecko fails

## API Endpoints

### Public
- `GET /api/articles` - List all articles with tags
- `GET /api/articles/{id}` - Single article detail
- `GET /api/airdrops` - List airdrops
- `GET /api/crypto/prices` - Live prices (cached)
- `GET /api/crypto/fear-greed` - Fear & Greed index (cached)

### Form Submissions
- `POST /api/feedback` - Submit feedback (sends email)
- `POST /api/consulting` - Request consulting (sends email)

## Recent Updates (Feb 5, 2026)

### Completed
- [x] ArticleDetailPage - Rich markdown rendering
- [x] ArticleDetailPage - Dynamic tags and read_time
- [x] ArticlesPage - Category tags display
- [x] Backend - Resend email integration
- [x] Backend - Article model with tags/read_time fields
- [x] Newsletter Popup - 3 second delay on Articles page
- [x] Real-time APIs:
  - Stablecoins from DefiLlama (`/api/crypto/stablecoins`)
  - DeFi TVL from DefiLlama (`/api/crypto/defi-tvl`)
  - Global market data from CoinGecko (`/api/crypto/global`)
  - Historical charts (`/api/crypto/chart/{coin_id}`)
- [x] ALPHAI Chat Assistant:
  - GPT-4o-mini powered (gpt-4o for premium)
  - 5 free messages/day limit
  - Spanish language responses
  - DeFi/crypto specialist

### Pending
- [ ] Connect /indices page to use real API data
- [ ] Resend domain verification for production emails
- [ ] More airdrop verification

## Known Issues
- CoinGecko API rate limiting (falls back to cached/mock data)
- Resend in testing mode - emails only to verified addresses

## Color Scheme
- Background: #0f172a
- Cards: #1a1f2e 
- Accent: #10b981 (emerald-500)
- Text: white / gray-400

## Key Files
- `/app/backend/server.py` - API, cache, email integration
- `/app/frontend/src/pages/ArticleDetailPage.js` - Rich article view
- `/app/frontend/src/pages/ArticlesPage.js` - Articles grid with tags
- `/app/frontend/src/components/OwlSeal.js` - Brand seal component
