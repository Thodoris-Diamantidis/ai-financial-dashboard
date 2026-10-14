# AI Financial Dashboard

A full-stack web app for analysing and visualising stock and cryptocurrency trends, with AI-generated insights powered by Google Gemini.

Built as my Bachelor's thesis at the **International Hellenic University**, Department of Information and Electronic Engineering (supervisor: Asst. Prof. Stefanos Ougiaroglou).

**Live demo:** [ai-financial-dashboard-gold.vercel.app](https://ai-financial-dashboard-gold.vercel.app)

> **Status:** Completed in October 2025. The app depends on several third-party APIs on free tiers, so the live demo may be offline if a key has expired. Everything runs locally with your own keys (see [Getting started](#getting-started)).

<!-- Add screenshots here, e.g.
![Dashboard](docs/dashboard.png)
![Watchlist & AI analysis](docs/watchlist.png)
-->

## Features

- **Market dashboard:** live price cards and interactive charts for cryptocurrencies, plus TradingView charts for individual stocks.
- **Configurable charts:** switch coins and time ranges to explore price history.
- **Search:** command-palette search for stocks.
- **Accounts:** email and password sign-up, or Google sign-in, with JWT sessions in HTTP-only cookies.
- **Watchlist:** save favourite stocks and see price, change, market cap and P/E ratio in one table.
- **Price alerts:** set, edit and delete alerts per stock. A scheduled job checks prices and emails you when an alert triggers.
- **AI analysis:** pick a question about a stock in your watchlist (long-term outlook, risk analysis, or recent trend). The app sends the last 30 days of price data to Gemini and returns a plain-language analysis.
- **Daily AI news digest:** a scheduled job collects news for your watchlist, summarises it with Gemini, and emails you a personalised update.
- **AI welcome email:** new users get a personalised welcome email written by Gemini.
- **Light and dark themes.**

## Tech stack

| Layer | Technologies |
| --- | --- |
| Front end | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix UI), Recharts, TradingView widgets |
| Back end | Next.js Route Handlers and Server Actions, JWT auth (bcryptjs, jsonwebtoken), Google OAuth |
| Database | MongoDB Atlas |
| Background jobs | Inngest (event-driven and scheduled functions) |
| AI | Google Gemini via Inngest AI steps |
| Email | Nodemailer |
| Market data | Finnhub (stocks and news), CoinGecko (crypto), Polygon (historical stock prices for AI analysis) |
| Hosting | Vercel |

## Architecture

```
Browser (Next.js / React)
   │
   ├── Route Handlers & Server Actions ──► MongoDB Atlas
   │        │
   │        ├── Finnhub / CoinGecko / Polygon APIs
   │        └── sends events ──► Inngest
   │
Inngest functions (background)
   ├── user signs up      → Gemini writes welcome email → Nodemailer
   ├── daily (cron)       → fetch watchlist news → Gemini summary → email
   ├── daily (cron)       → check price alerts → alert email
   └── AI analysis event  → 30 days of prices → Gemini → saved to ai_runs
```

Slow work such as AI calls and emails runs in Inngest background functions, so the UI stays responsive and failed steps are retried automatically.

### Data model (MongoDB collections)

| Collection | Contents |
| --- | --- |
| `users` | profile, hashed password, watchlist and alerts |
| `crypto` | latest cryptocurrency market data |
| `coin_charts` | cached historical chart data per coin |
| `stock-news` | news articles fetched for stocks |
| `ai_runs` | saved results of each AI analysis |

## Getting started

### Prerequisites

- Node.js 20 or later
- A MongoDB Atlas cluster (the free tier works)
- API keys for Finnhub, CoinGecko (Demo), Polygon and Google Gemini
- An Inngest account, or the local Inngest Dev Server
- A Gmail account with an app password, for sending email
- A Google OAuth client ID, for Google sign-in

### Installation

```bash
git clone https://github.com/Thodoris-Diamantidis/ai-financial-dashboard.git
cd ai-financial-dashboard
npm install
```

Create a `.env.local` file in the project root:

```bash
# Database
MONGODB_URI=

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# Market data
FINNHUB_API_KEY=
NEXT_PUBLIC_FINNHUB_API_KEY=
COINGECKO_DEMO_API_KEY=
POLYGON_API_KEY=

# AI
GEMINI_API_KEY=

# Background jobs
INNGEST_EVENT_KEY=

# Email
NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=
```

Run the app:

```bash
npm run dev
```

In a second terminal, start the Inngest Dev Server so background jobs run locally:

```bash
npx inngest-cli@latest dev
```

Open [http://localhost:3000](http://localhost:3000) for the app and [http://localhost:8288](http://localhost:8288) for the Inngest dashboard.

## Project structure

```
app/
  (auth)/            login and register pages
  api/               route handlers: auth, crypto, stock news, watchlist, alerts, AI, Inngest
  components/        charts, watchlist, alerts, AI panel, navbar, search
  stocks/[symbol]/   stock detail page
  watchlist/         watchlist, alerts and AI analysis
  profile/           user profile
components/ui/       shadcn/ui components
hooks/               custom React hooks
lib/
  actions/           server actions (auth, watchlist, alerts, Finnhub)
  ingest/            Inngest client, functions and AI prompts
  nodemailer/        email client and templates
types/               shared TypeScript types
```

## Future work

- Support more asset types and longer analysis windows
- Add technical indicators to the charts
- Real-time price updates over WebSockets
- Automated tests

## Disclaimer

This project was built for educational purposes. Its AI analyses are not financial advice.

## Author

**Thodoris Diamantidis** · [GitHub](https://github.com/Thodoris-Diamantidis)
