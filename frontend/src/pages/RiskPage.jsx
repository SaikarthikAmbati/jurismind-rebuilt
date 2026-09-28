import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Download, ShieldAlert, ShieldCheck } from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import TopBar from "../components/TopBar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useDocument } from "../context/DocumentContext.jsx";
import { downloadFile, riskChartUrl } from "../api/client.js";

const COLORS = ["#C9A667", "#5D7FE8", "#4FAE7E"];

export default function RiskPage() {
  const { status, risks, filename, sessionId } = useDocument();

  if (status !== "ready") {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No risk data yet"
        description="Upload a document first and its risk breakdown will appear here."
      />
    );
  }

  const entries = Object.entries(risks || {});
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const chartData = entries.map(([name, value]) => ({ name, value }));

  const handleDownload = async () => {
    try {
      await downloadFile(riskChartUrl(sessionId), "risk_distribution.png");
    } catch {
      // The button below already communicates chart availability via `total`.
    }
  };

  return (
    <div>
      <TopBar title="Risk assessment" subtitle={`Keyword-based risk signals found in ${filename}`} />

      <div className="grid gap-4 sm:grid-cols-3">
        {entries.map(([category, count]) => (
          <GlassCard key={category} className="p-5">
            <p className="text-xs text-ink-400">{category}</p>
            <p className="font-display mt-1 text-3xl text-ink-100">{count}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-4 p-8">
        {total === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <ShieldCheck className="mb-3 h-8 w-8 text-risk-low/80" strokeWidth={1.5} />
            <p className="text-sm text-ink-200">No risk keywords were detected in this document.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ink-100">Distribution</h2>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs text-ink-200 transition-colors hover:bg-white/[0.06]"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                Download PNG
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0F1526",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#F4F2EC",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#8991AC", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
