const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "llama-3.3-70b-versatile";

export async function callGroq(system, user, apiKey) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL, temperature: 0.35, max_tokens: 900,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `Groq API error ${res.status}`);
  }
  return (await res.json()).choices?.[0]?.message?.content?.trim() || "";
}

/*
  callGroqStream: onToken(token) is called with EACH NEW TOKEN only.
  The caller appends tokens to state — this is the correct pattern for
  word-by-word streaming. Previously onChunk received the full
  accumulated text which caused full re-renders and looked choppy.
*/
export async function callGroqStream(system, user, apiKey, onToken, signal) {
  const res = await fetch(GROQ_URL, {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL, temperature: 0.35, max_tokens: 1400, stream: true,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `Groq API error ${res.status}`);
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let   full    = "";
  let   lineBuf = "";

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    lineBuf += decoder.decode(value, { stream: true });
    const lines = lineBuf.split("\n");
    lineBuf = lines.pop(); // keep incomplete last line for next iteration

    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data: ")) continue;
      const payload = t.slice(6).trim();
      if (payload === "[DONE]") continue;
      try {
        const token = JSON.parse(payload).choices?.[0]?.delta?.content;
        if (token) {
          full += token;
          onToken(token); // pass only the NEW token — caller appends
        }
      } catch { /* skip malformed SSE */ }
    }
  }
  return full;
}

const PROMPTS = {
  screener: `You are the Market Screener Agent for InvestIQ.
Find and rank the best investment opportunities for the user's question.

Respond EXACTLY in this format:
**TOP PICKS**
- TICKER (Class) — Score X/10 — BUY/HOLD/SELL
  ✅ Why: [one clear sentence]
  ⚠️ Watch: [one specific risk]
(list 3-5 assets max)
**SECTOR TAILWINDS**
- [trend 1]
- [trend 2]
**AVOID RIGHT NOW**
- [asset/sector] — [reason]
Max 220 words.`,

  portfolio: `You are the Portfolio Analyzer Agent for InvestIQ.
Analyze portfolio risk for the user's question.
**RISK LEVELS**
- Volatility: [LOW/MEDIUM/HIGH] — [why]
- Concentration: [LOW/MEDIUM/HIGH] — [what]
- Correlation: [LOW/MEDIUM/HIGH] — [which assets]
**WHAT TO DO**
- [action 1] — [reason]
- [action 2] — [reason]
- [action 3] — [reason]
**POSITION SIZING**
- [main asset]: X% — [rationale]
- [secondary]: X% — [rationale]
Max 200 words.`,

  sentiment: `You are the Sentiment Agent for InvestIQ.
**MARKET MOOD**
[Bullish/Neutral/Bearish] — Score: [+/-XX]
[One sentence on dominant emotion]
**WHAT'S DRIVING IT**
- [Driver 1] → [impact]
- [Driver 2] → [impact]
- [Driver 3] → [impact]
**UPCOMING CATALYSTS**
- [Event] — [timing] — [impact]
**CONTRARIAN VIEW**
[Contrarian signal]
Max 180 words.`,

  recommendation: `You are the Recommendation Engine for InvestIQ.
**SIGNAL**
[STRONG BUY/BUY/HOLD/SELL/STRONG SELL]
**TOP PICK: TICKER** — Score: X.X/10
- Target: $XXX | Bull: $XXX | Bear: $XXX
- Entry: $XXX–$XXX | Stop: $XXX
- Position: X%
**WHY NOW**
✅ [Catalyst 1]
✅ [Catalyst 2]
**RISKS**
⚠️ [Risk 1]
⚠️ [Risk 2]
One pick only. Max 200 words.`,

  orchestrator: `You are the Orchestrator for InvestIQ.
Synthesize four analyses into ONE clear answer.
1. Open with a bold direct answer sentence — no preamble
2. Use EXACTLY these headers:
   ## 📊 Market Outlook
   ## 🎯 Best Opportunity Right Now
   ## ⚠️ What Could Go Wrong
   ## ✅ What You Should Do
3. Write like a smart finance friend explaining to a non-expert
4. Explain WHY for every claim: "X because Y, which means Z"
5. End with:
---
**Confidence: X/10** · **Time Horizon: X-term** · **Biggest Risk: one sentence**
---
350–430 words total. Confident, clear, no jargon.`,
};

export async function runPipeline(query, apiKey, onStage, onToken, signal) {
  onStage("parallel");
  const [screener, portfolio, sentiment] = await Promise.all([
    callGroq(PROMPTS.screener,  query, apiKey),
    callGroq(PROMPTS.portfolio, query, apiKey),
    callGroq(PROMPTS.sentiment, query, apiKey),
  ]);

  onStage("recommendation");
  const recInput = `User question: ${query}\n\n=== SCREENER ===\n${screener}\n\n=== PORTFOLIO ===\n${portfolio}\n\n=== SENTIMENT ===\n${sentiment}\n\nProvide your recommendation.`;
  const recommendation = await callGroq(PROMPTS.recommendation, recInput, apiKey);

  onStage("orchestrator");
  const orchInput = `User question: "${query}"\n\n=== SCREENER ===\n${screener}\n\n=== PORTFOLIO ===\n${portfolio}\n\n=== SENTIMENT ===\n${sentiment}\n\n=== RECOMMENDATION ===\n${recommendation}\n\nWrite your final answer.`;

  const final = await callGroqStream(PROMPTS.orchestrator, orchInput, apiKey, onToken, signal);
  return { final, agents: { screener, portfolio, sentiment, recommendation } };
}