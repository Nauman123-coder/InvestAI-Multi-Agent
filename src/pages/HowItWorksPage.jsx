import { useState, useEffect } from "react";
import useReveal from "../hooks/useReveal.js";
import { AGENTS, PIPELINE_STEPS } from "../data/constants.js";

const faq = [
  {q:"Is the data real-time?",         a:"Market prices are live via Finnhub when a key is configured. AI analysis is generated fresh for each query — never cached."},
  {q:"How fast is each response?",     a:"The three parallel agents finish in ~3s. Recommendation takes ~2s more, then the Orchestrator streams live. Total: 8–12 seconds."},
  {q:"Do I need a paid API key?",      a:"No. Groq's free tier is more than enough. The free plan supports llama-3.3-70b-versatile used by InvestIQ."},
  {q:"Is this real financial advice?", a:"No. InvestIQ is an AI research assistant. Always do your own due diligence and consult a licensed advisor before investing."},
  {q:"Can I trust the AI output?",     a:"Every agent explains its reasoning in plain English so you can evaluate it. Treat every output as a starting point for your own research."},
  {q:"What assets does it cover?",     a:"Stocks, ETFs, crypto, REITs, commodities, and forex — anything the LLM has knowledge of. Combine with live data from the Markets page."},
];

/* ── Pipeline diagram — horizontally scrollable on mobile ────── */
function PipelineDiagram() {
  const getA = k => AGENTS.find(x=>x.key===k);
  return (
    <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",borderRadius:12,border:"1px solid var(--border)",background:"var(--bg)"}}>
      <div style={{display:"flex",alignItems:"center",padding:"20px 16px",gap:0,minWidth:520}}>

        <PNode icon="💬" label="Your\nQuestion" bg="var(--bg3)" border="var(--borderB)"/>
        <PArrow label="fanout" color="var(--gold)"/>

        {/* Parallel agents */}
        <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
          {["screener","portfolio","sentiment"].map(key=>{
            const a=getA(key);
            return (
              <div key={key} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 11px",background:`${a.color}0F`,border:`1px solid ${a.color}28`,borderRadius:8,minWidth:148,animation:"pulse 2.5s ease infinite"}}>
                <span style={{fontSize:12,color:a.color,flexShrink:0}}>{a.icon}</span>
                <span style={{fontSize:"0.67rem",fontWeight:600,color:a.color,whiteSpace:"nowrap"}}>{a.name}</span>
              </div>
            );
          })}
        </div>

        <PArrow label="merge" color="var(--purple)"/>
        {(()=>{const a=getA("recommendation");return <PAgentNode a={a}/>;})()}
        <PArrow label="stream" color="var(--gold)"/>
        {(()=>{const a=getA("orchestrator");return <PAgentNode a={a} glow/>;})()}
        <PArrow label="answer" color="var(--green)"/>
        <PNode icon="✅" label="Your\nAnswer" bg="rgba(52,211,153,0.06)" border="rgba(52,211,153,0.28)"/>

      </div>
      <p style={{textAlign:"center",fontSize:"0.6rem",color:"var(--muted)",padding:"0 0 10px",marginTop:-4}}>← scroll to see full pipeline on small screens →</p>
    </div>
  );
}
function PNode({icon,label,bg,border}){
  return(
    <div style={{padding:"11px 12px",background:bg,border:`1px solid ${border}`,borderRadius:10,textAlign:"center",flexShrink:0,minWidth:72}}>
      <div style={{fontSize:"1.1rem",marginBottom:3}}>{icon}</div>
      <div style={{fontSize:"0.62rem",fontWeight:700,color:"var(--text)",whiteSpace:"pre-line",lineHeight:1.3}}>{label}</div>
    </div>
  );
}
function PAgentNode({a,glow}){
  return(
    <div style={{padding:"10px 12px",background:`${a.color}0F`,border:`${glow?"2px":"1px"} solid ${a.color}${glow?"40":"28"}`,borderRadius:9,textAlign:"center",flexShrink:0,minWidth:108,animation:glow?"glow 3s ease infinite":undefined}}>
      <div style={{fontSize:16,color:a.color,marginBottom:3}}>{a.icon}</div>
      <div style={{fontSize:"0.64rem",fontWeight:700,color:a.color,whiteSpace:"nowrap"}}>{a.name}</div>
    </div>
  );
}
function PArrow({label,color}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"0 4px",flexShrink:0,minWidth:40}}>
      <div style={{width:32,height:2,background:color,opacity:0.45}}/>
      <div style={{fontSize:"0.5rem",color,marginTop:3,letterSpacing:"0.05em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</div>
    </div>
  );
}

/* ── Agent card ─────────────────────────────────────────────── */
function AgentCard({agent,idx}){
  return(
    <div className={`sr d${(idx%3)+1}`} style={{padding:"20px 18px",background:"var(--bg2)",border:`1px solid ${agent.color}1E`,borderRadius:14,transition:"0.25s var(--ease)"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=`${agent.color}40`;e.currentTarget.style.transform="translateY(-3px)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=`${agent.color}1E`;e.currentTarget.style.transform="none";}}
    >
      <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:12}}>
        <div style={{width:40,height:40,borderRadius:10,background:`${agent.color}14`,border:`1px solid ${agent.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:agent.color,flexShrink:0}}>{agent.icon}</div>
        <div>
          <div style={{fontWeight:700,fontSize:"0.86rem"}}>{agent.name}</div>
          <div style={{fontSize:"0.6rem",color:agent.color,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",marginTop:2}}>{agent.role}</div>
        </div>
      </div>
      <p style={{fontSize:"0.8rem",color:"var(--dim)",lineHeight:1.76,marginBottom:14}}>{agent.desc}</p>
      <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid var(--border)",borderRadius:9,padding:"11px 12px"}}>
        <p style={{fontSize:"0.56rem",fontWeight:700,color:"var(--muted)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Example Output</p>
        {agent.output.map((line,i)=>(
          <div key={i} style={{display:"flex",gap:7,marginBottom:5}}>
            <span style={{color:agent.color,flexShrink:0,marginTop:1}}>▸</span>
            <span className="mono" style={{fontSize:"0.67rem",color:"var(--dim)",lineHeight:1.52}}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Streaming mock visual ──────────────────────────────────── */
function StreamingVisual(){
  return(
    <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"20px",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <div style={{width:26,height:26,borderRadius:7,background:"rgba(212,175,106,0.14)",border:"1px solid rgba(212,175,106,0.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"var(--gold)"}}>◈</div>
        <span style={{fontSize:"0.59rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.07em",textTransform:"uppercase"}}>Orchestrator</span>
        <span style={{fontSize:"0.57rem",color:"var(--green)",display:"flex",alignItems:"center",gap:4,marginLeft:4}}>
          <span className="dot" style={{width:5,height:5}}/> live
        </span>
      </div>
      <div style={{fontSize:"0.83rem",lineHeight:1.78,color:"var(--dim)"}}>
        <strong style={{color:"var(--text)"}}>NVDA is a strong buy at current levels,</strong>{" "}
        supported by all five agents converging on the same signal.
        <br/><br/>
        <strong style={{color:"var(--gold)"}}>📊 Market Outlook</strong>
        <br/>
        Semiconductor demand is accelerating driven by AI infrastructure buildout. NVDA sits at the center of every major data-center upgrade.
        <br/><br/>
        <strong style={{color:"var(--gold)"}}>🎯 Best Opportunity</strong>
        <br/>
        Entry $840–$865 captures strong risk/reward. Score: 8.7/10.
        <span style={{display:"inline-block",width:2,height:"0.9em",background:"var(--gold)",marginLeft:3,animation:"curBlink 0.65s ease infinite",verticalAlign:"text-bottom",borderRadius:1}}/>
      </div>
      <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
        {[["Confidence","8.7/10","var(--gold)"],["Horizon","Medium","var(--blue)"],["Risk","Medium","var(--amber)"]].map(([l,v,c])=>(
          <div key={l} style={{background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:8,padding:"6px 11px",flex:1,minWidth:72}}>
            <div style={{fontSize:"0.55rem",color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>{l}</div>
            <div className="mono" style={{fontSize:"0.76rem",fontWeight:700,color:c}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── FAQ accordion ──────────────────────────────────────────── */
function FaqItem({item,idx}){
  const[open,setOpen]=useState(false);
  return(
    <div className={`sr d${(idx%2)+1}`} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:11,overflow:"hidden",transition:"border-color 0.2s"}}
      onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(212,175,106,0.22)"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
    >
      <button onClick={()=>setOpen(v=>!v)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px",background:"none",border:"none",color:"var(--text)",fontSize:"0.85rem",fontWeight:700,textAlign:"left",cursor:"pointer",gap:12}}>
        <span>{item.q}</span>
        <span style={{fontSize:"0.6rem",color:"var(--gold)",flexShrink:0,transition:"transform 0.25s",transform:open?"rotate(180deg)":"none"}}>▼</span>
      </button>
      {open&&<div style={{padding:"0 18px 16px",animation:"fadeIn 0.2s ease"}}><p style={{fontSize:"0.81rem",color:"var(--dim)",lineHeight:1.76,margin:0}}>{item.a}</p></div>}
    </div>
  );
}

/* ── Pipeline step ──────────────────────────────────────────── */
function PipelineStep({step,i,isMobile}){
  /* On desktop: alternating — even=text-left, odd=text-right
     On mobile:  always text first, visual second               */
  const textFirst = isMobile || i%2===0;
  const TextBlock = (
    <div className={i%2===0?"sr-l":"sr-r"}>
      <div style={{display:"inline-flex",alignItems:"center",gap:9,marginBottom:14,background:`${step.color}12`,border:`1px solid ${step.color}2E`,borderRadius:24,padding:"4px 13px"}}>
        <span className="mono" style={{fontSize:"0.67rem",fontWeight:700,color:step.color}}>Step {step.n}</span>
        <span style={{fontSize:"0.58rem",color:step.color,opacity:0.7}}>·</span>
        <span className="mono" style={{fontSize:"0.67rem",color:step.color,opacity:0.8}}>{step.timing}</span>
      </div>
      <h3 style={{fontFamily:"Fraunces,serif",fontSize:"clamp(1.2rem,3vw,1.9rem)",marginBottom:11,fontWeight:700,lineHeight:1.2}}>{step.title}</h3>
      <p style={{fontSize:"0.87rem",color:"var(--dim)",lineHeight:1.82,marginBottom:11}}>{step.what}</p>
      <p style={{fontSize:"0.81rem",color:step.color,lineHeight:1.76,marginBottom:18,fontStyle:"italic",borderLeft:`2px solid ${step.color}40`,paddingLeft:13}}>{step.why}</p>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        {step.agents.map(key=>{
          const a=AGENTS.find(x=>x.key===key);
          return(
            <span key={key} style={{display:"inline-flex",alignItems:"center",gap:5,background:`${a.color}12`,border:`1px solid ${a.color}28`,borderRadius:20,padding:"4px 10px",fontSize:"0.67rem",fontWeight:700,color:a.color,textTransform:"uppercase",letterSpacing:"0.06em"}}>
              {a.icon} {a.name}
            </span>
          );
        })}
      </div>
    </div>
  );
  const VisualBlock = (
    <div className={i%2===0?"sr-r":"sr-l"}>
      <div style={{padding:"clamp(14px,3vw,22px)",background:"var(--bg2)",border:`1px solid ${step.color}1E`,borderRadius:14}}>
        {step.agents.map(key=>{
          const a=AGENTS.find(x=>x.key===key);
          return(
            <div key={key} style={{display:"flex",alignItems:"flex-start",gap:11,marginBottom:step.agents.length>1?11:0,padding:"11px 12px",background:`${a.color}08`,border:`1px solid ${a.color}1E`,borderRadius:10}}>
              <div style={{width:30,height:30,borderRadius:7,flexShrink:0,background:`${a.color}14`,border:`1px solid ${a.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:a.color}}>{a.icon}</div>
              <div style={{minWidth:0}}>
                <div style={{fontWeight:700,fontSize:"0.79rem",marginBottom:3}}>{a.name}</div>
                <div style={{fontSize:"0.71rem",color:"var(--dim)",lineHeight:1.58}}>{a.tagline}</div>
              </div>
            </div>
          );
        })}
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:11}}>
          <div style={{flex:1,height:3,background:"rgba(255,255,255,0.05)",borderRadius:2}}>
            <div style={{height:"100%",width:step.n===1?"45%":step.n===2?"30%":"25%",background:`linear-gradient(90deg,${step.color}55,${step.color})`,borderRadius:2}}/>
          </div>
          <span className="mono" style={{fontSize:"0.61rem",color:"var(--muted)",flexShrink:0}}>{step.timing}</span>
        </div>
      </div>
    </div>
  );
  return(
    <div style={{marginBottom:"clamp(32px,7vw,64px)"}}>
      <div style={{
        display:"grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap:"clamp(18px,4vw,44px)",
        alignItems:"center",
      }}>
        {textFirst ? <>{TextBlock}{VisualBlock}</> : <>{VisualBlock}{TextBlock}</>}
      </div>
      {i < PIPELINE_STEPS.length-1 && (
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:"clamp(20px,4vw,36px)"}}>
          <div style={{flex:1,height:1,background:"var(--border)"}}/>
          <span style={{fontSize:"0.58rem",color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.1em",flexShrink:0}}>then</span>
          <div style={{flex:1,height:1,background:"var(--border)"}}/>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function HowItWorksPage({ setPage }) {
  useReveal([]);
  const [isMobile, setMobile] = useState(window.innerWidth < 680);
  useEffect(()=>{
    const check=()=>setMobile(window.innerWidth<680);
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  /* Shared section padding using CSS clamp */
  const SP = { padding:"clamp(40px,7vw,80px) clamp(14px,4vw,40px)" };

  return(
    <div style={{background:"var(--bg)",color:"var(--text)"}}>

      {/* ── Hero ── */}
      <section style={{...SP,textAlign:"center",paddingBottom:"clamp(32px,5vw,60px)"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div className="sr" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(212,175,106,0.08)",border:"1px solid rgba(212,175,106,0.2)",borderRadius:24,padding:"4px 14px",marginBottom:20}}>
            <span className="dot" style={{width:5,height:5}}/>
            <span style={{fontSize:"0.63rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.12em",textTransform:"uppercase"}}>Architecture</span>
          </div>
          <h1 className="sr" style={{fontFamily:"Fraunces,serif",fontSize:"clamp(1.9rem,6vw,3.4rem)",fontWeight:900,letterSpacing:"-0.04em",lineHeight:1.1,marginBottom:16}}>
            How InvestIQ<br/><span style={{color:"var(--gold)"}}>Works</span>
          </h1>
          <p className="sr" style={{fontSize:"clamp(0.88rem,2.5vw,1rem)",color:"var(--dim)",lineHeight:1.82,maxWidth:520,margin:"0 auto 28px"}}>
            Every question runs through a five-agent AI pipeline. Agents work in parallel, and the Orchestrator synthesizes everything into one clear answer — streamed live.
          </p>
          <div className="sr" style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-gold" onClick={()=>setPage("chat")}>Try It Now →</button>
            <button className="btn btn-ghost" onClick={()=>setPage("home")}>← Home</button>
          </div>
        </div>
      </section>

      {/* ── Pipeline diagram ── */}
      <section style={{padding:"clamp(24px,4vw,48px) clamp(14px,4vw,40px)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",background:"var(--bg2)"}}>
        <div style={{maxWidth:920,margin:"0 auto"}}>
          <p style={{fontSize:"0.6rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:14,textAlign:"center"}}>Pipeline Overview</p>
          <PipelineDiagram/>
        </div>
      </section>

      {/* ── 3-Stage steps ── */}
      <section style={SP}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <div className="sr" style={{textAlign:"center",marginBottom:"clamp(28px,5vw,56px)"}}>
            <h2 style={{fontFamily:"Fraunces,serif",fontSize:"clamp(1.5rem,4vw,2.5rem)",marginBottom:10}}>
              The <span style={{color:"var(--gold)"}}>3-Stage Pipeline</span>
            </h2>
            <p style={{color:"var(--dim)",fontSize:"clamp(0.84rem,2vw,0.94rem)",maxWidth:440,margin:"0 auto",lineHeight:1.76}}>
              Parallel execution delivers institutional-depth analysis in seconds, not minutes.
            </p>
          </div>
          {PIPELINE_STEPS.map((step,i)=><PipelineStep key={i} step={step} i={i} isMobile={isMobile}/>)}
        </div>
      </section>

      {/* ── Agents detail ── */}
      <section style={{...SP,background:"var(--bg2)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:1060,margin:"0 auto"}}>
          <div className="sr" style={{textAlign:"center",marginBottom:"clamp(24px,4vw,44px)"}}>
            <h2 style={{fontFamily:"Fraunces,serif",fontSize:"clamp(1.5rem,4vw,2.5rem)",marginBottom:10}}>
              The Five Agents <span style={{color:"var(--gold)"}}>in Detail</span>
            </h2>
            <p style={{color:"var(--dim)",fontSize:"clamp(0.84rem,2vw,0.92rem)",maxWidth:440,margin:"0 auto",lineHeight:1.76}}>
              Each agent has a specialized prompt, its own output schema, and real example outputs.
            </p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,270px),1fr))",gap:14}}>
            {AGENTS.map((a,i)=><AgentCard key={a.key} agent={a} idx={i}/>)}
          </div>
        </div>
      </section>

      {/* ── Streaming section ── */}
      <section style={SP}>
        <div style={{maxWidth:940,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:"clamp(22px,5vw,52px)",alignItems:"center"}}>
            <div className="sr-l">
              <p style={{fontSize:"0.62rem",fontWeight:700,color:"var(--gold)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:11}}>Real-Time</p>
              <h2 style={{fontFamily:"Fraunces,serif",fontSize:"clamp(1.4rem,4vw,2.3rem)",marginBottom:14,lineHeight:1.15}}>
                See It Think <span style={{color:"var(--gold)"}}>Live</span>
              </h2>
              <p style={{fontSize:"clamp(0.84rem,2vw,0.9rem)",color:"var(--dim)",lineHeight:1.84,marginBottom:13}}>
                The Orchestrator's synthesis is streamed token by token — you see the answer being written in real time. No waiting for a spinner.
              </p>
              <p style={{fontSize:"clamp(0.84rem,2vw,0.9rem)",color:"var(--dim)",lineHeight:1.84,marginBottom:22}}>
                The four individual agent reports are available in the expandable panel below every answer — dive into the reasoning any time.
              </p>
              <button className="btn btn-gold" onClick={()=>setPage("chat")}>Try It Now →</button>
            </div>
            <div className="sr-r"><StreamingVisual/></div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section style={{padding:"clamp(24px,4vw,44px) clamp(14px,4vw,40px)",background:"var(--bg2)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:760,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:"clamp(14px,3vw,24px)",textAlign:"center"}}>
            {[["5","AI Agents","per query"],["3×","Faster","parallel execution"],["~10s","Per Answer","end-to-end"],["100%","Free","to start"]].map(([num,label,sub])=>(
              <div key={label} className="sr">
                <div style={{fontFamily:"Fraunces,serif",fontSize:"clamp(1.7rem,5vw,2.6rem)",fontWeight:900,color:"var(--gold)",lineHeight:1}}>{num}</div>
                <div style={{fontSize:"clamp(0.78rem,2vw,0.84rem)",fontWeight:700,color:"var(--text)",marginTop:5}}>{label}</div>
                <div style={{fontSize:"clamp(0.65rem,1.5vw,0.7rem)",color:"var(--muted)",marginTop:2}}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={SP}>
        <div style={{maxWidth:800,margin:"0 auto"}}>
          <div className="sr" style={{textAlign:"center",marginBottom:"clamp(24px,4vw,44px)"}}>
            <h2 style={{fontFamily:"Fraunces,serif",fontSize:"clamp(1.5rem,4vw,2.3rem)"}}>
              Common <span style={{color:"var(--gold)"}}>Questions</span>
            </h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {faq.map((item,i)=><FaqItem key={i} item={item} idx={i}/>)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{...SP,textAlign:"center",background:"var(--bg2)",borderTop:"1px solid var(--border)"}}>
        <div className="sr" style={{maxWidth:520,margin:"0 auto"}}>
          <h2 style={{fontFamily:"Fraunces,serif",fontSize:"clamp(1.5rem,5vw,2.6rem)",marginBottom:13,lineHeight:1.15}}>
            Ready to Try It?{" "}<span style={{color:"var(--gold)"}}>It's Free.</span>
          </h2>
          <p style={{color:"var(--dim)",fontSize:"clamp(0.84rem,2vw,0.9rem)",marginBottom:26,lineHeight:1.7}}>
            Connect your free Groq API key and ask your first question in under a minute.
          </p>
          <div style={{display:"flex",gap:11,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-gold" onClick={()=>setPage("chat")}>Launch InvestIQ →</button>
            <button className="btn btn-ghost" onClick={()=>setPage("home")}>← Back to Home</button>
          </div>
        </div>
      </section>

    </div>
  );
}