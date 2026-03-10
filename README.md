# InvestIQ — Multi-Agent AI Investment Platform

A professional investment intelligence platform powered by 5 specialized AI agents using Groq API.

## Agents
- **Market Screener** — ranks opportunities across all asset classes
- **Portfolio Analyzer** — risk, allocation, correlation analysis
- **News & Sentiment** — macro mood and catalyst detection
- **Recommendation Engine** — BUY/SELL signals with scoring
- **Orchestrator** — synthesizes all agents into one answer

## Setup

1. Clone the repo
2. Install dependencies:
```bash
   npm install
```
3. Copy `.env.example` to `.env` and add your Groq API key:
```bash
   cp .env.example .env
```
4. Get a free key at https://console.groq.com
5. Run the dev server:
```bash
   npm run dev
```

## Stack
- React + Vite
- Groq API (llama-3.3-70b-versatile)
- No backend — runs entirely in the browser

## Disclaimer
Not financial advice.
