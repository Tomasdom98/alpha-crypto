# Alpha Crypto

Professional Crypto Intelligence Platform - Your source of alpha in crypto.

## Features

- **Live Market Data**: Real-time prices from Kraken, Fear & Greed Index, Stablecoin market cap, DeFi TVL
- **Alpha Research**: Educational articles about crypto, DeFi, and market analysis
- **Verified Airdrops**: Curated list of verified airdrop opportunities
- **ALPHA-I Assistant**: AI-powered research assistant (Claude Sonnet 4.5)
- **Portfolio Tracking**: Track your portfolio with yield stablecoins and staking info
- **Macro Calendar**: Important market events (FOMC, CPI, etc.)
- **Bilingual**: Full Spanish/English support

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn/UI, Recharts
- **Backend**: FastAPI (Python), MongoDB
- **APIs**: Kraken (prices), DeFiLlama (stablecoins, TVL), Alternative.me (Fear & Greed)
- **AI**: Emergent LLM (Claude Sonnet 4.5)

## Environment Variables

### Backend (`backend/.env`)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=alpha_crypto
RESEND_API_KEY=your_resend_key
SENDER_EMAIL=your_verified_email
ADMIN_EMAIL=admin@example.com
EMERGENT_LLM_KEY=your_emergent_key
```

### Frontend (`frontend/.env`)
```
REACT_APP_BACKEND_URL=https://your-domain.com
```

## Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend
cd frontend
yarn install
yarn start
```

## Admin Panel

Access `/admin` to manage:
- Articles, Airdrops, Signals (CRUD)
- Newsletter subscribers
- Consulting requests
- User feedback
- Payment verification

## License

Proprietary - Alpha Crypto
