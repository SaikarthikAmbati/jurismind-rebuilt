import { RotateCcw } from "lucide-react";
import { useDocument } from "../context/DocumentContext.jsx";

const STATUS_COPY = {
  empty: { label: "No document", dot: "bg-ink-400" },
  processing: { label: "Analyzing…", dot: "bg-brass-500 animate-pulse" },
  ready: { label: "Ready", dot: "bg-risk-low" },
  error: { label: "Needs attention", dot: "bg-risk-high" },
};

export default function TopBar({ title, subtitle }) {
  const { status, reset } = useDocument();
  const statusCopy = STATUS_COPY[status] ?? STATUS_COPY.empty;

  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl text-ink-100 md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-400">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-ink-200">
          <span className={`h-1.5 w-1.5 rounded-full ${statusCopy.dot}`} />
          {statusCopy.label}
        </span>
        {status !== "empty" && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-ink-200 transition-colors hover:bg-white/[0.07]"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            New document
          </button>
        )}
      </div>
    </div>
  );
}
