import { useEffect, useRef, useState } from "react";
import { MessagesSquare, Send } from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import TopBar from "../components/TopBar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useDocument } from "../context/DocumentContext.jsx";

export default function ChatPage() {
  const { status, filename, chatHistory, chatPending, askQuestion } = useDocument();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory, chatPending]);

  if (status !== "ready") {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="No document to ask yet"
        description="Upload a document first, then ask it anything — clauses, obligations, definitions."
      />
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const message = draft.trim();
    if (!message || chatPending) return;
    setDraft("");
    askQuestion(message);
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <TopBar title="Ask the document" subtitle={`Answers are grounded in the passages of ${filename}`} />

      <GlassCard className="flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-sapphire-500/[0.18] text-ink-100"
                    : "border border-white/[0.07] bg-white/[0.03] text-ink-200"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {chatPending && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm text-ink-400">
                Thinking…
              </div>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="brass-divider-top flex items-center gap-3 border-t border-white/[0.07] p-4">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about a clause, obligation, or risk…"
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-400 focus:border-brass-500/50"
          />
          <button
            type="submit"
            disabled={chatPending || !draft.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-brass-500/[0.16] px-4 py-2.5 text-sm text-brass-300 transition-colors hover:bg-brass-500/[0.24] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
            Send
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
