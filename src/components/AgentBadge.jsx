import { AGENT_META } from "../data/constants.js";

export default function AgentBadge({ agentKey, size = "sm" }) {
  const agent = AGENT_META.find(a => a.key === agentKey);
  if (!agent) return null;

  const lg = size === "lg";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: lg ? 7 : 5,
      background: `${agent.color}12`,
      border: `1px solid ${agent.color}30`,
      borderRadius: 20,
      padding: lg ? "5px 12px" : "3px 9px",
    }}>
      <span style={{ fontSize: lg ? 14 : 11, color: agent.color }}>{agent.icon}</span>
      <span style={{
        fontSize: lg ? "0.72rem" : "0.6rem",
        fontWeight: 700, letterSpacing: "0.07em",
        textTransform: "uppercase", color: agent.color,
      }}>{agent.name}</span>
    </span>
  );
}