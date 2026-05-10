import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ReportViewer({ report }) {
  const [copied, setCopied] = useState(false);

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-16">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          📄
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          No Report Yet
        </h2>
        <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
          Start a research session to generate your report, or load one from
          History.
        </p>
      </div>
    );
  }

  const handleExportMd = () => {
    const blob = new Blob([report.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synapse-${report.topic.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const content = document.querySelector(".report-content");
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Synapse — ${report.topic}</title>
      <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 40px; color: #111; line-height: 1.7; }
        h1 { font-size: 2em; border-bottom: 2px solid #6366f1; padding-bottom: 10px; color: #1e1b4b; }
        h2 { font-size: 1.4em; color: #312e81; margin-top: 2em; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; }
        h3 { font-size: 1.1em; color: #4338ca; margin-top: 1.5em; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.9em; }
        th { background: #6366f1; color: white; padding: 8px 12px; text-align: left; }
        td { border: 1px solid #ddd; padding: 8px 12px; }
        tr:nth-child(even) td { background: #f5f5ff; }
        code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-size: 0.85em; }
        pre { background: #f0f0f0; padding: 12px; border-radius: 6px; overflow-x: auto; }
        blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 16px; color: #555; }
        strong { color: #1e1b4b; }
        @media print { body { margin: 20px; } }
      </style>
    </head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-6 py-3.5 shrink-0"
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)44" }}
          >
            📄
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Report
            </p>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {report.topic}
            </h2>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="btn-ghost px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            {copied ? (
              <><span style={{ color: "var(--green)" }}>✓</span> Copied</>
            ) : (
              <><span>📋</span> Copy</>
            )}
          </button>
          <button
            onClick={handleExportMd}
            className="btn-ghost px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export .md
          </button>
          <button
            onClick={handleExportPdf}
            className="btn-accent px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export .pdf
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <article className="report-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {report.content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
