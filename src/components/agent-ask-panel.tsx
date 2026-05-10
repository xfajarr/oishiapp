import { Bot, Loader2, Send } from "lucide-react";
import { useId, useState, useEffect, forwardRef, type FormEvent, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { AgentIdentity } from "@/hooks/use-solana-data";
import { useOishiBackend } from "@/hooks/use-oishi-backend";
import { AgentMessageMarkdown } from "@/components/agent-message-markdown";

export const AgentAskPanel = forwardRef<
  HTMLElement,
  {
    agent: AgentIdentity;
    backendAgentId: string | null;
  } & Pick<HTMLAttributes<HTMLElement>, "className">
>(function AgentAskPanel({ agent, backendAgentId, className }, ref) {
  const formId = useId();
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const { api, isReady } = useOishiBackend();

  const [input, setInput] = useState("");
  type ChatRow = { id: string; role: "agent" | "user"; body: string; at: number };
  const [rows, setRows] = useState<ChatRow[]>(() => [
    {
      id: "seed",
      role: "agent",
      at: Date.now(),
      body: `Hey — I'm ${agent.displayName || agent.handle}. Ask me about allocations, rules, or what needs your approval. Replies come from your Oishi agent backend (LLM + tools + policy).`,
    },
  ]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setRows([
      {
        id: "seed",
        role: "agent",
        at: Date.now(),
        body: `Hey — I'm ${agent.displayName || agent.handle}. Ask me about allocations, rules, or what needs your approval.`,
      },
    ]);
    setInput("");
  }, [agent.displayName, agent.handle, backendAgentId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t || busy) return;

    setRows((prev) => [...prev, { id: `u-${uid()}`, role: "user", at: Date.now(), body: t }]);
    setInput("");
    setBusy(true);

    if (!backendAgentId) {
      setRows((prev) => [
        ...prev,
        {
          id: `a-${uid()}`,
          role: "agent",
          at: Date.now(),
          body: "Your wallet doesn’t have an Oishi backend agent yet — launch one from the “Launch new agent” tab so we can run the real LLM and tools.",
        },
      ]);
      setBusy(false);
      return;
    }

    if (!api || !isReady) {
      setRows((prev) => [
        ...prev,
        {
          id: `a-${uid()}`,
          role: "agent",
          at: Date.now(),
          body: "Connect your wallet and approve signing so we can authenticate with the Oishi API.",
        },
      ]);
      setBusy(false);
      return;
    }

    try {
      const { reply } = await api.chatWithAgent(backendAgentId, t);
      setRows((prev) => [
        ...prev,
        {
          id: `a-${uid()}`,
          role: "agent",
          at: Date.now(),
          body: reply.trim() || "…",
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Chat request failed.";
      setRows((prev) => [
        ...prev,
        {
          id: `a-${uid()}`,
          role: "agent",
          at: Date.now(),
          body: `Couldn’t reach the agent: ${msg}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      ref={ref}
      id="agent-chat"
      className={cn(
        "flex min-h-0 flex-1 flex-col border-t border-border bg-background -mx-5 border-x-0",
        className,
      )}
      aria-labelledby={formId + "-heading"}
    >
      <div className="border-b border-border bg-muted/40 px-5 py-3">
        <p id={formId + "-heading"} className="font-display text-lg text-foreground">
          Ask your agent
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Live answers from the backend (requires an active agent). Tool calls still respect your
          KYA limits and policy.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-3 pb-4 [scrollbar-gutter:stable]">
        {rows.map((r) => (
          <div
            key={r.id}
            className={cn("flex gap-3", r.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                r.role === "user"
                  ? "border border-border bg-secondary text-foreground"
                  : "bg-accent text-accent-foreground",
              )}
            >
              {r.role === "user" ? "You" : <Bot className="size-4" aria-hidden />}
            </span>
            <div
              className={cn(
                "max-w-[min(100%,28rem)] border px-3 py-2.5 text-sm",
                r.role === "user"
                  ? "border-border/80 bg-secondary text-foreground"
                  : "border-border/60 bg-muted/50 text-foreground",
              )}
            >
              {r.role === "agent" ? (
                <AgentMessageMarkdown text={r.body} />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{r.body}</p>
              )}
            </div>
          </div>
        ))}
        {busy ? (
          <div className="flex items-center gap-2 px-11 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden /> Thinking…
          </div>
        ) : null}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex gap-2 border-t border-border bg-muted/30 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
      >
        <label htmlFor={formId} className="sr-only">
          Message to agent
        </label>
        <input
          id={formId}
          value={input}
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Try "What needs my approval today?"'
          className="min-h-11 flex-1 min-w-0 rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="flex size-11 shrink-0 items-center justify-center rounded-md bg-ink text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="size-4" strokeWidth={2.2} />
        </button>
      </form>
    </section>
  );
});
