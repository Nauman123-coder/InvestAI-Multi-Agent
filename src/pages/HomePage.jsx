import { useEffect, useRef, useState } from "react";
import useReveal from "../hooks/useReveal.js";
import { FEATURES, AGENTS, MARKETS, SENTIMENT_DATA, SUGGESTIONS, PIPELINE_STEPS } from "../data/constants.js";

/* ── Particle canvas background ─────────────────────────────── */
function Particles() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let W, H, pts, raf;
    const init = () => {
      W = c.width = c.offsetWidth;
      H = c.height = c.offsetHeight;
      pts = Array.from({length:55}, () => ({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.28, vy:(Math.random()-0.5)*0.28,
        r:Math.random()*1.5+0.4,
      }));
    };
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>W) p.vx*=-1;
        if(p.y<0||p.y>H) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle="rgba(212,175,106,0.22)"; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) {
        for(let j=i+1;j<pts.length;j++) {
          const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
          const d=Math.sqrt(dx*dx+dy*dy);
          if(d<115) {
            ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
            ctx.strokeStyle=`rgba(212,175,106,${0.055*(1-d/115)})`;
            ctx.lineWidth=0.7; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const onResize = () => init();
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return (
    <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>
  );
}

/* ── Animated number counter ─────────────────────────────────── */
function Counter({ target }) {
  const [val, setVal] = useState("0");
  const fired = useRef(false);
  const ref   = useRef();
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired.current) {
        fired.current = true;
        const num = parseFloat(target);
        if (isNaN(num)) { setVal(target); return; }
        let cur = 0; const dur = 1400; const step = 16; const inc = num/(dur/step);
        const t = setInterval(()=>{
          cur += inc;
          if (cur >= num) { setVal(target); clearInterval(t); }
          else setVal(Number.isInteger(num) ? Math.floor(cur).toString() : cur.toFixed(1));
        }, step);
      }
    }, { threshold:0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target]);
  return <span ref={ref}>{val}</span>;
}

/* ── Sentiment bar ───────────────────────────────────────────── */
function SentimentBar({ label, score, color }) {
  const delta = score - 50;
  const mood  = delta > 12 ? "Bullish" : delta < -12 ? "Bearish" : "Neutral";
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:"0.78rem",color:"var(--dim)"}}>{label}</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:"0.63rem",fontWeight:600,color}}>{mood}</span>
          <span className="mono" style={{fontSize:"0.7rem",fontWeight:700,color}}>
            {delta > 0 ? "+" : ""}{delta}
          </span>
        </div>
      </div>
      <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${score}%`,background:`linear-gradient(90deg,${color}55,${color})`,borderRadius:3,transition:"width 1.3s var(--ease)"}}/>
      </div>
    </div>
  );
}

/* ── Signal badge ────────────────────────────────────────────── */
function Sig({ s }) {
  const cls = s==="BUY"?"b-buy":s==="HOLD"?"b-hold":s==="SELL"?"b-sell":"b-watch";
  return <span className={`badge ${cls}`}>{s}</span>;
}

/* ══════════════════════════════════════════════════════════════
   HOMEPAGE
══════════════════════════════════════════════════════════════ */
export default function HomePage({ setPage, onAnalyze }) {
  useReveal([]);

  return (
    <div style={{overflowX:"hidden"}}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        position:"relative", minHeight:"90vh",
        display:"flex", alignItems:"center", overflow:"hidden",
        background:"radial-gradient(ellipse 75% 55% at 50% -5%, rgba(212,175,106,0.09), transparent 65%), var(--bg)",
      }}>
        <Particles/>

        {/* Slow spinning decorative ring */}
        <div className="xl-hide" style={{
          position:"absolute",right:"-7%",top:"50%",transform:"translateY(-50%)",
          width:570,height:570,borderRadius:"50%",
          border:"1px solid rgba(212,175,106,0.06)",
          animation:"spinSlow 90s linear infinite",pointerEvents:"none",
        }}>
          <div style={{position:"absolute",inset:75,borderRadius:"50%",border:"1px solid rgba(212,175,106,0.04)"}}/>
          <div style={{position:"absolute",inset:155,borderRadius:"50%",border:"1px solid rgba(212,175,106,0.03)"}}/>
        </div>

        <div style={{position:"relative",zIndex:2,maxWidth:1080,margin:"0 auto",padding:"0 40px",width:"100%"}}>
          <div style={{maxWidth:640}}>

            {/* Live badge */}
            <div className="aU" style={{animationDelay:"0s",display:"inline-flex",alignItems:"center",gap:8,background:"rgba(212,175,106,0.08)",border:"1px solid rgba(212,175,106,0.22)",borderRadius:24,padding:"5px 14px",marginBottom:28}}>
              <span className="dot"/>
              <span style={{fontSize:"0.65rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Live Market Intelligence</span>
            </div>

            <h1 className="aU" style={{animationDelay:"0.08s",fontSize:"clamp(2.6rem,5.5vw,4.8rem)",marginBottom:24}}>
              Five AI Agents.<br/>
              <span className="grad">One Clear Answer.</span>
            </h1>

            <p className="aU" style={{animationDelay:"0.16s",fontSize:"1rem",color:"var(--dim)",lineHeight:1.85,marginBottom:36}}>
              Ask any investment question. A Market Screener, Portfolio Analyzer, Sentiment Agent,
              Recommendation Engine, and Orchestrator work together — then deliver a single
              plain-English answer with every step of the reasoning visible and expandable.
            </p>

            <div className="aU" style={{animationDelay:"0.24s",display:"flex",gap:12,flexWrap:"wrap"}}>
              <button className="btn btn-gold" onClick={()=>setPage("chat")}>Start Analyzing →</button>
              <button className="btn btn-outline" onClick={()=>setPage("how")}>How It Works</button>
            </div>

            {/* Stat row */}
            <div className="aU" style={{animationDelay:"0.34s",display:"flex",gap:36,marginTop:52,flexWrap:"wrap"}}>
              {[["5","AI Agents"],["12+","Asset Classes"],["< 8s","Full Analysis"],["Free","With Groq"]].map(([v,l])=>(
                <div key={l}>
                  <div style={{fontFamily:"Fraunces,serif",fontSize:"1.95rem",fontWeight:700,color:"var(--gold)",lineHeight:1}}>
                    <Counter target={v}/>
                  </div>
                  <div style={{fontSize:"0.64rem",color:"var(--muted)",marginTop:6,letterSpacing:"0.05em",textTransform:"uppercase"}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating price cards */}
        <div className="xl-hide" style={{position:"absolute",right:"3.5%",top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",gap:9,zIndex:3}}>
          {[
            {sym:"SPY", price:"581.42",chg:"+1.24%",up:true, d:"0.3s"},
            {sym:"BTC", price:"67,840",chg:"+3.41%",up:true, d:"0.5s"},
            {sym:"NVDA",price:"875.40",chg:"+2.34%",up:true, d:"0.7s"},
            {sym:"GLD", price:"218.64",chg:"+0.62%",up:true, d:"0.9s"},
            {sym:"VNQ", price:"88.31", chg:"-0.34%",up:false,d:"1.1s"},
          ].map((t,i)=>(
            <div key={i} className="aL" style={{
              animationDelay:t.d,
              animation:`float ${3.2+i*0.3}s ${i*0.2}s ease-in-out infinite`,
              background:"rgba(11,9,18,0.92)",border:"1px solid rgba(212,175,106,0.1)",
              borderRadius:11,padding:"10px 16px",backdropFilter:"blur(12px)",
              display:"flex",alignItems:"center",gap:14,minWidth:195,
            }}>
              <span className="mono" style={{fontSize:"0.74rem",color:"var(--gold)",fontWeight:700,width:52}}>{t.sym}</span>
              <span className="mono" style={{fontSize:"0.7rem",color:"var(--muted)"}}>{t.price}</span>
              <span className="mono" style={{fontSize:"0.68rem",fontWeight:700,color:t.up?"var(--green)":"var(--red)"}}>{t.chg}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PIPELINE OVERVIEW ────────────────────────────────── */}
      <section style={{padding:"clamp(40px,7vw,80px) clamp(14px,4vw,40px)",background:"rgba(212,175,106,0.02)",borderTop:"1px solid rgba(212,175,106,0.08)",borderBottom:"1px solid rgba(212,175,106,0.08)"}}>
        <div style={{maxWidth:1080,margin:"0 auto"}}>
          <div className="sr" style={{textAlign:"center",marginBottom:52}}>
            <p style={{fontSize:"0.64rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12}}>Architecture</p>
            <h2 style={{fontSize:"clamp(1.8rem,3.5vw,2.8rem)",marginBottom:14}}>
              How the <span style={{color:"var(--gold)"}}>Pipeline Works</span>
            </h2>
            <p style={{color:"var(--dim)",maxWidth:480,margin:"0 auto",fontSize:"0.9rem",lineHeight:1.78}}>
              A structured 3-stage sequence where each stage feeds the next — giving you depth, not just speed.
            </p>
          </div>

          <div style={{display:"flex",flexWrap:"wrap"}}>
            {PIPELINE_STEPS.map((step,i)=>(
              <div key={i} className={`sr d${i+1}`} style={{
                flex:1,minWidth:255,padding:"28px 26px",
                background:"var(--bg2)",border:"1px solid var(--border)",
                borderRadius: i===0?"13px 0 0 13px" : i===2?"0 13px 13px 0" : 0,
                borderLeft:i>0?"none":undefined,
                position:"relative",
              }}>
                <div style={{
                  width:34,height:34,borderRadius:"50%",marginBottom:16,
                  background:`${step.color}18`,border:`2px solid ${step.color}44`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"0.78rem",fontWeight:700,color:step.color,
                }}>{step.n}</div>

                <div style={{fontWeight:700,fontSize:"0.88rem",color:"var(--text)",marginBottom:3}}>{step.title}</div>
                <div className="mono" style={{fontSize:"0.65rem",color:step.color,marginBottom:10}}>{step.timing}</div>
                <p style={{fontSize:"0.8rem",color:"var(--dim)",lineHeight:1.78,marginBottom:18}}>{step.what}</p>

                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {step.agents.map(key=>{
                    const a = AGENTS.find(x=>x.key===key);
                    return (
                      <span key={key} style={{
                        display:"inline-flex",alignItems:"center",gap:5,
                        background:`${a.color}12`,border:`1px solid ${a.color}28`,
                        borderRadius:20,padding:"3px 9px",
                        fontSize:"0.62rem",fontWeight:700,color:a.color,
                        textTransform:"uppercase",letterSpacing:"0.06em",
                      }}>{a.icon} {a.name}</span>
                    );
                  })}
                </div>

                {/* Arrow connector */}
                {i < 2 && (
                  <div className="md-hide" style={{position:"absolute",right:-16,top:"50%",transform:"translateY(-50%)",zIndex:5,width:32,height:32,background:"var(--bg)",border:"1px solid var(--border)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"var(--gold)"}}>→</div>
                )}
              </div>
            ))}
          </div>

          <div className="sr" style={{textAlign:"center",marginTop:28}}>
            <button className="btn btn-ghost" onClick={()=>setPage("how")}>
              See the full architecture with diagrams →
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section style={{padding:"clamp(40px,7vw,80px) clamp(14px,4vw,40px)"}} data-sec>
        <div className="container">
          <div className="sr" style={{textAlign:"center",marginBottom:52}}>
            <p style={{fontSize:"0.64rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12}}>Capabilities</p>
            <h2 style={{fontSize:"clamp(1.8rem,3.5vw,3rem)"}}>
              What InvestIQ <span style={{color:"var(--gold)"}}>Does</span>
            </h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:18}}>
            {FEATURES.map((f,i)=>(
              <div key={i} className={`card card-h sr d${(i%3)+1}`} style={{padding:"26px 24px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:-22,right:-22,width:85,height:85,borderRadius:"50%",background:`${f.color}07`,pointerEvents:"none"}}/>
                <div style={{width:42,height:42,borderRadius:10,background:`${f.color}14`,border:`1px solid ${f.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,color:f.color,marginBottom:16}}>{f.icon}</div>
                <h3 style={{fontFamily:"DM Sans,sans-serif",fontSize:"0.9rem",fontWeight:700,letterSpacing:0,marginBottom:9}}>{f.title}</h3>
                <p style={{fontSize:"0.8rem",color:"var(--dim)",lineHeight:1.8}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENT ROSTER ─────────────────────────────────────── */}
      <section style={{padding:"clamp(40px,7vw,72px) clamp(14px,4vw,40px)",background:"var(--bg2)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div className="container">
          <div className="sr" style={{textAlign:"center",marginBottom:44}}>
            <p style={{fontSize:"0.64rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12}}>The Team</p>
            <h2 style={{fontSize:"clamp(1.8rem,3.5vw,2.8rem)"}}>
              Five Specialist <span style={{color:"var(--gold)"}}>Agents</span>
            </h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(196px,1fr))",gap:14}}>
            {AGENTS.map((a,i)=>(
              <div key={a.key} className={`card card-h sr d${i+1}`} style={{padding:"22px 18px",cursor:"pointer"}} onClick={()=>setPage("chat")}>
                <div style={{width:38,height:38,borderRadius:9,background:`${a.color}14`,border:`1px solid ${a.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:a.color,marginBottom:13}}>{a.icon}</div>
                <div style={{fontWeight:700,fontSize:"0.84rem",marginBottom:3}}>{a.name}</div>
                <div style={{fontSize:"0.65rem",color:a.color,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>{a.role}</div>
                <div style={{fontSize:"0.75rem",color:"var(--dim)",lineHeight:1.68,marginBottom:12}}>{a.tagline}</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span className="dot" style={{width:5,height:5}}/>
                  <span style={{fontSize:"0.6rem",color:"var(--green)"}}>Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKETS TABLE + SENTIMENT ─────────────────────────── */}
      <section style={{padding:"clamp(40px,7vw,80px) clamp(14px,4vw,40px)"}} data-sec>
        <div className="container">
          <div className="sr" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:28,flexWrap:"wrap",gap:12}}>
            <div>
              <p style={{fontSize:"0.64rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10}}>Markets</p>
              <h2 style={{fontSize:"clamp(1.6rem,3vw,2.4rem)"}}>Live <span style={{color:"var(--gold)"}}>Coverage</span></h2>
            </div>
            <button className="btn btn-ghost" onClick={()=>setPage("markets")}>View all markets →</button>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:16,alignItems:"start"}}>
            {/* Table */}
            <div className="sr card" style={{overflow:"hidden",padding:0}}>
                <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                  <div style={{minWidth:520,display:"grid",gridTemplateColumns:"1fr 76px 68px 82px 76px 104px",padding:"10px 18px",borderBottom:"1px solid var(--border)",fontSize:"0.59rem",fontWeight:700,color:"var(--muted)",letterSpacing:"0.1em",textTransform:"uppercase"}}>
                    <span>Asset</span><span>Class</span><span>Score</span><span>Signal</span><span>24h</span><span>Action</span>
                  </div>

                  {MARKETS.slice(0,6).map((m,i)=>(
                    <div key={i}
                      style={{
                        display:"grid",
                        gridTemplateColumns:"1fr 76px 68px 82px 76px 104px",
                        padding:"12px 18px",
                        alignItems:"center",
                        borderBottom:i<5?"1px solid var(--border)":"none",
                        transition:"background 0.15s",
                        cursor:"default",
                        minWidth:520
                      }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    >
                      <div>
                        <div className="mono" style={{fontWeight:700,fontSize:"0.82rem"}}>{m.sym}</div>
                        <div style={{fontSize:"0.67rem",color:"var(--muted)",marginTop:2}}>{m.name}</div>
                      </div>

                      <span style={{fontSize:"0.65rem",color:"var(--dim)",background:"rgba(255,255,255,0.04)",padding:"2px 7px",borderRadius:4}}>
                        {m.type}
                      </span>

                      <div>
                        <span className="mono" style={{fontWeight:700,fontSize:"0.88rem",color:m.score>=7.5?"var(--green)":m.score>=6?"var(--gold)":"var(--red)"}}>
                          {m.score}
                        </span>
                        <div style={{height:2,marginTop:4,background:"rgba(255,255,255,0.05)",borderRadius:1,width:28}}>
                          <div
                            style={{
                              height:"100%",
                              width:`${(m.score/10)*100}%`,
                              background:m.score>=7.5?"var(--green)":m.score>=6?"var(--gold)":"var(--red)",
                              borderRadius:1
                            }}
                          />
                        </div>
                      </div>

                      <Sig s={m.signal}/>

                      <span className="mono" style={{fontSize:"0.78rem",fontWeight:600,color:m.up?"var(--green)":"var(--red)"}}>
                        {m.chg}
                      </span>

                      <button
                        className="btn btn-ghost"
                        style={{padding:"5px 10px",fontSize:"0.68rem"}}
                        onClick={()=>onAnalyze(`Detailed investment analysis and recommendation for ${m.sym} — ${m.name}`)}
                      >
                        Analyze →
                      </button>
                    </div>
                  ))}

                </div>
              </div>

            {/* Sentiment sidebar */}
            <div className="sr card d2" style={{padding:"24px 20px"}}>
              <p style={{fontSize:"0.64rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:18}}>◉ Sentiment Radar</p>
              {SENTIMENT_DATA.map(s=><SentimentBar key={s.label} {...s}/>)}
              <div style={{marginTop:16,padding:"11px 13px",background:"rgba(212,175,106,0.05)",border:"1px solid rgba(212,175,106,0.12)",borderRadius:8}}>
                <p style={{fontSize:"0.7rem",color:"var(--dim)",lineHeight:1.65}}>
                  Score from <span style={{color:"var(--red)"}}>-50 (bearish)</span> to <span style={{color:"var(--green)"}}>+50 (bullish)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK QUERIES ────────────────────────────────────── */}
      <section style={{padding:"clamp(40px,7vw,64px) clamp(14px,4vw,40px)",background:"var(--bg2)",borderTop:"1px solid var(--border)"}}>
        <div className="container">
          <div className="sr" style={{marginBottom:28}}>
            <p style={{fontSize:"0.64rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10}}>Try It Now</p>
            <h2 style={{fontSize:"1.8rem"}}>Popular <span style={{color:"var(--gold)"}}>Queries</span></h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
            {SUGGESTIONS.map((s,i)=>(
              <button key={i} className={`sr d${(i%3)+1}`} onClick={()=>onAnalyze(s)} style={{
                padding:"14px 18px",borderRadius:10,textAlign:"left",
                background:"var(--bg)",border:"1px solid var(--border)",
                color:"var(--dim)",fontSize:"0.82rem",lineHeight:1.55,
                cursor:"pointer",transition:"0.2s var(--ease)",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(212,175,106,0.28)";e.currentTarget.style.color="var(--text)";e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--dim)";e.currentTarget.style.transform="none"}}
              >{s} <span style={{color:"var(--gold)"}}>→</span></button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{padding:"clamp(40px,7vw,88px) clamp(14px,4vw,40px)",textAlign:"center",background:"radial-gradient(ellipse 60% 80% at 50% 50%, rgba(212,175,106,0.06), transparent)",borderTop:"1px solid var(--border)"}}>
        <div className="sr">
          <p style={{fontSize:"0.64rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14}}>Ready?</p>
          <h2 style={{fontSize:"clamp(1.8rem,4vw,3.4rem)",marginBottom:18,lineHeight:1.22}}>
            Smarter Investments,<br/><span style={{color:"var(--gold)"}}>One Question Away</span>
          </h2>
          <p style={{color:"var(--dim)",fontSize:"0.92rem",marginBottom:36,maxWidth:420,margin:"0 auto 36px"}}>
            Five agents. One synthesized answer. Full reasoning visible. Free with Groq.
          </p>
          <button className="btn btn-gold" style={{padding:"14px 44px",fontSize:"0.88rem"}} onClick={()=>setPage("chat")}>
            Launch InvestIQ →
          </button>
        </div>
      </section>

      <footer style={{padding:"clamp(40px,7vw,22px) clamp(14px,4vw,40px)",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <span style={{fontFamily:"Fraunces,serif",fontWeight:700}}>Invest<span style={{color:"var(--gold)"}}>IQ</span></span>
        <span className="mono" style={{fontSize:"0.61rem",color:"var(--muted)"}}>© 2025 InvestIQ · Groq AI · Not financial advice</span>
      </footer>
    </div>
  );
}