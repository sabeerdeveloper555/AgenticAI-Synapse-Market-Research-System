import { useEffect, useRef } from "react";

const AGENTS = {
  "Trend Researcher": {
    icon: "📡",
    color: "var(--emerald)",
    glow: "rgba(52,211,153,0.2)",
    bg: "rgba(52,211,153,0.06)",
  },
  "Strategic Analyst": {
    icon: "🧠",
    color: "var(--violet)",
    glow: "rgba(167,139,250,0.2)",
    bg: "rgba(167,139,250,0.06)",
  },
  "Executive Editor": {
    icon: "✍️",
    color: "var(--amber)",
    glow: "rgba(251,191,36,0.2)",
    bg: "rgba(251,191,36,0.06)",
  },
  system: {
    icon: "⚙️",
    color: "var(--cyan)",
    glow: "var(--cyan-glow)",
    bg: "rgba(34,211,238,0.04)",
  },
};

const STATUS = {
  started: { icon: "◆", color: "var(--accent)" },
  working: { icon: "◈", color: "var(--amber)" },
  done:    { icon: "✓", color: "var(--green)" },
  error:   { icon: "✗", color: "var(--red)" },
};

export default function AgentLog({ logs, isResearching, topic }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!isResearching && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-16">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          🔬
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Ready to Research
        </h2>
        <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
          Enter a market topic above. Three AI agents will collaborate to deliver
          a professional research report in real time.
        </p>

        {/* Agent cards */}
        <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg w-full">
          {Object.entries(AGENTS)
            .filter(([k]) => k !== "system")
            .map(([name, a]) => (
              <div
                key={name}
                className="rounded-2xl p-4 text-center"
                style={{
                  background: a.bg,
                  border: `1px solid ${a.color}33`,
                }}
              >
                <div className="text-3xl mb-2">{a.icon}</div>
                <div className="text-xs font-semibold" style={{ color: a.color }}>{name}</div>
              </div>
            ))}
        </div>

        {/* Pipeline arrows */}
        <div className="mt-6 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <span style={{ color: "var(--emerald)" }}>Research</span>
          <span>→</span>
          <span style={{ color: "var(--violet)" }}>Analysis</span>
          <span>→</span>
          <span style={{ color: "var(--amber)" }}>Report</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Topic banner */}
      {topic && (
        <div
          className="mb-5 rounded-2xl px-5 py-4"
          style={{
            background: "var(--accent-glow)",
            border: "1px solid var(--accent)44",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "var(--accent)" }}>
            Active Research
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            "{topic}"
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {logs.map((log, i) => {
          const agent = AGENTS[log.agent] || AGENTS.system;
          const status = STATUS[log.status] || { icon: "•", color: "var(--text-muted)" };
          return (
            <div
              key={i}
              className="animate-slide-in flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{
                background: agent.bg,
                border: `1px solid ${agent.color}22`,
              }}
            >
              <span className="text-base mt-0.5 shrink-0">{agent.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold mr-2" style={{ color: agent.color }}>
                  {log.agent}
                </span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {log.message}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold" style={{ color: status.color }}>
                  {status.icon}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {log.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Working indicator */}
        {isResearching && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "var(--cyan-glow)",
              border: "1px solid var(--cyan)44",
            }}
          >
            <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24"
              style={{ color: "var(--cyan)" }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: "var(--cyan)" }}>
              Agents working — this may take a few minutes…
            </span>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
