import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Bot, User as UserIcon, Crown } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/ai")({
  head: () => ({ meta: [{ title: "AI Coach — FinFlow" }] }),
  component: AIChat,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Mera ₹50k salary hai, kaise invest karu?",
  "80C me ₹1.5L kaise bachau tax?",
  "SIP vs FD — kya better hai?",
  "Mere subscriptions check karo, kya cancel karu?",
  "Old vs New tax regime — mere liye kya?",
  "Emergency fund kitna hona chahiye?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

function AIChat() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/auth" });
  }, [user, authLoading, nav]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (resp.status === 429) {
        toast.error("Bahut requests! Thoda ruk ke try karo.");
        setStreaming(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits khatam. Workspace me top-up karo.");
        setStreaming(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        toast.error("AI ne respond nahi kiya, try again.");
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error. Phir se try karo.");
    } finally {
      setStreaming(false);
    }
  }

  if (authLoading || !user) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-2 flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-160px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-full bg-primary/15 grid place-items-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">FinFlow AI Coach</div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online · Hinglish support
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] text-amber-500 font-medium">
            <Crown className="size-3" />
            PRO
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card/30 p-3 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-6">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 grid place-items-center">
                <Sparkles className="size-6 text-primary" />
              </div>
              <div>
                <div className="text-base font-semibold">Tumhara personal AI CA</div>
                <div className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Tax, SIP, savings, subscriptions — kuch bhi pucho. Hinglish me jawab milega.
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full max-w-md mt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-xs px-3 py-2.5 rounded-xl border border-border bg-background/50 hover:border-primary/50 active:scale-[0.98] transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="size-7 shrink-0 rounded-full bg-primary/15 grid place-items-center">
                      <Bot className="size-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-secondary-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.content || (streaming && i === messages.length - 1 ? "..." : "")}
                  </div>
                  {m.role === "user" && (
                    <div className="size-7 shrink-0 rounded-full bg-secondary grid place-items-center">
                      <UserIcon className="size-3.5" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {streaming && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-2 items-center text-xs text-muted-foreground">
              <div className="size-7 rounded-full bg-primary/15 grid place-items-center">
                <Bot className="size-3.5 text-primary" />
              </div>
              <div className="flex gap-1">
                <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pucho kuch bhi finance ke baare me..."
            className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
            disabled={streaming}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="size-11 rounded-full bg-primary text-primary-foreground grid place-items-center disabled:opacity-50 active:scale-95 transition"
          >
            {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
