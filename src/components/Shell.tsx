import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const PUB_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function streamChat({
  messages, onDelta, onDone, onError,
}: { messages: Msg[]; onDelta: (s: string) => void; onDone: () => void; onError: (e: string) => void }) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PUB_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });
    if (resp.status === 429) return onError("⏱️ slow down — too many requests. try again in a moment.");
    if (resp.status === 402) return onError("💳 AI credits exhausted. ask Suman to top up.");
    if (!resp.ok || !resp.body) return onError("⚠️ chat failed to start.");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let done = false;
    while (!done) {
      const { done: d, value } = await reader.read();
      if (d) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n")) !== -1) {
        let line = buf.slice(0, idx);
        buf = buf.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { done = true; break; }
        try {
          const p = JSON.parse(json);
          const c = p.choices?.[0]?.delta?.content as string | undefined;
          if (c) onDelta(c);
        } catch {
          buf = line + "\n" + buf;
          break;
        }
      }
    }
    onDone();
  } catch (e: any) {
    onError(e?.message || "network error");
  }
}

export const Shell = ({ visitorName }: { visitorName?: string }) => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: `Namaste${visitorName ? `, ${visitorName}` : ""} 🙏 I'm **Parth** — at your service, boss. Ask me anything about Suman.` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  // open via hash navigation #shell
  useEffect(() => {
    const onHash = () => { if (window.location.hash === "#shell") setOpen(true); };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sfx.click();
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next); setInput(""); setBusy(true);

    let acc = "";
    setMsgs((m) => [...m, { role: "assistant", content: "" }]);
    await streamChat({
      messages: next,
      onDelta: (chunk) => {
        acc += chunk;
        setMsgs((m) => m.map((x, i) => (i === m.length - 1 && x.role === "assistant" ? { ...x, content: acc } : x)));
      },
      onDone: () => { setBusy(false); sfx.tap(); },
      onError: (err) => {
        setMsgs((m) => m.map((x, i) => (i === m.length - 1 && x.role === "assistant" ? { ...x, content: err } : x)));
        setBusy(false);
      },
    });
  };

  return (
    <>
      {/* Floating tab / launcher anchor — Hero links to #shell to open */}
      <section id="shell" className="border-t border-border/40 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">01 · parth</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl">Talk to the system.</h2>
          <p className="mt-3 text-muted-foreground">Parth is your helper in this site if you want to know anything about me.</p>
          <button
            onClick={() => { setOpen(true); sfx.pop(); }}
            className="mt-6 lift-3d rounded-full bg-ember px-6 py-3 font-medium text-primary-foreground shadow-ember transition hover:scale-105"
          >
            ✨ Talk with Parth
          </button>
        </div>
      </section>

      {/* Persistent floating launcher button — hovers everywhere on the page */}
      {!open && (
        <button
          onClick={() => { setOpen(true); sfx.pop(); }}
          className="glass-strong fixed bottom-6 right-6 z-[120] grid h-14 w-14 place-items-center rounded-full text-xl font-space shadow-ember transition hover:scale-110"
          aria-label="open parth"
          title="Talk with Parth"
        >P</button>
      )}

      {/* Floating chat panel */}
      {open && (
        <div className="fixed inset-0 z-[130] flex items-end justify-end p-4 sm:items-center sm:justify-end sm:p-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="glass-strong relative z-10 flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ember font-space text-sm text-primary-foreground shadow-ember">P</span>
                <div>
                  <p className="font-display text-base">Parth</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full neon-dot align-middle" />
                    online · at your service
                  </p>
                </div>
              </div>
              <button
                onClick={() => { sfx.click(); setOpen(false); }}
                className="glass rounded-full px-3 py-1 font-mono text-xs text-muted-foreground hover:text-foreground"
              >close ✕</button>
            </div>

            <div ref={scroll} className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-ember text-primary-foreground"
                      : "glass text-foreground"
                  }`}
                >
                  {m.content || (busy && i === msgs.length - 1 ? "…" : "")}
                </div>
              ))}
            </div>

            <form onSubmit={send} className="border-t border-border/40 p-3">
              <div className="glass flex items-center gap-2 rounded-full p-1.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="ask Parth anything…"
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="rounded-full bg-ember px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-ember disabled:opacity-40"
                >{busy ? "…" : "send"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
