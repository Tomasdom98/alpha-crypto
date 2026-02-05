# Alpha Crypto - PRD & Status Document

## Original Problem Statement
Build a full-stack crypto intelligence platform called "Alpha Crypto" with:
- Dark, professional, dynamic theme
- Free educational content ("Alpha Research")
- Verified airdrop information
- Real-time market data from live APIs
- ALPHA-I AI assistant (Claude Sonnet 4.5)
- Fully bilingual UI (Spanish/English)

## User Personas
- **Crypto Investors**: Looking for market signals and portfolio tracking
- **Airdrop Hunters**: Seeking verified airdrop opportunities
- **DeFi Enthusiasts**: Wanting educational content and market analysis
- **Spanish/English Speakers**: Requiring bilingual interface

## Core Requirements
✅ = Implemented | 🔄 = In Progress | ⏳ = Pending

### Content & Data
- ✅ Alpha Research articles with markdown rendering
- ✅ Verified airdrop listings (MOCKED)
- ✅ Live market data (CoinGecko, DeFiLlama, Alternative.me)
- ✅ Macro Calendar with economic events (MOCKED)
- ✅ Portfolio tracking with Yields and Staking sections

### UI/UX
- ✅ Dark professional theme
- ✅ Bilingual support (ES/EN) with language toggle
- ✅ Navigation split into Free/Premium sections
- ✅ ALPHA-I button prominent in header
- ✅ OwlSeal brand component with animations
- ✅ Mobile responsive design

### Features
- ✅ ALPHA-I AI Assistant (Claude Sonnet 4.5)
- ✅ Premium Modal with Monthly/Annual pricing
- ✅ Macro Calendar page
- ✅ Search and filtering on articles/airdrops
- ✅ Newsletter subscription popup

## What's Been Implemented

### December 5, 2025
- **Language Translation System**: Complete site-wide ES/EN toggle
  - Created LanguageContext for state management
  - Translated all pages: Home, Market Indices, Calendar, Portfolio, Articles, Airdrops
  - Translated all components: Navigation, Footer, PremiumModal, AlphaiChat, NewsletterPopup
  - Language preference saved in localStorage

### Previous Sessions
- Full-stack architecture with React + FastAPI + MongoDB
- Live API integrations (CoinGecko, DeFiLlama, Alternative.me)
- ALPHA-I assistant with Claude Sonnet 4.5
- Premium payment flow with QR codes
- Tab-based Portfolio with Yields and Staking
- Macro Calendar page with event filtering

## Architecture

```
/app/
├── backend/
│   ├── server.py         # FastAPI, all routes and mock data
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── LanguageContext.js  # Language state
│   │   ├── components/
│   │   │   ├── Navigation.js       # Language toggle
│   │   │   ├── PremiumModal.js     # Premium flow
│   │   │   ├── AlphaiChat.js       # AI assistant
│   │   │   ├── Footer.js
│   │   │   └── NewsletterPopup.js
│   │   └── pages/
│   │       ├── HomePage.js
│   │       ├── ArticlesPage.js
│   │       ├── AirdropsPage.js
│   │       ├── MarketIndicesPage.js
│   │       ├── MacroCalendarPage.js
│   │       └── PortfolioPage.js
```

## Key APIs
- **CoinGecko**: /api/crypto/prices, /api/crypto/global
- **DeFiLlama**: /api/crypto/stablecoins, /api/crypto/defi-tvl
- **Alternative.me**: /api/crypto/fear-greed
- **Internal**: /api/articles, /api/airdrops, /api/alphai/chat

## Prioritized Backlog

### P0 (Critical) - DONE
- ✅ Site-wide language translation (ES/EN)

### P1 (High Priority)
- ⏳ Add real protocol logos in Airdrops and Yields sections

### P2 (Medium Priority)
- ⏳ Admin panel for newsletter management
- ⏳ Stripe integration for premium payments
- ⏳ Connect Macro Calendar to live APIs

### P3 (Lower Priority)
- ⏳ Push/email notifications system
- ⏳ Domain verification for Resend emails
- ⏳ Advanced analytics dashboard

## Testing Status
- Last test: iteration_4.json - 100% pass rate on frontend language tests
- All language translations verified working

## Mocked Data
The following data is currently MOCKED in the backend:
- Articles content
- Airdrop listings
- Macro Calendar events
- Staking data

## 3rd Party Integrations
| Service | Status | Purpose |
|---------|--------|---------|
| CoinGecko | ✅ Live | Crypto prices |
| DeFiLlama | ✅ Live | TVL, Stablecoins |
| Alternative.me | ✅ Live | Fear & Greed |
| Emergent LLM (Claude) | ✅ Live | ALPHA-I assistant |
| Sanity.io | ⏳ Pending | CMS (secondary) |
| Resend | ⏳ Pending | Emails (needs domain verification) |
| Stripe | ⏳ Pending | Payments |
