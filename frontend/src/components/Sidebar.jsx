import { NavLink } from "react-router-dom";
import { FileDown, FileText, Lock, MessagesSquare, Scale, ShieldAlert, UploadCloud } from "lucide-react";
import { useDocument } from "../context/DocumentContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Upload", icon: UploadCloud, alwaysOn: true },
  { to: "/summary", label: "Summary", icon: FileText },
  { to: "/risks", label: "Risk assessment", icon: ShieldAlert },
  { to: "/chat", label: "Ask the document", icon: MessagesSquare },
  { to: "/reports", label: "Reports", icon: FileDown },
];

export default function Sidebar() {
  const { status, filename } = useDocument();
  const ready = status === "ready";

  return (
    <aside className="glass-panel sticky top-6 flex h-[calc(100vh-3rem)] w-64 flex-col justify-between rounded-2xl p-5">
      <div>
        <div className="mb-8 flex items-center gap-2.5 px-1">
          <Scale className="h-5 w-5 text-brass-500" strokeWidth={1.75} />
          <span className="font-display text-lg tracking-tight text-ink-100">JurisMind</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, alwaysOn }) => {
            const locked = !alwaysOn && !ready;
            return (
              <NavLink
                key={to}
                to={locked ? "#" : to}
                onClick={(e) => locked && e.preventDefault()}
                title={locked ? "Upload a document first" : undefined}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    locked
                      ? "cursor-not-allowed text-ink-400/50"
                      : isActive
                      ? "bg-brass-500/[0.12] text-brass-300"
                      : "text-ink-200 hover:bg-white/[0.05] hover:text-ink-100",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span>{label}</span>
                {locked && <Lock className="ml-auto h-3.5 w-3.5" strokeWidth={1.75} />}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="brass-divider mb-4" />

      <div className="px-1 text-xs leading-relaxed text-ink-400">
        {ready ? (
          <p className="truncate" title={filename}>
            Working on <span className="text-ink-200">{filename}</span>
          </p>
        ) : (
          <p>No document loaded yet.</p>
        )}
        <p className="mt-2">For informational purposes only — not a substitute for legal advice.</p>
      </div>
    </aside>
  );
}
