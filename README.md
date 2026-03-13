<div align="center">

# ◈ ARIA — AI Stock Market Assistant

### *Institutional-grade portfolio intelligence, powered by AI*

<br/>

<!-- Tech Stack Icons -->
<img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
<img src="https://img.shields.io/badge/CSS_Modules-Scoped-264de4?style=for-the-badge&logo=css3&logoColor=white" alt="CSS Modules"/>
<img src="https://img.shields.io/badge/React_Router-v6-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router"/>
<img src="https://img.shields.io/badge/Recharts-2.12-22B5BF?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Recharts"/>

<br/>
<br/>

<img src="https://img.shields.io/badge/Groq-LLM_API-F55036?style=for-the-badge&logo=groq&logoColor=white" alt="Groq"/>
<img src="https://img.shields.io/badge/Llama_3.1-8B_Instant-blueviolet?style=for-the-badge&logo=meta&logoColor=white" alt="Llama"/>
<img src="https://img.shields.io/badge/Finnhub-Live_Data-00C805?style=for-the-badge&logo=databricks&logoColor=white" alt="Finnhub"/>
<img src="https://img.shields.io/badge/Yahoo_Finance-Charts-6001D2?style=for-the-badge&logo=yahoo&logoColor=white" alt="Yahoo Finance"/>
<img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
<img src="https://img.shields.io/badge/Node.js-Serverless-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>

<br/>
<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-aria--stock--assistant.vercel.app-7eb8f7?style=for-the-badge)](https://aria-stock-assistant.vercel.app)
[![GitHub Stars](https://img.shields.io/github/stars/Nauman123-coder/ARIA-Stock-Assistant?style=for-the-badge&color=f0c060&logo=github&logoColor=white)](https://github.com/Nauman123-coder/ARIA-Stock-Assistant/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-58e8a2?style=for-the-badge)](LICENSE)

<br/>

<img src="public/images/image2.png" alt="ARIA Dashboard Preview" width="85%" style="border-radius:16px;"/>

<br/>
<br/>

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment-on-vercel)
- [Architecture](#-architecture-deep-dive)
- [Dashboard Tabs](#-dashboard-tabs)
- [API Reference](#-api-reference--limits)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 Overview

**ARIA** (Advanced Real-time Investment Assistant) is a full-stack AI-powered stock market platform that delivers institutional-grade financial analysis to every type of investor — from complete beginners to seasoned traders.

Ask questions in plain English about your portfolio, get live market data, explore interactive charts with AI-powered forecasting, analyze your risk exposure, and learn investing concepts through a built-in AI-taught curriculum — all in one polished, real-time interface.

Built with **React 18**, streamed via **Groq's lightning-fast LLM API**, charted with **Recharts**, and deployed on **Vercel** with a custom serverless proxy for Yahoo Finance historical data.

```
User asks: "What's my biggest risk right now?"

ARIA responds instantly with:
  ✦ Portfolio concentration breakdown
  ✦ Sector imbalance detection  
  ✦ Specific position-level risk flags
  ✦ Clear rebalancing recommendation
```

---

## 🌐 Live Demo

> **[https://aria-stock-assistant.vercel.app](https://aria-stock-assistant.vercel.app)**

The live demo uses real market data. To enable the AI chat and portfolio features, you will need to add your own API keys in the Vercel environment variable settings.

---

## ✨ Features

### 🤖 AI Chat Assistant
- Powered by **Groq's `llama-3.1-8b-instant`** — one of the fastest LLMs available, responding in under a second
- Full awareness of your **live portfolio** — holdings, cost basis, unrealized P&L, sector weights
- Unique **DOM-write streaming architecture** — tokens are written directly to the DOM with zero React re-renders during streaming, completely preventing browser freeze
- Conversation history is maintained across the full session for deep follow-up questioning
- Rich markdown responses — tables, headers, bold, blockquotes, code blocks
- **Stop button** with AbortController to cancel any in-progress response

### 📈 Interactive Stock Charts
- Historical OHLCV data from **Yahoo Finance v8 API**, fetched through a Vercel serverless proxy
- **6 selectable time periods** — 1W · 1M · 3M · 6M · 1Y · 2Y
- **AI Forecast mode** — 30-day price projection using linear regression with a widening volatility confidence band
- **Volume overlay** — trading volume bars on a secondary Y-axis to reveal accumulation and distribution
- Rich **OHLCV tooltip** on every data point
- Period stats bar showing high, low, average price, and % return
- Retry button on error with clear error messaging

### 💼 Portfolio Analytics
- **Real-time P&L** across all 6 holdings using live Finnhub quotes
- Color-coded performance table — instantly see winners vs laggards
- **Sector allocation donut chart** — recalculates live as prices move
- Performance **ranking bar chart** — visualizes relative returns across positions
- AI risk analysis computes concentration risk, correlation flags, and tail-risk positions on demand

### 📡 Live Market Data
- Real-time quotes from **Finnhub's institutional-grade API**
- Auto-refreshes every **2 minutes** with no user action needed
- Live **scrolling ticker tape** at the top of every screen
- **S&P 500 · NASDAQ · DOW · VIX** index cards with live values and change %
- 10-stock market overview grid with real-time color-coded indicators

### 🔍 Stock Search
- Search by ticker symbol or company name
- Click any result to instantly load a full interactive chart
- **Top Gainers** and **Top Losers** auto-ranked on every data refresh
- Click-to-chart from the market overview with zero navigation

### 🎓 Investment Academy
- **30 structured lessons** across 6 learning tracks
- Lessons stream **word-by-word in real time** — like a live briefing from a senior analyst
- **5-question scenario-based quiz** after every lesson with full answer explanations
- **Progress tracking** across all 30 lessons with completion percentage stored locally
- **Custom topic mode** — ask ARIA to teach you anything outside the curriculum

#### Learning Tracks
| Track | Level | Topics |
|-------|-------|--------|
| 🏛️ Market Fundamentals | Beginner | Stocks, bonds, indices, market hours, order types |
| 📊 Fundamental Analysis | Intermediate | P/E, EPS, balance sheet, DCF, MOAT framework |
| 📈 Technical Analysis | Intermediate | Moving averages, RSI, MACD, support/resistance |
| 🎯 Investment Strategies | Beginner–Intermediate | Value investing, growth, DCA, dividend strategy |
| 🛡️ Risk Management | Intermediate–Advanced | Position sizing, stop-loss, correlation, hedging |
| ⚡ Advanced Concepts | Advanced | Options, sector rotation, behavioral finance, yield curves |

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **UI Framework** | React | 18.2 | Component-based SPA |
| **Routing** | React Router DOM | v6.22 | Client-side navigation |
| **Styling** | CSS Modules | — | Scoped component styles |
| **Charts** | Recharts | 2.12.7 | Interactive ComposedChart |
| **AI Model** | Groq — Llama 3.1 8B | Instant | Streaming chat responses |
| **Live Quotes** | Finnhub API | v1 | Real-time stock prices |
| **Chart History** | Yahoo Finance | v8 | Historical OHLCV candles |
| **Proxy** | Vercel Serverless | Node.js | Bypass Yahoo Finance CORS |
| **Deployment** | Vercel | — | CI/CD + CDN + Serverless |
| **Build Tool** | Create React App | 5.0.1 | Webpack + Babel pipeline |
| **Typography** | Playfair Display, Outfit, JetBrains Mono | — | Design system fonts |

---

## 📁 Project Structure

```
ARIA-Stock-Assistant/
│
├── api/
│   └── yahoo.js                    # Vercel serverless function — Yahoo Finance proxy
│
├── public/
│   ├── index.html                  # HTML shell
│   └── images/                     # Feature screenshots (image1.png – image6.png)
│
├── src/
│   │
│   ├── components/
│   │   ├── ChatPanel.js            # AI chat UI with DOM-write streaming
│   │   ├── MarkdownMessage.js      # Rich markdown renderer (tables, code, lists)
│   │   ├── StockChart.js           # Full interactive chart + forecast + volume
│   │   ├── MiniChart.js            # Compact sparkline for watchlist/overview
│   │   ├── DonutChart.js           # Sector allocation donut visualization
│   │   ├── LearnTab.js             # Investment Academy — lessons, quiz, progress
│   │   └── TickerTape.js           # Live scrolling price ticker tape
│   │
│   ├── hooks/
│   │   ├── useGroqChat.js          # Groq streaming — zero-render architecture
│   │   └── useStockData.js         # Finnhub quotes + Yahoo Finance history hook
│   │
│   ├── pages/
│   │   ├── LandingPage.js          # Marketing homepage with scroll animations
│   │   ├── LandingPage.module.css  # Landing page styles
│   │   ├── DashboardPage.js        # Main 5-tab application dashboard
│   │   └── DashboardPage.module.css
│   │
│   ├── utils/
│   │   └── data.js                 # Shared constants, helpers, and config
│   │
│   ├── App.js                      # Router — / → Landing, /dashboard → App
│   ├── index.js                    # React DOM entry point
│   └── index.css                   # Global styles, CSS variables, keyframes
│
├── .env                            # API keys (never committed)
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed and ready:

- **Node.js** v16 or higher — [nodejs.org](https://nodejs.org)
- A free **Groq API key** — [console.groq.com](https://console.groq.com)
- A free **Finnhub API key** — [finnhub.io](https://finnhub.io)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Nauman123-coder/ARIA-Stock-Assistant.git
cd ARIA-Stock-Assistant
```

### Step 2 — Run the Setup Script

```bash
bash setup.sh
```

This generates all source files into the correct directory structure.

### Step 3 — Install Dependencies

```bash
npm install
```

### Step 4 — Configure Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_GROQ_API_KEY=your_groq_api_key_here
REACT_APP_FINNHUB_KEY=your_finnhub_api_key_here
```

> ⚠️ **Important:** Never commit your `.env` file. It is already included in `.gitignore`.

### Step 5 — Add Feature Images

Copy your feature screenshots into the public folder:

```
public/
└── images/
    ├── image1.png   ← AI Chat feature
    ├── image2.png   ← Live Market Data
    ├── image3.png   ← Interactive Charts
    ├── image4.png   ← Portfolio Analytics
    ├── image5.png   ← Markets Overview
    └── image6.png   ← Investment Academy
```

### Step 6 — Start the App

```bash
npm start
# App runs at http://localhost:3000
```

---

## 🔐 Environment Variables

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|-------------|
| `REACT_APP_GROQ_API_KEY` | ✅ Yes | Powers the AI chat assistant | [console.groq.com](https://console.groq.com) |
| `REACT_APP_FINNHUB_KEY` | ✅ Yes | Live stock quotes and index data | [finnhub.io](https://finnhub.io) |

Both APIs have **generous free tiers** — no credit card required.

---

## ☁️ Deployment on Vercel

ARIA is purpose-built for zero-config Vercel deployment. The `api/yahoo.js` serverless function is automatically detected and deployed alongside the React app.

### Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your `ARIA-Stock-Assistant` repository
4. Vercel auto-detects **Create React App** — no settings to change
5. Before deploying, go to **Environment Variables** and add:

```
REACT_APP_GROQ_API_KEY   →   your_groq_key
REACT_APP_FINNHUB_KEY    →   your_finnhub_key
```

6. Click **Deploy** — live in ~2 minutes

### Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

### Auto-Redeploy

Every `git push` to `main` triggers an automatic redeploy. No manual steps needed after the initial setup.

---

## 🏗️ Architecture Deep Dive

### Zero-Render Streaming Chat

The AI chat system uses a custom DOM-write architecture to eliminate browser freeze during streaming:

```
Normal approach (causes freeze):
  Token arrives → setMessages() → React re-renders entire chat → Parse markdown → Repeat 200×

ARIA's approach (zero freeze):
  Token arrives → insertAdjacentText() → DOM updates instantly → React untouched
  Stream ends  → setMessages() called ONCE → Final markdown rendered
```

- `insertAdjacentText('beforeend', delta)` appends each token directly to a `<pre>` DOM node
- `setMessages()` is called **exactly twice** per response — once to add the placeholder, once to finalize
- `await new Promise(r => setTimeout(r, 0))` every 8 chunks yields the main thread back to the browser
- Auto-scroll is throttled to every ~60 characters to avoid layout thrash

### Yahoo Finance Serverless Proxy

```
Browser → /api/yahoo?symbol=AAPL&range=3mo → Vercel Edge → Yahoo Finance API
                                                  ↑
                              Server-side Node.js with browser User-Agent header
                              Yahoo sees a server request, not a browser → no 403
                              Response cached 5 minutes via CDN Cache-Control
```

The function tries `query1.finance.yahoo.com` first, falls back to `query2` automatically.

### Stable History Cache

```javascript
// ❌ Wrong — causes infinite reload loop
const [historyCache, setHistoryCache] = useState({});
// Writing to state → loadHistory recreated → StockChart useEffect re-runs → loop

// ✅ Correct — stable reference, never triggers re-renders  
const cacheRef = useRef({});
// Writing to ref → nothing re-renders → loadHistory has empty deps → stable forever
```

---

## 📊 Dashboard Tabs

| Tab | Key Features |
|-----|-------------|
| **📊 Dashboard** | Portfolio summary cards, holdings P&L table, sector donut chart, watchlist with sparklines, interactive chart |
| **💼 Portfolio** | Full position breakdown, real-time P&L, sector allocation, performance ranking chart |
| **🌐 Markets** | 10-stock live grid, S&P/NASDAQ/DOW/VIX cards, top gainers & losers, click-to-chart |
| **🔍 Search** | Symbol/company search, instant chart load, live price header |
| **🎓 Learn** | 30 AI-streamed lessons, scenario quizzes, progress tracking, custom topics |

---

## 🔑 API Reference & Limits

| API | Free Tier | Rate Limit | Used For |
|-----|-----------|------------|---------|
| **Groq** | 14,400 req/day | 30 req/min | AI chat responses (streaming) |
| **Finnhub** | Unlimited quotes | 60 calls/min | Live stock & index quotes |
| **Yahoo Finance** | Unlimited | Soft limits | Historical OHLCV chart data |

> All three APIs work on free tiers with no credit card required. ARIA is designed to stay well within these limits — Finnhub calls are throttled with a 130ms delay between requests.

---

## 📸 Screenshots

<div align="center">

| AI Chat Assistant | Interactive Charts |
|:-----------------:|:-----------------:|
| <img src="public/images/image1.png" width="100%"/> | <img src="public/images/image3.png" width="100%"/> |

| Portfolio Analytics | Investment Academy |
|:-------------------:|:-----------------:|
| <img src="public/images/image4.png" width="100%"/> | <img src="public/images/image6.png" width="100%"/> |

</div>

---

## 🤝 Contributing

Contributions, issues, and feature requests are very welcome. Here's how to get started:

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/ARIA-Stock-Assistant.git

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes and commit
git add .
git commit -m "Add: clear description of your change"

# 5. Push to your fork
git push origin feature/your-feature-name

# 6. Open a Pull Request on GitHub
```

### Ideas for Contributions

- 🔔 Price alert notifications
- 📰 News feed integration per stock
- 🌙 Additional theme options
- 📱 Mobile-optimized chart interactions
- 🔐 User authentication and saved portfolios
- 📤 Portfolio export to CSV / PDF

---

## 👨‍💻 Author

<div align="center">

**Nauman**

[![GitHub](https://img.shields.io/badge/GitHub-Nauman123--coder-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Nauman123-coder)

</div>

---

<div align="center">

*Built with ◈ ARIA — where AI meets the market*

**If this project helped you, please consider giving it a ⭐ star on GitHub!**

</div>
