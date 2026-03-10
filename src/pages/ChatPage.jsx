import { useState, useRef, useEffect, useCallback } from "react";
import { runPipeline } from "../agents/groqClient.js";
import { AGENTS, SUGGESTIONS } from "../data/constants.js";
import { AgentBadge } from "../components/shared.jsx";
import MD from "../components/MarkdownRenderer.jsx";

/* ── Pipeline stages ─────────────────────────────────────────── */
const STAGES = [
  { key:"parallel",       label:"3 agents analyzing in parallel",  sub:"Screener · Portfolio · Sentiment",  agents:["screener","portfolio","sentiment"], color:"#60A5FA" },
  { key:"recommendation", label:"Recommendation Engine synthesizing", sub:"All signals combined",             agents:["recommendation"],                  color:"#A78BFA" },
  { key:"orchestrator",   label:"Writing your answer",              sub:"Streaming live…",                   agents:["orchestrator"],                    color:"#D4AF6A" },
];

function PipelineStatus({ stage }) {
  const idx = STAGES.findIndex(s => s.key === stage);
  const cur = STAGES[idx] || STAGES[0];

  return (
    <div style={{
      display:"flex", flexDirection:"column", gap:12,
      padding:"18px 22px",
      background:"rgba(255,255,255,0.02)",
      border:`1px solid ${cur.color}22`,
      borderRadius:14,
      animation:"fadeUp 0.3s ease",
    }}>
      {/* Progress bar */}
      <div style={{display:"flex",gap:4}}>
        {STAGES.map((s,i) => (
          <div key={i} style={{flex:1,height:2,borderRadius:1,overflow:"hidden",background:"rgba(255,255,255,0.07)"}}>
            <div style={{
              height:"100%", borderRadius:1,
              background: i < idx ? "var(--green)" : i === idx ? s.color : "transparent",
              width: i <= idx ? "100%" : "0%",
              transition: "width 0.8s var(--ease)",
            }}/>
          </div>
        ))}
      </div>

      {/* Current stage */}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {/* Pulsing agent icons */}
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          {(cur.agents||[]).map(key => {
            const a = AGENTS.find(x => x.key === key);
            return (
              <div key={key} style={{
                width:32, height:32, borderRadius:8,
                background:`${cur.color}14`,
                border:`1px solid ${cur.color}30`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:15, color:cur.color,
                animation:"pulse 1.4s ease infinite",
              }}>{a?.icon}</div>
            );
          })}
        </div>

        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:"0.82rem",fontWeight:600,color:"var(--text)"}}>{cur.label}</div>
          <div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:1}}>{cur.sub}</div>
        </div>

        {/* Step indicators */}
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          {STAGES.map((s,i) => (
            <div key={i} style={{
              width:22, height:22, borderRadius:"50%",
              background: i < idx ? "rgba(52,211,153,0.15)" : i===idx ? `${s.color}18` : "rgba(255,255,255,0.04)",
              border:`1px solid ${i < idx ? "var(--green)" : i===idx ? s.color : "rgba(255,255,255,0.08)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"0.6rem",fontWeight:700,
              color: i < idx ? "var(--green)" : i===idx ? s.color : "var(--muted)",
              transition:"all 0.4s",
            }}>{i < idx ? "✓" : i+1}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Agent breakdown panel ────────────────────────────────────── */
function AgentPanel({ agents }) {
  const [open, setOpen] = useState(false);
  if (!agents || Object.keys(agents).length === 0) return null;
  return (
    <div style={{marginTop:12}}>
      <button onClick={() => setOpen(v => !v)} style={{
        display:"flex",alignItems:"center",gap:7,
        background:"none",border:"none",cursor:"pointer",
        padding:"4px 0",
        fontSize:"0.75rem",color:"var(--dim)",
        transition:"color 0.18s",
      }}
        onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--dim)"}
      >
        <span style={{
          display:"inline-block",
          transition:"transform 0.22s var(--ease)",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          fontSize:"0.55rem",
        }}>▶</span>
        {open ? "Hide" : "Show"} all 4 agent analyses
        <span style={{fontSize:"0.67rem",color:"var(--muted)",background:"rgba(255,255,255,0.04)",padding:"1px 7px",borderRadius:10,border:"1px solid var(--border)"}}>{Object.keys(agents).length}</span>
      </button>

      {open && (
        <div style={{marginTop:10,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
          {Object.entries(agents).map(([key, output]) => {
            const a = AGENTS.find(x => x.key === key);
            if (!a || !output) return null;
            return (
              <div key={key} style={{
                background:`${a.color}07`,
                border:`1px solid ${a.color}1C`,
                borderRadius:11,
                padding:"14px 16px",
                animation:"fadeUp 0.3s ease",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:26,height:26,borderRadius:6,background:`${a.color}14`,border:`1px solid ${a.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:a.color}}>{a.icon}</div>
                  <span style={{fontSize:"0.72rem",fontWeight:700,color:a.color}}>{a.name}</span>
                </div>
                <MD content={output} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Single chat message ─────────────────────────────────────── */
function Message({ msg }) {
  if (msg.role === "user") {
    return (
      <div style={{
        display:"flex", justifyContent:"flex-end",
        animation:"msgIn 0.25s ease",
        paddingLeft:"20%",
      }}>
        <div style={{
          maxWidth:640,
          padding:"14px 20px",
          background:"rgba(212,175,106,0.1)",
          border:"1px solid rgba(212,175,106,0.22)",
          borderRadius:"18px 4px 18px 18px",
        }}>
          <p style={{fontSize:"0.95rem",color:"var(--text)",lineHeight:1.7,wordBreak:"break-word",margin:0}}>{msg.content}</p>
          {msg.ts && (
            <span className="mono" style={{fontSize:"0.58rem",color:"rgba(212,175,106,0.45)",display:"block",marginTop:7,textAlign:"right"}}>
              {msg.ts.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div style={{display:"flex",gap:14,alignItems:"flex-start",animation:"msgIn 0.25s ease",paddingRight:"6%"}}>

      {/* Avatar */}
      <div style={{
        width:38, height:38, borderRadius:11, flexShrink:0,
        background:"linear-gradient(135deg,rgba(212,175,106,0.18),rgba(212,175,106,0.06))",
        border:"1px solid rgba(212,175,106,0.3)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:17, color:"var(--gold)",
        boxShadow:"0 0 16px rgba(212,175,106,0.12)",
        marginTop:2,
      }}>◈</div>

      <div style={{flex:1,minWidth:0}}>
        {/* Name + status row */}
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
          <span style={{fontSize:"0.8rem",fontWeight:700,color:"var(--gold)"}}>InvestIQ</span>
          {msg.streaming && (
            <span style={{display:"flex",alignItems:"center",gap:5,fontSize:"0.65rem",color:"var(--green)"}}>
              <span className="dot" style={{width:5,height:5}}/>
              <span>Live</span>
            </span>
          )}
          {msg.ts && !msg.streaming && (
            <span className="mono" style={{fontSize:"0.59rem",color:"var(--muted)"}}>
              {msg.ts.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
            </span>
          )}
        </div>

        {/* Message bubble */}
        <div style={{
          background:"var(--bg2)",
          border:"1px solid var(--border)",
          borderRadius:"4px 18px 18px 18px",
          padding:"22px 26px",
          boxShadow:"0 2px 24px rgba(0,0,0,0.25)",
        }}>
          <MD content={msg.content} streaming={msg.streaming} />
        </div>

        {/* Agent breakdown */}
        {!msg.streaming && <AgentPanel agents={msg.agents} />}
      </div>
    </div>
  );
}

/* ── Welcome screen ──────────────────────────────────────────── */
function WelcomeScreen({ onSend }) {
  return (
    <div style={{
      flex:1, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"40px 24px",
      animation:"fadeUp 0.5s ease",
    }}>
      {/* Logo mark */}
      <div style={{
        width:64, height:64, borderRadius:18,
        background:"linear-gradient(135deg,rgba(212,175,106,0.2),rgba(212,175,106,0.05))",
        border:"1px solid rgba(212,175,106,0.3)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:30, color:"var(--gold)",
        marginBottom:24,
        boxShadow:"0 0 40px rgba(212,175,106,0.12)",
        animation:"glow 4s ease infinite",
      }}>◈</div>

      <h2 style={{
        fontFamily:"Fraunces,serif",
        fontSize:"clamp(1.6rem,3.5vw,2.2rem)",
        fontWeight:700, letterSpacing:"-0.03em",
        marginBottom:10, textAlign:"center",
      }}>
        What do you want to <span style={{color:"var(--gold)"}}>analyze?</span>
      </h2>

      <p style={{
        fontSize:"0.9rem", color:"var(--dim)", textAlign:"center",
        maxWidth:460, lineHeight:1.7, marginBottom:36,
      }}>
        Five AI agents work in parallel to give you institutional-grade investment analysis. Ask anything about markets, stocks, crypto, or strategy.
      </p>

      {/* Suggestion cards */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
        gap:10, width:"100%", maxWidth:700,
      }}>
        {SUGGESTIONS.slice(0,6).map((s,i) => (
          <button key={i} onClick={() => onSend(s)} style={{
            padding:"14px 16px",
            borderRadius:12,
            textAlign:"left",
            background:"var(--bg2)",
            border:"1px solid var(--border)",
            color:"var(--dim)",
            fontSize:"0.82rem",
            lineHeight:1.55,
            cursor:"pointer",
            transition:"all 0.2s var(--ease)",
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(212,175,106,0.3)";
              e.currentTarget.style.color = "var(--text)";
              e.currentTarget.style.background = "rgba(212,175,106,0.06)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--dim)";
              e.currentTarget.style.background = "var(--bg2)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <span style={{display:"block",fontSize:"0.65rem",color:"var(--gold)",marginBottom:5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Suggestion {i+1}</span>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CHAT PAGE — large, modern, ChatGPT-style layout
══════════════════════════════════════════════════════════════ */
export default function ChatPage({ apiKey, initialQuery }) {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [stage,     setStage]     = useState(null);
  const [sidebar,   setSidebar]   = useState(true);
  const [isMobile,  setMobile]    = useState(window.innerWidth < 768);

  useEffect(() => {
    const check = () => {
      const m = window.innerWidth < 768;
      setMobile(m);
      if (m) setSidebar(false);
    };
    window.addEventListener("resize", check);
    check();
    return () => window.removeEventListener("resize", check);
  }, []);

  const bottomRef   = useRef();
  const inputRef    = useRef();
  const abortRef    = useRef(null);
  const sentInitial = useRef(false);

  // Smooth scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, stage]);

  useEffect(() => {
    if (initialQuery && !sentInitial.current) {
      sentInitial.current = true;
      send(initialQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const send = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setLoading(true);
    setStage(null);
    if (isMobile) setSidebar(false);

    setMessages(prev => [...prev, {
      role:"user", content:q, ts:new Date(),
    }]);

    const id = Date.now();
    setMessages(prev => [...prev, {
      id, role:"assistant", content:"", agents:null, streaming:true, ts:new Date(),
    }]);

    abortRef.current = new AbortController();

    try {
      const { final, agents } = await runPipeline(
        q, apiKey,
        (s) => setStage(s),
        // onToken — append each new token to the streaming message
        (token) => {
          setMessages(prev => prev.map(m =>
            m.id === id ? { ...m, content: m.content + token } : m
          ));
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        },
        abortRef.current.signal
      );

      setMessages(prev => prev.map(m =>
        m.id === id ? { ...m, content: final, agents, streaming: false } : m
      ));
    } catch (err) {
      if (err.name === "AbortError") {
        setMessages(prev => prev.filter(m => m.id !== id));
      } else {
        setMessages(prev => prev.map(m =>
          m.id === id
            ? { ...m, content: `**Error:** ${err.message || "Failed to reach Groq. Check your API key."}`, streaming:false }
            : m
        ));
      }
    }

    setLoading(false);
    setStage(null);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [input, loading, apiKey, isMobile]);

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const hasMessages = messages.length > 0;

  // Auto-resize textarea
  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  return (
    <div style={{ flex:1, display:"flex", overflow:"hidden", position:"relative" }}>

      {/* Mobile overlay */}
      {isMobile && sidebar && (
        <div
          onClick={() => setSidebar(false)}
          style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.65)",zIndex:90,backdropFilter:"blur(3px)" }}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside style={{
        position: isMobile ? "absolute" : "relative",
        zIndex: isMobile ? 100 : "auto",
        top:0, left:0, bottom:0,
        width: sidebar ? 260 : 0,
        minWidth: sidebar ? 260 : 0,
        overflow:"hidden", flexShrink:0,
        transition:"width 0.28s var(--ease),min-width 0.28s var(--ease)",
        background:"#0B0A11",
        borderRight: sidebar ? "1px solid var(--border)" : "none",
        display:"flex", flexDirection:"column",
      }}>
        <div style={{width:260,height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* Sidebar header */}
          <div style={{
            padding:"16px 16px 14px",
            display:"flex",alignItems:"center",justifyContent:"space-between",
            borderBottom:"1px solid var(--border)",flexShrink:0,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 8px var(--green)",animation:"pulse 2.2s ease infinite"}}/>
              <span style={{fontSize:"0.65rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Agents Online</span>
            </div>
            <button onClick={() => setSidebar(false)} style={{width:24,height:24,borderRadius:6,background:"transparent",border:"1px solid var(--border)",color:"var(--muted)",fontSize:"0.65rem",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
              onMouseEnter={e=>{e.currentTarget.style.color="var(--red)";e.currentTarget.style.borderColor="rgba(248,113,113,0.3)"}}
              onMouseLeave={e=>{e.currentTarget.style.color="var(--muted)";e.currentTarget.style.borderColor="var(--border)"}}
            >✕</button>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"14px 12px"}}>

            {/* Agent list */}
            {AGENTS.map(a => {
              const isActive =
                (stage==="parallel" && ["screener","portfolio","sentiment"].includes(a.key)) ||
                (stage==="recommendation" && a.key==="recommendation") ||
                (stage==="orchestrator" && a.key==="orchestrator");
              return (
                <div key={a.key} style={{
                  display:"flex",alignItems:"center",gap:10,
                  padding:"9px 10px",borderRadius:9,marginBottom:3,
                  background: isActive ? `${a.color}0D` : "transparent",
                  border:`1px solid ${isActive ? `${a.color}30` : "transparent"}`,
                  transition:"all 0.3s ease",
                }}>
                  <div style={{
                    width:30,height:30,borderRadius:8,flexShrink:0,
                    background:`${a.color}12`,border:`1px solid ${a.color}22`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:13,color:a.color,
                    animation: isActive ? "pulse 1.4s ease infinite" : "none",
                  }}>{a.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"0.74rem",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:isActive?a.color:"var(--text)"}}>{a.name}</div>
                    <div style={{fontSize:"0.6rem",color:isActive?a.color:"var(--green)",marginTop:1,display:"flex",alignItems:"center",gap:4}}>
                      <span style={{width:4,height:4,borderRadius:"50%",background:isActive?a.color:"var(--green)",display:"inline-block"}}/>
                      {isActive ? "Running…" : "Ready"}
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={{height:1,background:"var(--border)",margin:"14px 4px"}}/>

            {/* Quick queries */}
            <p style={{fontSize:"0.57rem",fontWeight:700,color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:9,paddingLeft:4}}>Quick Queries</p>
            {SUGGESTIONS.slice(0,6).map((s,i) => (
              <button key={i} onClick={() => { send(s); if(isMobile) setSidebar(false); }}
                style={{
                  width:"100%",padding:"9px 10px",borderRadius:8,marginBottom:5,
                  background:"transparent",border:"1px solid var(--border)",
                  color:"var(--dim)",fontSize:"0.72rem",textAlign:"left",
                  lineHeight:1.48,cursor:"pointer",transition:"all 0.18s var(--ease)",
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(212,175,106,0.28)";e.currentTarget.style.color="var(--text)";e.currentTarget.style.background="rgba(212,175,106,0.04)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--dim)";e.currentTarget.style.background="transparent"}}
              >{s}</button>
            ))}

            <div style={{height:1,background:"var(--border)",margin:"14px 4px"}}/>

            {/* Pipeline info box */}
            <div style={{background:"rgba(212,175,106,0.04)",border:"1px solid rgba(212,175,106,0.1)",borderRadius:10,padding:"13px 12px"}}>
              <p style={{fontSize:"0.6rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>How it works</p>
              {STAGES.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:7}}>
                  <div style={{width:18,height:18,borderRadius:5,background:`${s.color}14`,border:`1px solid ${s.color}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"0.58rem",fontWeight:700,color:s.color}}>{i+1}</div>
                  <span style={{fontSize:"0.69rem",color:"var(--dim)",lineHeight:1.5}}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CHAT AREA ──────────────────────────────────── */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        overflow:"hidden", minWidth:0,
        background:"var(--bg)",
      }}>

        {/* Top bar */}
        <div style={{
          height:52,
          flexShrink:0,
          borderBottom:"1px solid var(--border)",
          background:"rgba(8,7,12,0.92)",
          backdropFilter:"blur(24px)",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"0 20px",
          zIndex:10,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={() => setSidebar(v => !v)}
              style={{
                width:32,height:32,borderRadius:8,
                background:"transparent",
                border:"1px solid var(--border)",
                color:"var(--dim)",
                display:"flex",alignItems:"center",justifyContent:"center",
                cursor:"pointer",transition:"0.2s",flexShrink:0,
                fontSize:"0.9rem",
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(212,175,106,0.3)";e.currentTarget.style.color="var(--gold)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--dim)"}}
            >☰</button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:"Fraunces,serif",fontSize:"0.95rem",fontWeight:700}}>InvestIQ <span style={{color:"var(--gold)"}}>Chat</span></span>
              <span style={{fontSize:"0.62rem",color:"var(--muted)",background:"rgba(255,255,255,0.04)",padding:"2px 8px",borderRadius:10,border:"1px solid var(--border)"}} className="md-hide">5-agent pipeline</span>
            </div>
          </div>

          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {loading && (
              <button
                onClick={() => abortRef.current?.abort()}
                style={{
                  display:"flex",alignItems:"center",gap:6,
                  padding:"5px 14px",borderRadius:7,
                  background:"rgba(248,113,113,0.08)",
                  border:"1px solid rgba(248,113,113,0.3)",
                  color:"var(--red)",fontSize:"0.73rem",fontWeight:600,cursor:"pointer",
                  transition:"0.18s",
                }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(248,113,113,0.14)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(248,113,113,0.08)"}
              >
                <span>■</span> Stop
              </button>
            )}
            {hasMessages && (
              <button
                className="btn btn-ghost"
                style={{padding:"5px 12px",fontSize:"0.72rem"}}
                onClick={() => { setMessages([]); setStage(null); }}
              >New chat</button>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div style={{flex:1,overflowY:"auto",position:"relative"}}>
          {!hasMessages ? (
            <WelcomeScreen onSend={send}/>
          ) : (
            <div style={{
              maxWidth:820,
              margin:"0 auto",
              padding:"32px 24px 32px",
              display:"flex",flexDirection:"column",gap:28,
            }}>
              {/* Pipeline status (shown above streaming message) */}
              {loading && stage && <PipelineStatus stage={stage}/>}

              {messages.map((m, i) => <Message key={m.id || i} msg={m}/>)}
              <div ref={bottomRef}/>
            </div>
          )}
        </div>

        {/* ── Input area ─────────────────────────────────────── */}
        <div style={{
          padding:"16px 24px 20px",
          flexShrink:0,
          background:"var(--bg)",
          borderTop:"1px solid var(--border)",
        }}>
          <div style={{maxWidth:820,margin:"0 auto"}}>

            {/* Input container */}
            <div style={{
              display:"flex",alignItems:"flex-end",gap:10,
              background:"var(--bg2)",
              border:`1px solid ${loading ? "rgba(212,175,106,0.35)" : "rgba(255,255,255,0.1)"}`,
              borderRadius:16,
              padding:"12px 12px 12px 18px",
              transition:"border-color 0.25s, box-shadow 0.25s",
              boxShadow: loading ? "0 0 24px rgba(212,175,106,0.08)" : "none",
            }}>
              {/* IQ icon */}
              <div style={{
                width:28,height:28,borderRadius:7,flexShrink:0,
                background:"rgba(212,175,106,0.1)",
                border:"1px solid rgba(212,175,106,0.2)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:13,color:"var(--gold)",
                marginBottom:2,
              }}>◈</div>

              {/* Textarea */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInput}
                onKeyDown={onKey}
                placeholder="Ask about any market, stock, crypto, or strategy…"
                rows={1}
                style={{
                  flex:1,
                  background:"transparent",
                  border:"none",outline:"none",
                  resize:"none",
                  color:"var(--text)",
                  fontSize:"0.95rem",
                  fontFamily:"DM Sans,sans-serif",
                  lineHeight:1.65,
                  padding:"2px 0",
                  overflowY:"hidden",
                }}
              />

              {/* Send button */}
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                style={{
                  width:38, height:38,
                  borderRadius:10, border:"none", flexShrink:0,
                  background: !loading && input.trim()
                    ? "linear-gradient(135deg,var(--gold),var(--goldD))"
                    : "rgba(255,255,255,0.05)",
                  color: !loading && input.trim() ? "var(--bg)" : "var(--muted)",
                  fontSize:"1rem", fontWeight:900,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  cursor: !loading && input.trim() ? "pointer" : "not-allowed",
                  transition:"all 0.2s var(--ease)",
                  flexShrink:0,
                }}
                onMouseEnter={e => { if (!loading && input.trim()) { e.currentTarget.style.transform="scale(1.08)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(212,175,106,0.3)"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
              >↑</button>
            </div>

            {/* Hint row */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:10}}>
              <span className="mono" style={{fontSize:"0.6rem",color:"var(--muted)"}}>
                Enter to send · Shift+Enter for new line
              </span>
              <span style={{width:3,height:3,borderRadius:"50%",background:"var(--muted)",display:"inline-block"}}/>
              <span className="mono" style={{fontSize:"0.6rem",color:"var(--muted)"}}>
                Groq · llama-3.3-70b-versatile
              </span>
              <span style={{width:3,height:3,borderRadius:"50%",background:"var(--muted)",display:"inline-block"}}/>
              <span className="mono" style={{fontSize:"0.6rem",color:"var(--muted)"}}>
                Not financial advice
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}