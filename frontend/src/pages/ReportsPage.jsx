import { useState } from "react";
import { Download, FileDown, Mail } from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import TopBar from "../components/TopBar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useDocument } from "../context/DocumentContext.jsx";
import { downloadFile, extractErrorMessage, riskChartUrl, sendReportEmail, summaryDownloadUrl } from "../api/client.js";

export default function ReportsPage() {
  const { status, sessionId, risks } = useDocument();
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  if (status !== "ready") {
    return (
      <EmptyState
        icon={FileDown}
        title="Nothing to export yet"
        description="Upload a document first, then download its summary or risk chart from here."
      />
    );
  }

  const hasRisks = Object.values(risks || {}).some((count) => count > 0);

  const handleDownload = async (url, filename) => {
    setDownloadError("");
    try {
      await downloadFile(url, filename);
    } catch (err) {
      setDownloadError(extractErrorMessage(err));
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailStatus({ ok: false, message: "Enter a valid email address." });
      return;
    }
    try {
      await sendReportEmail(sessionId, email.trim());
      setEmailStatus({ ok: true, message: `Report will be sent to ${email.trim()}.` });
    } catch (err) {
      setEmailStatus({ ok: false, message: extractErrorMessage(err) });
    }
  };

  return (
    <div>
      <TopBar title="Reports" subtitle="Export what JurisMind found, or send it to your inbox." />

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="font-display text-lg text-ink-100">Summary</h2>
          <p className="mt-1.5 text-sm text-ink-400">Download the structured summary as a plain text file.</p>
          <button
            onClick={() => handleDownload(summaryDownloadUrl(sessionId), "summary.txt")}
            className="mt-5 flex items-center gap-2 rounded-lg bg-brass-500/[0.14] px-4 py-2 text-sm text-brass-300 transition-colors hover:bg-brass-500/[0.22]"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            Download summary.txt
          </button>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-display text-lg text-ink-100">Risk chart</h2>
          <p className="mt-1.5 text-sm text-ink-400">
            {hasRisks ? "Download the risk distribution as a PNG image." : "No risks were detected, so there's no chart to export."}
          </p>
          <button
            onClick={() => handleDownload(riskChartUrl(sessionId), "risk_distribution.png")}
            disabled={!hasRisks}
            className="mt-5 flex items-center gap-2 rounded-lg bg-brass-500/[0.14] px-4 py-2 text-sm text-brass-300 transition-colors hover:bg-brass-500/[0.22] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            Download chart.png
          </button>
        </GlassCard>
      </div>

      {downloadError && (
        <div className="mt-4 rounded-xl border border-risk-high/30 bg-risk-high/[0.08] px-4 py-3 text-sm text-risk-high">
          {downloadError}
        </div>
      )}

      <GlassCard className="mt-4 p-6">
        <h2 className="font-display text-lg text-ink-100">Send via email</h2>
        <p className="mt-1.5 text-sm text-ink-400">Get the summary and risk chart delivered to your inbox.</p>
        <form onSubmit={handleEmail} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@firm.com"
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-400 focus:border-brass-500/50"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-ink-200 transition-colors hover:bg-white/[0.06]"
          >
            <Mail className="h-4 w-4" strokeWidth={1.75} />
            Send report
          </button>
        </form>
        {emailStatus && (
          <p className={`mt-3 text-sm ${emailStatus.ok ? "text-risk-low" : "text-risk-high"}`}>{emailStatus.message}</p>
        )}
      </GlassCard>
    </div>
  );
}
