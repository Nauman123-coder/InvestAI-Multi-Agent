import { useState } from "react";

export default function ApiKeyModal({ onSave }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const trimmed = key.trim();
    if (!trimmed) { setError("Please enter your API key."); return; }
    if (!trimmed.startsWith("gsk_")) {
      setError("Groq API keys start with gsk_ — double-check your key.");
      return;
    }
    setLoading(true);
    // Small delay for feel
    await new Promise(r => setTimeout(r, 400));
    onSave(trimmed);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(9,8,10,0.94)",
      backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        width: "100%", maxWidth: 460,
        background: "var(--bg2)",
        border: "1px solid rgba(212,175,106,0.15)",
        borderRadius: 16,
        padding: "40px 36px",
        animation: "fadeUp 0.4s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "linear-gradient(135deg, var(--gold), var(--gold-dim))",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>◈</div>
          <span style={{ fontFamily: "Fraunces, serif", fontSize: "1.2rem", fontWeight: 700 }}>
            Invest<span style={{ color: "var(--gold)" }}>IQ</span>
          </span>
        </div>

        <h2 style={{ fontSize: "1.5rem", marginBottom: 10 }}>Connect Groq API</h2>
        <p style={{ color: "var(--text-dim)", fontSize: "0.86rem", lineHeight: 1.7, marginBottom: 28 }}>
          InvestIQ uses Groq's blazing-fast inference to run five AI agents in parallel.
          Get your <strong style={{ color: "var(--text)" }}>free</strong> API key at{" "}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer"
            style={{ color: "var(--gold)" }}>console.groq.com</a>.
        </p>

        {/* Steps */}
        <div style={{ marginBottom: 24 }}>
          {["Create a free account at console.groq.com", "Go to API Keys → Create API Key", "Paste your key below"].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                background: "rgba(212,175,106,0.15)", border: "1px solid rgba(212,175,106,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.62rem", fontWeight: 700, color: "var(--gold)", marginTop: 1,
              }}>{i + 1}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
        </div>

        <label style={{
          fontSize: "0.68rem", fontWeight: 700, color: "var(--text-dim)",
          letterSpacing: "0.08em", textTransform: "uppercase",
          display: "block", marginBottom: 8,
        }}>API Key</label>

        <input
          type="password"
          value={key}
          onChange={e => { setKey(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSave()}
          placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
          autoFocus
          style={{
            width: "100%", padding: "12px 14px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${error ? "var(--red)" : "rgba(255,255,255,0.09)"}`,
            borderRadius: 9, color: "var(--text)",
            fontFamily: "JetBrains Mono, monospace", fontSize: "0.82rem",
            outline: "none", marginBottom: 8, transition: "border-color 0.2s",
          }}
        />
        {error && (
          <p style={{ color: "var(--red)", fontSize: "0.76rem", marginBottom: 12 }}>{error}</p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 22 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
          <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
            Stored in your browser only — never sent anywhere except Groq
          </span>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", padding: "13px", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Connecting…" : "Connect & Launch InvestIQ →"}
        </button>
      </div>
    </div>
  );
}