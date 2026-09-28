import { Link } from "react-router-dom";
import GlassCard from "./GlassCard.jsx";

export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <GlassCard className="mx-auto mt-16 max-w-md p-10 text-center">
      {Icon && <Icon className="mx-auto mb-4 h-8 w-8 text-brass-500/70" strokeWidth={1.5} />}
      <h2 className="font-display text-xl text-ink-100">{title}</h2>
      <p className="mt-2 text-sm text-ink-400">{description}</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-brass-500/[0.14] px-4 py-2 text-sm text-brass-300 transition-colors hover:bg-brass-500/[0.22]"
      >
        Go to upload
      </Link>
    </GlassCard>
  );
}
