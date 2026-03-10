export const TICKER_ITEMS = [
  { sym:"SPY",   price:"581.42", chg:"+1.24%", up:true  },
  { sym:"BTC",   price:"67,840", chg:"+3.41%", up:true  },
  { sym:"QQQ",   price:"492.18", chg:"+1.87%", up:true  },
  { sym:"GLD",   price:"218.64", chg:"+0.62%", up:true  },
  { sym:"NVDA",  price:"875.40", chg:"+2.34%", up:true  },
  { sym:"ETH",   price:"3,521",  chg:"+2.11%", up:true  },
  { sym:"AAPL",  price:"189.74", chg:"+0.94%", up:true  },
  { sym:"GS",    price:"452.33", chg:"+0.76%", up:true  },
  { sym:"EUR/USD",price:"1.0842",chg:"+0.18%", up:true  },
  { sym:"VNQ",   price:"88.31",  chg:"-0.34%", up:false },
  { sym:"TSLA",  price:"248.50", chg:"-1.12%", up:false },
  { sym:"OIL",   price:"78.22",  chg:"+0.44%", up:true  },
];

export const MARKETS = [
  { sym:"SPY",  name:"S&P 500 ETF",    type:"ETF",      score:7.8, signal:"BUY",   chg:"+1.24%", up:true  },
  { sym:"QQQ",  name:"Nasdaq 100 ETF", type:"ETF",      score:8.1, signal:"BUY",   chg:"+1.87%", up:true  },
  { sym:"NVDA", name:"Nvidia Corp.",   type:"Stock",    score:8.4, signal:"BUY",   chg:"+2.34%", up:true  },
  { sym:"BTC",  name:"Bitcoin",        type:"Crypto",   score:6.9, signal:"HOLD",  chg:"+3.41%", up:true  },
  { sym:"ETH",  name:"Ethereum",       type:"Crypto",   score:7.1, signal:"BUY",   chg:"+2.11%", up:true  },
  { sym:"GLD",  name:"Gold ETF",       type:"Commodity",score:7.2, signal:"BUY",   chg:"+0.62%", up:true  },
  { sym:"AAPL", name:"Apple Inc.",     type:"Stock",    score:7.5, signal:"BUY",   chg:"+0.94%", up:true  },
  { sym:"VNQ",  name:"Vanguard REIT",  type:"REIT",     score:6.4, signal:"HOLD",  chg:"-0.34%", up:false },
  { sym:"TSLA", name:"Tesla Inc.",     type:"Stock",    score:5.4, signal:"WATCH", chg:"-1.12%", up:false },
  { sym:"OIL",  name:"Crude Oil ETF",  type:"Commodity",score:6.2, signal:"HOLD",  chg:"+0.44%", up:true  },
];

export const AGENTS = [
  {
    key:"screener", icon:"⬡", color:"#60A5FA",
    name:"Market Screener",
    role:"Opportunity Finder",
    tagline:"Scans every asset class simultaneously",
    desc:"Uses momentum, value, and quality signals to rank investment opportunities across stocks, ETFs, crypto, REITs, commodities, and forex — producing a scored shortlist with entry signals and specific risks.",
    output:["NVDA (Stock) — Score 8.4/10 — BUY","Why: AI capex cycle driving 217% data center revenue growth","Watch: Valuation at 34× forward P/E is stretched"],
  },
  {
    key:"portfolio", icon:"◎", color:"#34D399",
    name:"Portfolio Analyzer",
    role:"Risk Assessor",
    tagline:"Calculates your true risk exposure",
    desc:"Computes Sharpe ratio, max drawdown, sector concentration, and correlation heatmaps. Tells you exactly where your portfolio is vulnerable and how to rebalance before markets move against you.",
    output:["Volatility: HIGH — 60% tech concentration","Correlation risk: NVDA and QQQ are 91% correlated","Action: Trim tech 15%, add commodities & short-duration bonds"],
  },
  {
    key:"sentiment", icon:"◉", color:"#F87171",
    name:"Sentiment Agent",
    role:"Mood Reader",
    tagline:"Reads the crowd before you do",
    desc:"Scores market mood from -100 (panic) to +100 (euphoria). Identifies the macro drivers, upcoming catalysts, and contrarian signals that institutional investors act on — before retail catches on.",
    output:["Mood: Bullish 🟢 — Score +28","Driver: Fed rate cut expectations rising sharply","Catalyst: CPI data release in 5 days — watch for reversal"],
  },
  {
    key:"recommendation", icon:"◆", color:"#A78BFA",
    name:"Recommendation Engine",
    role:"Signal Generator",
    tagline:"Turns analysis into precise, actionable signals",
    desc:"Synthesizes all three agent outputs into a decisive BUY/HOLD/SELL signal with entry zone, stop-loss, bull/base/bear price targets, and exact portfolio position sizing — all justified with plain-English reasoning.",
    output:["Signal: BUY 🟢 — NVDA","Target $940 | Entry $870–880 | Stop-loss $820","Position size: 4% of portfolio"],
  },
  {
    key:"orchestrator", icon:"◈", color:"#D4AF6A",
    name:"Orchestrator",
    role:"Master Synthesizer",
    tagline:"Delivers one clear, explained answer",
    desc:"Reads all four specialist outputs, resolves any conflicts, eliminates redundancy, and streams a single plain-English answer — explaining the WHY behind every conclusion so you can make an informed decision.",
    output:["Direct answer first — no preamble","Explains WHY, not just WHAT","Streams word-by-word in real time as it thinks"],
  },
];

export const PIPELINE_STEPS = [
  {
    n:1, color:"#60A5FA",
    title:"Parallel Analysis",
    timing:"~3 seconds",
    agents:["screener","portfolio","sentiment"],
    what:"Your question is broadcast simultaneously to three specialist agents. They work in parallel — not one after another — so you get three deep, independent analyses in the time it would normally take one agent to finish.",
    why:"Parallelism means no trade-off between breadth and speed. Each agent stays focused on its domain without being influenced by the others.",
  },
  {
    n:2, color:"#A78BFA",
    title:"Synthesis",
    timing:"~2 seconds",
    agents:["recommendation"],
    what:"The Recommendation Engine receives all three outputs and synthesizes them into specific BUY/HOLD/SELL signals — with entry zones, stop-losses, price targets, and exact position sizing.",
    why:"One agent synthesizing three independent analyses produces far better recommendations than any single agent doing everything at once.",
  },
  {
    n:3, color:"#D4AF6A",
    title:"Orchestrated Streaming",
    timing:"live",
    agents:["orchestrator"],
    what:"The Orchestrator reads all four agent outputs, resolves any conflicts, and streams a plain-English final answer directly to your screen — word by word, as it's generated.",
    why:"Streaming means you start reading immediately instead of waiting. The Orchestrator adds the 'why' layer — translating raw analysis into decisions a real person can act on.",
  },
];

export const FEATURES = [
  { icon:"⬡", color:"#60A5FA", title:"Multi-Asset Screening",   desc:"Screen stocks, ETFs, crypto, REITs, commodities, and forex with a unified 1–10 InvestIQ score based on momentum, value, and quality signals." },
  { icon:"◎", color:"#34D399", title:"Portfolio Risk Analysis",  desc:"Sharpe ratio, max drawdown, sector concentration, and correlation heatmaps. Know exactly where risk lives before you act." },
  { icon:"◉", color:"#F87171", title:"Sentiment Radar",          desc:"Sentiment scoring per asset class from -100 to +100. Spot institutional vs retail divergence before the crowd reacts." },
  { icon:"◆", color:"#A78BFA", title:"Precision Signals",        desc:"BUY/HOLD/SELL with entry zones, stop-losses, bull/base/bear targets, and position sizing — fully reasoned in plain English." },
  { icon:"◈", color:"#D4AF6A", title:"Parallel Agent Pipeline",  desc:"Three agents run simultaneously, then sequential synthesis. Five analysts' depth delivered in under eight seconds." },
  { icon:"◇", color:"#FBBF24", title:"Full Transparency",        desc:"Every answer shows the complete agent reasoning chain. Expand any response to inspect what each specialist found independently." },
];

export const SENTIMENT_DATA = [
  { label:"Equities",    score:62, color:"#34D399" },
  { label:"Crypto",      score:44, color:"#D4AF6A" },
  { label:"Real Estate", score:28, color:"#F87171" },
  { label:"Commodities", score:71, color:"#60A5FA" },
  { label:"Forex",       score:38, color:"#A78BFA" },
];

export const SUGGESTIONS = [
  "What are the best AI sector stocks to buy right now?",
  "Should I hedge my equity portfolio with gold or Bitcoin?",
  "Analyze macro risks for equity investors this quarter",
  "Compare REITs vs dividend stocks for passive income",
  "Best ETFs for long-term wealth building in 2025",
  "How should I position for a Fed rate cut cycle?",
];