import { useState } from "react";

const EXAMPLE_TOPICS = [
  "Cryptocurrency Market",
  "Electric Vehicle Industry",
  "Generative AI in Healthcare",
  "Cloud Computing 2025",
  "Global E-Commerce Trends",
];

export default function SearchBar({ onSearch, isLoading }) {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) onSearch(topic);
  };

  const handleExample = (t) => {
    setTopic(t);
    onSearch(t);
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none"
            style={{ color: "var(--text-muted)" }}>
            🔍
          </span>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a market research topic…"
            disabled={isLoading}
            className="input-field w-full pl-11 pr-4 py-3.5 text-sm font-medium disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="btn-accent px-6 py-3.5 text-sm flex items-center gap-2 whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Researching…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Run Research
            </>
          )}
        </button>
      </form>

      {/* Example chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Try:</span>
        {EXAMPLE_TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => handleExample(t)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 disabled:opacity-40"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
