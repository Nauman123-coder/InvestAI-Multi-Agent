import { useState, useEffect } from "react";
import { TICKER_ITEMS, AGENTS } from "../data/constants.js";

/* ══════════════════════════════════════════════════════════
   TICKER
══════════════════════════════════════════════════════════ */
export function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker-wrap" style={{
      height:34,
      background:"rgba(8,7,12,0.97)",
      borderBottom:"1px solid rgba(212,175,106,0.1)",
      display:"flex", alignItems:"center",
    }}>
      <div className="ticker-track">
        {items.map((t,i)=>(
          <span key={i} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"0 22px"}}>
            <span className="mono" style={{fontSize:"0.69rem",color:"var(--gold)",fontWeight:700}}>{t.sym}</span>
            <span className="mono" style={{fontSize:"0.67rem",color:"var(--muted)"}}>{t.price}</span>
            <span className="mono" style={{fontSize:"0.67rem",fontWeight:700,color:t.up?"var(--green)":"var(--red)"}}>{t.chg}</span>
            <span style={{color:"var(--muted)",fontSize:"0.44rem",margin:"0 2px"}}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NAVBAR — fully responsive
══════════════════════════════════════════════════════════ */
export function Navbar({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const links = [
    ["Home","home"],["How It Works","how"],["Markets","markets"],["Chat","chat"]
  ];

  const go = (k) => { setPage(k); setMenuOpen(false); };

  return (
    <>
      <nav style={{
        position:"sticky",top:0,zIndex:200,
        height:54,
        background:"rgba(8,7,12,0.95)",
        borderBottom:"1px solid var(--border)",
        backdropFilter:"blur(24px)",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 16px",
        flexShrink:0,
      }}>
        {/* Logo */}
        <button onClick={()=>go("home")} style={{display:"flex",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer",padding:0,flexShrink:0}}>
          <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,var(--gold),var(--goldD))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,animation:"glow 4s ease infinite"}}>◈</div>
          <span style={{fontFamily:"Fraunces,serif",fontSize:"1.05rem",fontWeight:700}}>
            Invest<span style={{color:"var(--gold)"}}>IQ</span>
          </span>
          {!isMobile && (
            <span style={{fontSize:"0.57rem",fontWeight:700,color:"var(--gold)",background:"rgba(212,175,106,0.1)",border:"1px solid rgba(212,175,106,0.2)",padding:"2px 7px",borderRadius:20,letterSpacing:"0.1em",textTransform:"uppercase"}}>
              Multi-Agent AI
            </span>
          )}
        </button>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{display:"flex",gap:2}}>
            {links.map(([label,key])=>(
              <button key={key} onClick={()=>go(key)} style={{
                padding:"5px 12px",borderRadius:7,fontWeight:600,fontSize:"0.76rem",cursor:"pointer",
                background:page===key?"rgba(212,175,106,0.1)":"transparent",
                border:`1px solid ${page===key?"rgba(212,175,106,0.22)":"transparent"}`,
                color:page===key?"var(--gold)":"var(--dim)",
                transition:"0.2s var(--ease)",
              }}
                onMouseEnter={e=>{if(page!==key)e.currentTarget.style.color="var(--text)"}}
                onMouseLeave={e=>{if(page!==key)e.currentTarget.style.color="var(--dim)"}}
              >{label}</button>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          {!isMobile && (
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span className="dot"/>
              <span className="mono" style={{fontSize:"0.63rem",color:"var(--dim)"}}>5 agents online</span>
            </div>
          )}
          <button className="btn btn-gold" style={{padding:"6px 14px",fontSize:"0.76rem"}} onClick={()=>go("chat")}>
            {isMobile ? "Chat →" : "Launch →"}
          </button>
          {isMobile && (
            <button onClick={()=>setMenuOpen(v=>!v)} style={{width:32,height:32,borderRadius:7,background:"transparent",border:"1px solid var(--border)",color:"var(--dim)",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
              {menuOpen ? "✕" : "☰"}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position:"fixed",top:54,left:0,right:0,zIndex:199,
          background:"rgba(8,7,12,0.98)",borderBottom:"1px solid var(--border)",
          backdropFilter:"blur(20px)",
          padding:"12px 16px 16px",
          animation:"fadeIn 0.18s ease",
        }}>
          {links.map(([label,key])=>(
            <button key={key} onClick={()=>go(key)} style={{
              display:"block",width:"100%",padding:"12px 14px",borderRadius:9,
              marginBottom:6,textAlign:"left",fontWeight:600,fontSize:"0.88rem",
              background:page===key?"rgba(212,175,106,0.1)":"transparent",
              border:`1px solid ${page===key?"rgba(212,175,106,0.22)":"var(--border)"}`,
              color:page===key?"var(--gold)":"var(--dim)",cursor:"pointer",
              transition:"0.15s",
            }}>{label}</button>
          ))}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   AGENT BADGE
══════════════════════════════════════════════════════════ */
export function AgentBadge({ agentKey, size="sm" }) {
  const a = AGENTS.find(x=>x.key===agentKey);
  if (!a) return null;
  const lg = size === "lg";
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:lg?7:5,
      background:`${a.color}12`,border:`1px solid ${a.color}28`,
      borderRadius:20,padding:lg?"5px 12px":"3px 9px",
    }}>
      <span style={{fontSize:lg?14:11,color:a.color}}>{a.icon}</span>
      <span style={{fontSize:lg?"0.71rem":"0.6rem",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:a.color}}>
        {a.name}
      </span>
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   API KEY MODAL
══════════════════════════════════════════════════════════ */
export function ApiKeyModal({ onSave }) {
  const [key,  setKey]  = useState("");
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const k = key.trim();
    if (!k)                    { setErr("Please enter your API key."); return; }
    if (!k.startsWith("gsk_")) { setErr("Groq keys start with gsk_ — double-check yours."); return; }
    setBusy(true);
    await new Promise(r=>setTimeout(r,400));
    onSave(k);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(8,7,12,0.95)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn 0.3s ease"}}>
      <div style={{width:"100%",maxWidth:460,background:"var(--bg2)",border:"1px solid rgba(212,175,106,0.15)",borderRadius:16,padding:"40px 36px",animation:"fadeUp 0.4s ease"}}>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:26}}>
          <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,var(--gold),var(--goldD))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>◈</div>
          <span style={{fontFamily:"Fraunces,serif",fontSize:"1.2rem",fontWeight:700}}>Invest<span style={{color:"var(--gold)"}}>IQ</span></span>
        </div>

        <h2 style={{fontSize:"1.45rem",marginBottom:10}}>Connect Groq API</h2>
        <p style={{color:"var(--dim)",fontSize:"0.85rem",lineHeight:1.75,marginBottom:26}}>
          InvestIQ uses Groq's ultra-fast inference to run five AI agents simultaneously.
          Get your <strong style={{color:"var(--text)"}}>free</strong> key at{" "}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{color:"var(--gold)"}}>console.groq.com</a>.
        </p>

        {["Create a free account at console.groq.com","Go to API Keys → Create API Key","Paste your key below and click Connect"].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:9}}>
            <span style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:"rgba(212,175,106,0.14)",border:"1px solid rgba(212,175,106,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.62rem",fontWeight:700,color:"var(--gold)",marginTop:1}}>{i+1}</span>
            <span style={{fontSize:"0.8rem",color:"var(--dim)",lineHeight:1.55}}>{s}</span>
          </div>
        ))}

        <label style={{fontSize:"0.67rem",fontWeight:700,color:"var(--dim)",letterSpacing:"0.09em",textTransform:"uppercase",display:"block",marginBottom:8,marginTop:22}}>Groq API Key</label>
        <input
          type="password" value={key} autoFocus
          onChange={e=>{setKey(e.target.value);setErr("")}}
          onKeyDown={e=>e.key==="Enter"&&save()}
          placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
          style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.04)",border:`1px solid ${err?"var(--red)":"rgba(255,255,255,0.09)"}`,borderRadius:9,color:"var(--text)",fontFamily:"JetBrains Mono,monospace",fontSize:"0.82rem",outline:"none",marginBottom:8,transition:"border-color 0.2s"}}
        />
        {err && <p style={{color:"var(--red)",fontSize:"0.75rem",marginBottom:10}}>{err}</p>}

        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:22}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:"var(--green)",display:"inline-block"}}/>
          <span style={{fontSize:"0.7rem",color:"var(--dim)"}}>Stored locally in your browser — never sent anywhere except Groq</span>
        </div>

        <button className="btn btn-gold" onClick={save} disabled={busy} style={{width:"100%",padding:"13px",justifyContent:"center",opacity:busy?0.7:1}}>
          {busy ? "Connecting…" : "Connect & Launch InvestIQ →"}
        </button>
      </div>
    </div>
  );
}