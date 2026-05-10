import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import SearchBar from "./components/SearchBar";
import AgentLog from "./components/AgentLog";
import ReportViewer from "./components/ReportViewer";
import ReportHistory from "./components/ReportHistory";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [activeTab, setActiveTab] = useState("research");
  const socketRef = useRef(null);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark",  theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const sock = io(BACKEND_URL, { transports: ["websocket", "polling"] });
    socketRef.current = sock;
    setSocket(sock);

    sock.on("connect", () => setConnected(true));
    sock.on("disconnect", () => setConnected(false));
    sock.on("connected", () => setConnected(true));

    sock.on("agent_log", (data) =>
      setLogs((prev) => [...prev, { ...data, timestamp: new Date().toLocaleTimeString() }])
    );

    sock.on("research_complete", (data) => {
      setReport({ content: data.report, topic: data.topic, id: data.report_id });
      setIsResearching(false);
      setActiveTab("report");
    });

    sock.on("research_error", (data) => {
      setLogs((prev) => [
        ...prev,
        { agent: "system", message: `Error: ${data.error}`, status: "error", timestamp: new Date().toLocaleTimeString() },
      ]);
      setIsResearching(false);
    });

    return () => sock.disconnect();
  }, []);

  const startResearch = (topic) => {
    if (!topic.trim() || isResearching) return;
    setCurrentTopic(topic);
    setLogs([]);
    setReport(null);
    setIsResearching(true);
    setActiveTab("research");
    socketRef.current.emit("start_research", { topic });
  };

  const loadReport = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/reports/${id}`);
      const data = await res.json();
      setReport({ content: data.content, topic: data.topic, id: data.id });
      setActiveTab("report");
    } catch {
      alert("Failed to load report.");
    }
  };

  const tabs = [
    { id: "research", label: "Agent Activity", icon: "⚡" },
    { id: "report",   label: "Report",         icon: "📄" },
    { id: "history",  label: "History",        icon: "🗂️" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white text-sm"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", boxShadow: "0 4px 14px var(--accent-glow)" }}
          >
            S
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight gradient-text">Synapse</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Agentic AI Market Research
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass"
            style={{ border: "1px solid var(--border)" }}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: connected ? "var(--green)" : "var(--red)",
                boxShadow: connected ? "0 0 6px var(--green)" : "none",
              }}
            />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {connected ? "Live" : "Offline"}
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn-ghost w-9 h-9 flex items-center justify-center rounded-xl text-base"
            title="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* ── Hero / Search ───────────────────────────────────────────────── */}
      <div
        className="px-6 py-10 text-center"
        style={{
          background: "linear-gradient(180deg, var(--accent-glow) 0%, transparent 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
          Multi-Agent Intelligence
        </p>
        <h2
          className="text-3xl font-extrabold mb-1 tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Market Research,{" "}
          <span className="gradient-text">Automated</span>
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Three AI agents collaborate to deliver deep market insights and professional reports.
        </p>
        <SearchBar onSearch={startResearch} isLoading={isResearching} />
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div
        className="flex px-6 gap-1"
        style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === tab.id ? "tab-active" : "tab-inactive"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.id === "report" && report && (
              <span
                className="w-1.5 h-1.5 rounded-full ml-1"
                style={{ background: "var(--accent)", boxShadow: "0 0 4px var(--accent)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "research" && (
          <AgentLog logs={logs} isResearching={isResearching} topic={currentTopic} />
        )}
        {activeTab === "report" && (
          <ReportViewer report={report} />
        )}
        {activeTab === "history" && (
          <ReportHistory onLoad={loadReport} backendUrl={BACKEND_URL} />
        )}
      </main>
    </div>
  );
}
