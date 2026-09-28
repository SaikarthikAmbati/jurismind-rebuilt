import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, MessagesSquare, ShieldAlert, UploadCloud } from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import TopBar from "../components/TopBar.jsx";
import { useDocument } from "../context/DocumentContext.jsx";

const STAT_CARDS = [
  { key: "wordCount", label: "Words read", icon: FileText },
  { key: "chunkCount", label: "Passages indexed", icon: MessagesSquare },
  { key: "riskCount", label: "Risk flags found", icon: ShieldAlert },
];

export default function UploadPage() {
  const { status, filename, wordCount, chunkCount, risks, error, upload } = useDocument();
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const riskCount = Object.values(risks || {}).reduce((a, b) => a + b, 0);
  const stats = { wordCount, chunkCount, riskCount };

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (!file) return;
      upload(file);
    },
    [upload]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <TopBar
        title="Upload a legal document"
        subtitle="Drop in a PDF to get a structured summary, a risk breakdown, and an assistant that has read it."
      />

      <GlassCard strong className="p-8 md:p-12">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center transition-colors ${
            dragActive ? "border-brass-500 bg-brass-500/[0.06]" : "border-white/[0.14] hover:border-white/[0.24]"
          }`}
        >
          <UploadCloud className="mb-4 h-9 w-9 text-brass-500/80" strokeWidth={1.5} />
          <p className="font-display text-lg text-ink-100">
            {status === "processing" ? "Reading your document…" : "Drag a PDF here, or click to browse"}
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink-400">
            {status === "processing"
              ? "Extracting text, indexing passages, and drafting a summary. This can take a moment for longer contracts."
              : "Contracts, filings, policies — anything under a few hundred pages works best."}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-risk-high/30 bg-risk-high/[0.08] px-4 py-3 text-sm text-risk-high">
            {error}
          </div>
        )}
      </GlassCard>

      {status === "ready" && (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {STAT_CARDS.map(({ key, label, icon: Icon }) => (
              <GlassCard key={key} className="p-5">
                <Icon className="mb-3 h-4 w-4 text-brass-500" strokeWidth={1.75} />
                <p className="font-display text-2xl text-ink-100">{stats[key]?.toLocaleString?.() ?? stats[key]}</p>
                <p className="mt-1 text-xs text-ink-400">{label}</p>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="mt-4 flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm text-ink-100">
                <span className="text-ink-400">Now analyzed:</span> {filename}
              </p>
              <p className="mt-1 text-xs text-ink-400">Head to summary, risk assessment, or ask it a question directly.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/summary")}
                className="rounded-lg bg-brass-500/[0.14] px-4 py-2 text-sm text-brass-300 transition-colors hover:bg-brass-500/[0.22]"
              >
                View summary
              </button>
              <button
                onClick={() => navigate("/chat")}
                className="rounded-lg border border-white/[0.1] px-4 py-2 text-sm text-ink-200 transition-colors hover:bg-white/[0.06]"
              >
                Ask a question
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
