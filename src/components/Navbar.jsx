export default function Navbar({ page, setPage }) {
  const navLinks = [
    { label: "Home",     key: "home"     },
    { label: "How It Works", key: "how"  },
    { label: "Markets",  key: "markets"  },
    { label: "Chat",     key: "chat"     },
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 200,
      height: 58,
      background: "rgba(9,8,10,0.93)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      backdropFilter: "blur(24px)",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
    }}>
      {/* Logo */}
      <button onClick={() => setPage("home")} style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "none", border: "none", cursor: "pointer",
        padding: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg, var(--gold), var(--gold-dim))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, animation: "glow 4s ease infinite",
        }}>◈</div>
        <span style={{ fontFamily: "Fraunces, serif", fontSize: "1.12rem", fontWeight: 700, color: "var(--text)" }}>
          Invest<span style={{ color: "var(--gold)" }}>IQ</span>
        </span>
        <span style={{
          fontSize: "0.58rem", fontWeight: 700, color: "var(--gold)",
          background: "rgba(212,175,106,0.1)", border: "1px solid rgba(212,175,106,0.2)",
          padding: "2px 8px", borderRadius: 20, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>Multi-Agent AI</span>
      </button>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 2 }}>
        {navLinks.map(({ label, key }) => (
          <button key={key} onClick={() => setPage(key)} style={{
            padding: "6px 14px", borderRadius: 7,
            background: page === key ? "rgba(212,175,106,0.1)" : "transparent",
            border: `1px solid ${page === key ? "rgba(212,175,106,0.2)" : "transparent"}`,
            color: page === key ? "var(--gold)" : "var(--text-dim)",
            fontWeight: 600, fontSize: "0.78rem",
            transition: "var(--t)", cursor: "pointer",
          }}
            onMouseEnter={e => { if (page !== key) { e.currentTarget.style.color = "var(--text)"; } }}
            onMouseLeave={e => { if (page !== key) { e.currentTarget.style.color = "var(--text-dim)"; } }}
          >{label}</button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }} className="hide-sm">
          <span className="dot-live" />
          <span className="mono" style={{ fontSize: "0.66rem", color: "var(--text-dim)" }}>5 agents online</span>
        </div>
        <button className="btn-primary" onClick={() => setPage("chat")} style={{ padding: "7px 18px" }}>
          Launch →
        </button>
      </div>
    </nav>
  );
}