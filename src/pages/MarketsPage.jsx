import { useState, useEffect, useCallback, useRef } from "react";
import { SENTIMENT_DATA } from "../data/constants.js";

/* ── Finnhub helpers ─────────────────────────────────────────── */
// Read key lazily at call time — handles hot-reload and env injection timing
const getFKey = () =>
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_FINNHUB_KEY) || "";

const FH = "https://finnhub.io/api/v1";
async function fhGet(path) {
  const key = getFKey();
  if (!key) throw new Error("NO_KEY");
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${FH}${path}${sep}token=${key}`);
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  return res.json();
}
const TICKER_MAP = {
  SPY:"SPY",QQQ:"QQQ",NVDA:"NVDA",AAPL:"AAPL",TSLA:"TSLA",
  GS:"GS",VNQ:"VNQ",BTC:"BINANCE:BTCUSDT",ETH:"BINANCE:ETHUSDT",
  GLD:"GLD",OIL:"USO",
};
const SEED = [
  {sym:"SPY",  name:"S&P 500 ETF",    type:"ETF",      score:7.8,signal:"BUY",  c:581.42,pc:573.25,dp:1.42},
  {sym:"QQQ",  name:"Nasdaq 100 ETF", type:"ETF",      score:8.1,signal:"BUY",  c:492.18,pc:482.90,dp:1.92},
  {sym:"NVDA", name:"Nvidia Corp.",   type:"Stock",    score:8.4,signal:"BUY",  c:875.40,pc:854.92,dp:2.40},
  {sym:"BTC",  name:"Bitcoin",        type:"Crypto",   score:6.9,signal:"HOLD", c:67840, pc:65610, dp:3.40},
  {sym:"ETH",  name:"Ethereum",       type:"Crypto",   score:7.1,signal:"BUY",  c:3521,  pc:3447,  dp:2.15},
  {sym:"GLD",  name:"Gold ETF",       type:"Commodity",score:7.2,signal:"BUY",  c:218.64,pc:217.28,dp:0.63},
  {sym:"AAPL", name:"Apple Inc.",     type:"Stock",    score:7.5,signal:"BUY",  c:189.74,pc:188.00,dp:0.93},
  {sym:"VNQ",  name:"Vanguard REIT",  type:"REIT",     score:6.4,signal:"HOLD", c:88.31, pc:88.61, dp:-0.34},
  {sym:"TSLA", name:"Tesla Inc.",     type:"Stock",    score:5.4,signal:"WATCH",c:248.50,pc:251.32,dp:-1.12},
  {sym:"OIL",  name:"Crude Oil ETF",  type:"Commodity",score:6.2,signal:"HOLD", c:78.22, pc:77.88, dp:0.41},
];
async function fetchQuote(sym) {
  const d = await fhGet(`/quote?symbol=${TICKER_MAP[sym]||sym}`);
  if (!d || d.c === 0 || d.c === null) throw new Error("Empty quote");
  return { c:d.c, pc:d.pc, dp:d.dp };
}
async function fetchCandles(sym) {
  const fhSym = TICKER_MAP[sym] || sym;
  const to   = Math.floor(Date.now() / 1000);
  const from = to - 35 * 86400; // 35 days to ensure 30 trading-day candles
  const isCrypto = fhSym.startsWith("BINANCE:");
  const ep = isCrypto
    ? `/crypto/candle?symbol=${fhSym}&resolution=D&from=${from}&to=${to}`
    : `/stock/candle?symbol=${fhSym}&resolution=D&from=${from}&to=${to}`;
  const d = await fhGet(ep);

  // Finnhub returns { s: "no_data" } when market is closed or symbol unavailable
  if (!d || d.s === "no_data" || !d.c || d.c.length === 0) {
    throw new Error(`No candle data for ${sym} (market may be closed)`);
  }
  if (d.s !== "ok") {
    throw new Error(`Finnhub error: ${d.s}`);
  }
  return d.t.map((ts, i) => ({
    date:  new Date(ts * 1000).toLocaleDateString("en-US", {month:"short", day:"numeric"}),
    price: parseFloat(d.c[i].toFixed(2)),
    high:  parseFloat(d.h[i].toFixed(2)),
    low:   parseFloat(d.l[i].toFixed(2)),
  }));
}

// Generate realistic-looking synthetic candles from a seed price
// Used as fallback when API key is missing or candles unavailable
function syntheticCandles(seedPrice, days = 30) {
  const pts = [];
  let price = seedPrice * (0.92 + Math.random() * 0.08); // start slightly below
  for (let i = days; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends
    const change = (Math.random() - 0.48) * 0.022 * price;
    price = Math.max(price + change, seedPrice * 0.7);
    pts.push({
      date:  d.toLocaleDateString("en-US", {month:"short", day:"numeric"}),
      price: parseFloat(price.toFixed(2)),
      high:  parseFloat((price * (1 + Math.random() * 0.008)).toFixed(2)),
      low:   parseFloat((price * (1 - Math.random() * 0.008)).toFixed(2)),
    });
  }
  return pts;
}

/* ── Interactive SVG chart ───────────────────────────────────── */
function MiniChart({ data, color, sym }) {
  const svgRef = useRef();
  const [tip, setTip] = useState(null);
  if (!data||data.length<2) return (
    <div style={{height:160,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",fontSize:"0.75rem"}}>No chart data</div>
  );
  const W=540,H=150,PAD={t:12,r:12,b:28,l:48};
  const prices=data.map(d=>d.price);
  const minP=Math.min(...prices),maxP=Math.max(...prices),range=maxP-minP||1;
  const toX=(i)=>PAD.l+(i/(data.length-1))*(W-PAD.l-PAD.r);
  const toY=(p)=>PAD.t+(1-(p-minP)/range)*(H-PAD.t-PAD.b);
  const pts=data.map((d,i)=>[toX(i),toY(d.price)]);
  let path=`M ${pts[0][0]} ${pts[0][1]}`;
  for(let i=1;i<pts.length;i++){const cx=(pts[i-1][0]+pts[i][0])/2;path+=` C ${cx} ${pts[i-1][1]}, ${cx} ${pts[i][1]}, ${pts[i][0]} ${pts[i][1]}`;}
  const area=`${path} L ${pts[pts.length-1][0]} ${H-PAD.b} L ${PAD.l} ${H-PAD.b} Z`;
  const clr=color||(data[data.length-1].price>=data[0].price?"#34D399":"#F87171");
  const gid=`g-${sym}`;
  const yTicks=[0,0.5,1].map(t=>({y:PAD.t+t*(H-PAD.t-PAD.b),label:(maxP-t*range).toFixed(maxP>100?0:2)}));
  const onMove=(e)=>{
    const r=svgRef.current?.getBoundingClientRect();if(!r)return;
    const sx=((e.clientX-r.left)/r.width)*W;
    let best=0,bd=Infinity;
    data.forEach((_,i)=>{const d=Math.abs(toX(i)-sx);if(d<bd){bd=d;best=i;}});
    if(bd<28)setTip({idx:best,x:toX(best),y:toY(data[best].price),d:data[best]});
    else setTip(null);
  };
  return (
    <div style={{position:"relative",width:"100%"}}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",display:"block",cursor:"crosshair"}} onMouseMove={onMove} onMouseLeave={()=>setTip(null)}>
        <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={clr} stopOpacity="0.2"/><stop offset="100%" stopColor={clr} stopOpacity="0.01"/></linearGradient></defs>
        {yTicks.map((t,i)=><g key={i}><line x1={PAD.l} y1={t.y} x2={W-PAD.r} y2={t.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/><text x={PAD.l-5} y={t.y+4} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.25)" fontFamily="JetBrains Mono,monospace">{t.label}</text></g>)}
        {[0,Math.floor(data.length/2),data.length-1].map(i=><text key={i} x={toX(i)} y={H-4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.25)" fontFamily="JetBrains Mono,monospace">{data[i]?.date}</text>)}
        <path d={area} fill={`url(#${gid})`}/>
        <path d={path} fill="none" stroke={clr} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
        {tip&&<><line x1={tip.x} y1={PAD.t} x2={tip.x} y2={H-PAD.b} stroke={clr} strokeWidth="1" strokeDasharray="3,3" opacity="0.6"/><circle cx={tip.x} cy={tip.y} r="4" fill={clr} stroke="var(--bg)" strokeWidth="2"/></>}
      </svg>
      {tip&&(
        <div style={{position:"absolute",top:6,left:tip.x/W*100>60?6:"auto",right:tip.x/W*100>60?"auto":6,background:"rgba(10,9,16,0.95)",border:`1px solid ${clr}30`,borderRadius:8,padding:"7px 11px",pointerEvents:"none",backdropFilter:"blur(8px)"}}>
          <div style={{fontSize:"0.6rem",color:"var(--muted)",marginBottom:2}}>{tip.d.date}</div>
          <div className="mono" style={{fontSize:"0.84rem",fontWeight:700,color:clr}}>${tip.d.price>1000?tip.d.price.toLocaleString():tip.d.price}</div>
          {tip.d.high&&<div style={{fontSize:"0.6rem",color:"var(--dim)",marginTop:1}}>H:{tip.d.high} L:{tip.d.low}</div>}
        </div>
      )}
    </div>
  );
}

/* ── Chart modal ─────────────────────────────────────────────── */
function ChartModal({ market, onClose, onAnalyze }) {
  const [candles,setCandles]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [range,setRange]=useState("1M");
  useEffect(()=>{
    if(!market)return;
    setLoading(true);setError("");
    const key = getFKey();
    if (!key) {
      // No API key — generate synthetic chart from seed price
      setCandles(syntheticCandles(market.c || market.pc || 100));
      setError("synthetic");
      setLoading(false);
      return;
    }
    fetchCandles(market.sym)
      .then(c => {
        if (c.length === 0) {
          // Got ok response but empty — use synthetic
          setCandles(syntheticCandles(market.c || 100));
          setError("synthetic");
        } else {
          setCandles(c);
          setError("");
        }
        setLoading(false);
      })
      .catch(e => {
        // On any error, fall back to synthetic data so chart still renders
        setCandles(syntheticCandles(market.c || market.pc || 100));
        setError(e.message === "NO_KEY" ? "synthetic" : e.message);
        setLoading(false);
      });
  },[market?.sym]);
  if(!market)return null;
  const isUp=market.dp>=0;
  const color=market.score>=7.5?"#34D399":market.score>=6?"#D4AF6A":"#F87171";
  const sliced=range==="1W"?candles.slice(-7):range==="2W"?candles.slice(-14):candles;
  const chgFromStart=sliced.length>=2?((sliced[sliced.length-1]?.price-sliced[0]?.price)/sliced[0]?.price*100).toFixed(2):null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"12px",animation:"fadeIn 0.2s ease"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:"100%",maxWidth:660,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden",animation:"fadeUp 0.25s ease",maxHeight:"90vh",overflowY:"auto"}}>
        {/* Header */}
        <div style={{padding:"16px 18px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",minWidth:0}}>
            <span className="mono" style={{fontWeight:700,fontSize:"1.1rem"}}>{market.sym}</span>
            <span style={{fontSize:"0.65rem",color:"var(--dim)",background:"rgba(255,255,255,0.05)",padding:"2px 7px",borderRadius:4}}>{market.type}</span>
            <span className={`badge ${market.signal==="BUY"?"b-buy":market.signal==="HOLD"?"b-hold":market.signal==="SELL"?"b-sell":"b-watch"}`}>{market.signal}</span>
          </div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:7,background:"transparent",border:"1px solid var(--border)",color:"var(--dim)",fontSize:"0.8rem",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(248,113,113,0.4)";e.currentTarget.style.color="var(--red)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--dim)"}}
          >✕</button>
        </div>
        {/* Price row */}
        <div style={{padding:"14px 18px 6px",display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <div className="mono" style={{fontSize:"1.8rem",fontWeight:700,lineHeight:1}}>${market.c>10000?market.c.toLocaleString():market.c.toFixed(2)}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5,flexWrap:"wrap"}}>
              <span className="mono" style={{fontSize:"0.82rem",fontWeight:600,color:isUp?"var(--green)":"var(--red)"}}>{isUp?"+":""}{market.dp?.toFixed(2)}% today</span>
              {chgFromStart!==null&&<span className="mono" style={{fontSize:"0.76rem",fontWeight:600,color:parseFloat(chgFromStart)>=0?"var(--green)":"var(--red)"}}>{parseFloat(chgFromStart)>=0?"+":""}{chgFromStart}% {range}</span>}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{textAlign:"right"}}>
              <div className="mono" style={{fontSize:"1.3rem",fontWeight:700,color}}>{market.score}</div>
              <div style={{fontSize:"0.58rem",color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.07em"}}>IQ Score</div>
            </div>
            <div style={{display:"flex",gap:4}}>
              {["1W","2W","1M"].map(r=><button key={r} onClick={()=>setRange(r)} style={{padding:"3px 9px",borderRadius:5,fontSize:"0.68rem",fontWeight:600,background:range===r?"rgba(212,175,106,0.14)":"transparent",border:`1px solid ${range===r?"rgba(212,175,106,0.35)":"var(--border)"}`,color:range===r?"var(--gold)":"var(--dim)",cursor:"pointer"}}>{r}</button>)}
            </div>
          </div>
        </div>
        {/* Chart */}
        <div style={{padding:"4px 12px 10px"}}>
          {loading&&<div style={{height:150,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span className="dot"/><span style={{fontSize:"0.76rem",color:"var(--dim)"}}>Loading…</span></div>}
          {error && error !== "synthetic" && !loading && (
            <div style={{height:30,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <span style={{fontSize:"0.7rem",color:"var(--amber)"}}>⚠ Live candles unavailable — showing simulated data</span>
            </div>
          )}
          {!loading&&!error&&<MiniChart data={sliced} color={color} sym={market.sym}/>}
        </div>
        {/* Footer */}
        <div style={{padding:"12px 18px 16px",borderTop:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              {[["Prev Close","$"+(market.pc>10000?market.pc.toLocaleString():(market.pc||0).toFixed(2))],["IQ Score",market.score+"/10"],["Type",market.type]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:"0.57rem",color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>{l}</div><div className="mono" style={{fontSize:"0.76rem",fontWeight:600}}>{v}</div></div>
              ))}
            </div>
            <button className="btn btn-gold" style={{padding:"8px 16px",fontSize:"0.76rem"}} onClick={()=>{onClose();onAnalyze(`Full investment analysis for ${market.sym} — ${market.name}`);}}>AI Analysis →</button>
          </div>
          {error === "synthetic" && (
            <div style={{marginTop:10,padding:"6px 10px",background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:7,display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:"0.62rem",color:"var(--amber)"}}>⚠</span>
              <span style={{fontSize:"0.63rem",color:"var(--muted)"}}>
                {getFKey()
                  ? "Live candles unavailable (market closed or free-tier limit). Showing simulated price shape."
                  : "No VITE_FINNHUB_KEY set. Showing simulated chart — add key to .env for real data."}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sentiment bar ───────────────────────────────────────────── */
function SBar({ label, score, color }) {
  const d=score-50;
  return (
    <div style={{marginBottom:11}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:"0.76rem",color:"var(--dim)"}}>{label}</span><span className="mono" style={{fontSize:"0.69rem",fontWeight:700,color}}>{d>0?"+":""}{d}</span></div>
      <div style={{height:3,background:"rgba(255,255,255,0.05)",borderRadius:2}}><div style={{height:"100%",width:`${score}%`,background:`linear-gradient(90deg,${color}55,${color})`,borderRadius:2,transition:"width 1.1s var(--ease)"}}/></div>
    </div>
  );
}

/* ── Mobile asset card (replaces table row on small screens) ─── */
function AssetCard({ m, onChart, onAnalyze }) {
  const isUp = m.dp >= 0;
  const sclr = m.score>=7.5?"var(--green)":m.score>=6?"var(--gold)":"var(--red)";
  const sigCls = m.signal==="BUY"?"b-buy":m.signal==="HOLD"?"b-hold":m.signal==="SELL"?"b-sell":"b-watch";
  const fmtPrice = (c) => {
    if(!c)return "—";
    if(c>10000)return c.toLocaleString(undefined,{maximumFractionDigits:0});
    return c.toFixed(2);
  };
  return (
    <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",background:"transparent",transition:"background 0.14s"}}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
    >
      {/* Row 1: ticker + price + chart btn */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div>
            <div className="mono" style={{fontWeight:700,fontSize:"0.86rem"}}>{m.sym}</div>
            <div style={{fontSize:"0.65rem",color:"var(--muted)",marginTop:1}}>{m.name}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{textAlign:"right"}}>
            <div className="mono" style={{fontWeight:700,fontSize:"0.86rem"}}>${fmtPrice(m.c)}</div>
            <div className="mono" style={{fontSize:"0.67rem",fontWeight:600,color:isUp?"var(--green)":"var(--red)",marginTop:1}}>{isUp?"+":""}{(m.dp||0).toFixed(2)}%</div>
          </div>
          <button onClick={()=>onChart(m)} style={{width:32,height:32,borderRadius:7,background:"rgba(212,175,106,0.08)",border:"1px solid rgba(212,175,106,0.2)",color:"var(--gold)",fontSize:"0.88rem",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>📈</button>
        </div>
      </div>
      {/* Row 2: type + score + signal + analyze */}
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:"0.62rem",color:"var(--dim)",background:"rgba(255,255,255,0.04)",padding:"2px 7px",borderRadius:4}}>{m.type}</span>
        <span className="mono" style={{fontSize:"0.75rem",fontWeight:700,color:sclr}}>{m.score}/10</span>
        <span className={`badge ${sigCls}`}>{m.signal}</span>
        <button className="btn btn-ghost" style={{padding:"4px 10px",fontSize:"0.66rem",marginLeft:"auto"}} onClick={()=>onAnalyze(`Full investment analysis for ${m.sym} — ${m.name}`)}>Deep Dive →</button>
      </div>
    </div>
  );
}

const FILTERS = ["All","ETF","Crypto","Stock","REIT","Commodity"];

/* ══════════════════════════════════════════════════════════════
   MARKETS PAGE — fully responsive
   Desktop: 6-col table + sidebar
   Mobile:  card list, sidebar moves below
══════════════════════════════════════════════════════════════ */
export default function MarketsPage({ onAnalyze }) {
  const [filter,   setFilter]   = useState("All");
  const [markets,  setMarkets]  = useState(SEED);
  const [lastFetch,setLastFetch]= useState(null);
  const [fetching, setFetching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isMobile, setMobile]   = useState(window.innerWidth < 700);

  useEffect(()=>{
    const check=()=>setMobile(window.innerWidth<700);
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  const loadQuotes = useCallback(async()=>{
    if(!getFKey())return;
    setFetching(true);
    const updated = await Promise.all(SEED.map(async m=>{
      try{const q=await fetchQuote(m.sym);if(!q.c||q.c===0)return m;return{...m,...q};}catch{return m;}
    }));
    setMarkets(updated);setLastFetch(new Date());setFetching(false);
  },[]);

  useEffect(()=>{loadQuotes();},[loadQuotes]);

  const filtered = filter==="All"?markets:markets.filter(m=>m.type===filter);
  const fmtPrice=(c)=>{if(!c)return "—";if(c>10000)return c.toLocaleString(undefined,{maximumFractionDigits:0});return c.toFixed(2);};

  return (
    <>
      {selected&&<ChartModal market={selected} onClose={()=>setSelected(null)} onAnalyze={onAnalyze}/>}

      <div style={{maxWidth:1080,margin:"0 auto",padding:"clamp(20px,4vw,32px) clamp(12px,4vw,24px) 60px"}}>

        {/* ── Header ── */}
        <div style={{marginBottom:24}}>
          <p style={{fontSize:"0.62rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>Markets</p>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
            <h1 style={{fontFamily:"Fraunces,serif",fontSize:"clamp(1.6rem,5vw,2.8rem)",lineHeight:1.1}}>
              Live <span style={{color:"var(--gold)"}}>Market Overview</span>
            </h1>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              {lastFetch&&<span className="mono" style={{fontSize:"0.6rem",color:"var(--muted)"}}>Updated {lastFetch.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
              {!getFKey()&&<span style={{fontSize:"0.62rem",color:"var(--amber)",background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",padding:"3px 9px",borderRadius:20}}>Add VITE_FINNHUB_KEY for live prices</span>}
              <button onClick={loadQuotes} disabled={fetching||!getFKey()} className="btn btn-ghost" style={{padding:"4px 11px",fontSize:"0.68rem",display:"flex",alignItems:"center",gap:5}}>
                <span style={{display:"inline-block",animation:fetching?"spin 1s linear infinite":"none"}}>↻</span> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ── Layout: table + sidebar ── */}
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr min(260px,28%)",gap:18,alignItems:"start"}}>

          {/* ── Asset list ── */}
          <div>
            {/* Filter pills */}
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {FILTERS.map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{padding:"5px 13px",borderRadius:20,fontSize:"0.71rem",fontWeight:600,background:filter===f?"rgba(212,175,106,0.12)":"transparent",border:`1px solid ${filter===f?"rgba(212,175,106,0.3)":"var(--border)"}`,color:filter===f?"var(--gold)":"var(--dim)",cursor:"pointer",transition:"0.2s var(--ease)",flexShrink:0}}>{f}</button>
              ))}
            </div>

            <div className="card" style={{overflow:"hidden",padding:0}}>
              {filtered.length===0&&<div style={{padding:"32px",textAlign:"center",color:"var(--dim)",fontSize:"0.84rem"}}>No assets for this filter.</div>}

              {isMobile ? (
                /* ── MOBILE: card list ── */
                filtered.map(m=><AssetCard key={m.sym} m={m} onChart={setSelected} onAnalyze={onAnalyze}/>)
              ) : (
                /* ── DESKTOP: table ── */
                <>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 72px 66px 78px 82px 48px",padding:"9px 16px",borderBottom:"1px solid var(--border)",fontSize:"0.57rem",fontWeight:700,color:"var(--muted)",letterSpacing:"0.1em",textTransform:"uppercase",gap:4}}>
                    <span>Asset</span><span>Class</span><span>IQ</span><span>Signal</span><span>Price / 24h</span><span/>
                  </div>
                  {filtered.map((m,i)=>{
                    const isUp=m.dp>=0;
                    const sclr=m.score>=7.5?"var(--green)":m.score>=6?"var(--gold)":"var(--red)";
                    const sigCls=m.signal==="BUY"?"b-buy":m.signal==="HOLD"?"b-hold":m.signal==="SELL"?"b-sell":"b-watch";
                    return (
                      <div key={m.sym} style={{display:"grid",gridTemplateColumns:"1fr 72px 66px 78px 82px 48px",padding:"12px 16px",alignItems:"center",borderBottom:i<filtered.length-1?"1px solid var(--border)":"none",transition:"background 0.14s",gap:4}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      >
                        <div><div className="mono" style={{fontWeight:700,fontSize:"0.81rem"}}>{m.sym}</div><div style={{fontSize:"0.64rem",color:"var(--muted)",marginTop:1}}>{m.name}</div></div>
                        <span style={{fontSize:"0.63rem",color:"var(--dim)",background:"rgba(255,255,255,0.04)",padding:"2px 6px",borderRadius:4}}>{m.type}</span>
                        <div><span className="mono" style={{fontWeight:700,fontSize:"0.84rem",color:sclr}}>{m.score}</span><div style={{height:2,marginTop:3,background:"rgba(255,255,255,0.05)",borderRadius:1,width:26}}><div style={{height:"100%",width:`${(m.score/10)*100}%`,background:sclr,borderRadius:1}}/></div></div>
                        <span className={`badge ${sigCls}`}>{m.signal}</span>
                        <div><div className="mono" style={{fontWeight:700,fontSize:"0.8rem"}}>${fmtPrice(m.c)}</div><div className="mono" style={{fontSize:"0.65rem",fontWeight:600,color:isUp?"var(--green)":"var(--red)",marginTop:1}}>{isUp?"+":""}{(m.dp||0).toFixed(2)}%</div></div>
                        <button onClick={()=>setSelected(m)} title="View chart" style={{width:32,height:32,borderRadius:7,background:"rgba(212,175,106,0.08)",border:"1px solid rgba(212,175,106,0.2)",color:"var(--gold)",fontSize:"0.85rem",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"0.18s"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(212,175,106,0.16)";e.currentTarget.style.transform="scale(1.06)"}}
                          onMouseLeave={e=>{e.currentTarget.style.background="rgba(212,175,106,0.08)";e.currentTarget.style.transform="none"}}
                        >📈</button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            <p style={{fontSize:"0.6rem",color:"var(--muted)",marginTop:8,textAlign:"right"}}>{getFKey()?"Live prices via Finnhub · tap 📈 for chart":"Seed prices · add VITE_FINNHUB_KEY for live data"}</p>
          </div>

          {/* ── Sidebar ── */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="card" style={{padding:"18px 16px"}}>
              <p style={{fontSize:"0.61rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>◉ Sentiment Radar</p>
              {SENTIMENT_DATA.map(s=><SBar key={s.label} {...s}/>)}
            </div>
            <div className="card" style={{padding:"18px 16px"}}>
              <p style={{fontSize:"0.61rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>◆ Quick Analysis</p>
              {[
                ["Top opportunities now","Screen and rank the top 5 investment opportunities across all asset classes right now"],
                ["Full sentiment report","Give me a full market sentiment analysis with scores and macro drivers"],
                ["Optimal 2025 portfolio","What is the optimal diversified portfolio allocation for 2025?"],
                ["Top 3 recommendations","Give me your top 3 investment recommendations with full analysis"],
              ].map(([label,q],i)=>(
                <button key={i} className="btn btn-ghost" style={{width:"100%",padding:"8px 11px",fontSize:"0.72rem",textAlign:"left",marginBottom:6}} onClick={()=>onAnalyze(q)}>{label} →</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}