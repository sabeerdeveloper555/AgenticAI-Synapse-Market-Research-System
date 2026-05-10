import { useState, useEffect } from "react";

export default function ReportHistory({ onLoad, backendUrl }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/api/reports`);
      const data = await res.json();
      setReports(data);
    } catch {
      setError("Could not connect to Synapse backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-3"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading history…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <div className="text-3xl mb-3">⚠️</div>
        <p className="text-sm mb-4" style={{ color: "var(--red)" }}>{error}</p>
        <button onClick={fetchReports} className="btn-ghost px-5 py-2 text-sm font-semibold">
          Retry
        </button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-16">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          🗂️
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          No Reports Yet
        </h2>
        <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
          Generate your first research report and it will be saved here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              Saved Reports
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {reports.length} report{reports.length !== 1 ? "s" : ""} stored locally
            </p>
          </div>
          <button
            onClick={fetchReports}
            className="btn-ghost px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="group flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200 cursor-pointer"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)66";
                e.currentTarget.style.background = "var(--accent-glow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--bg-card)";
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  📄
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {r.topic}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {new Date(r.created_at).toLocaleString()} · #{r.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onLoad(r.id)}
                className="btn-accent px-4 py-2 text-xs font-semibold"
              >
                View Report
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
