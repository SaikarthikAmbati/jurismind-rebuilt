import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import TopBar from "../components/TopBar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useDocument } from "../context/DocumentContext.jsx";

export default function SummaryPage() {
  const { status, summary, filename, wordCount, chunkCount } = useDocument();
  const [copied, setCopied] = useState(false);

  if (status !== "ready") {
    return (
      <EmptyState
        icon={FileText}
        title="No summary yet"
        description="Upload a document first and its structured summary will appear here."
      />
    );
  }

  const copySummary = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div>
      <TopBar title="Summary" subtitle={`Structured overview of ${filename}`} />

      <div className="mb-5 flex flex-wrap gap-4 text-xs text-ink-400">
        <span>{wordCount.toLocaleString()} words read</span>
        <span className="text-ink-600">·</span>
        <span>{chunkCount} passages indexed</span>
      </div>

      <GlassCard className="relative p-8">
        <button
          onClick={copySummary}
          className="absolute right-6 top-6 flex items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs text-ink-200 transition-colors hover:bg-white/[0.06]"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <div className="max-w-2xl whitespace-pre-wrap font-body text-[15px] leading-relaxed text-ink-200">
          {summary}
        </div>
      </GlassCard>
    </div>
  );
}
