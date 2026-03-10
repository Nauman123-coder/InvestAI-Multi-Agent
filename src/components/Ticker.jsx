import { TICKER_ITEMS } from "../data/constants.js";

export default function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker-wrap" style={{
      height: 34,
      background: "rgba(9,8,10,0.97)",
      borderBottom: "1px solid rgba(212,175,106,0.1)",
      display: "flex",
      alignItems: "center",
    }}>
      <div className="ticker-track">
        {items.map((t, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "0 24px",
          }}>
            <span className="mono" style={{ fontSize: "0.7rem", color: "var(--gold)", fontWeight: 600 }}>
              {t.sym}
            </span>
            <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              {t.price}
            </span>
            <span className="mono" style={{
              fontSize: "0.7rem", fontWeight: 700,
              color: t.up ? "var(--green)" : "var(--red)",
            }}>
              {t.chg}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.5rem", margin: "0 4px" }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}