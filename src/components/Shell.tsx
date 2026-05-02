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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${PUB_KEY}` },
      body: JSON.stringify({ messages }),
    });
    if (resp.status === 429) return onError("⏱️ slow down — too many requests.");
    if (resp.status === 402) return onError("💳 AI credits exhausted.");
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

const VoiceButton = ({ onTranscript, disabled }: { onTranscript: (text: string) => void; disabled: boolean }) => {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggle = async () => {
    if (recording && mediaRef.current) {
      mediaRef.current.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        // For now, we indicate voice was recorded as text
        onTranscript("[voice message recorded]");
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
      sfx.click();
    } catch {
      // Mic not available
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`rounded-full px-3 py-1.5 transition disabled:opacity-40 ${recording ? "bg-destructive/70 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      title={recording ? "Stop recording" : "Voice message"}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4">
        {recording ? (
          <rect x="5" y="5" width="10" height="10" rx="2" fill="currentColor" />
        ) : (
          <>
            <rect x="7" y="2" width="6" height="10" rx="3" fill="currentColor" />
            <path d="M5 9a7 7 0 0014 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="12" y1="16" x2="12" y2="18" stroke="currentColor" strokeWidth="1.5" />
          </>
        )}
      </svg>
    </button>
  );
};

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

  const handleVoice = (text: string) => {
    setInput(text);
  };

  return (
    <>
      <section id="shell" className="border-t border-border/40 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">01 · parth</p>
          <h2 className="mt-2 text-4xl font-bold sm:text-5xl">Talk to the system.</h2>
          <p className="mt-3 text-muted-foreground">Parth is your helper — ask anything about Suman.</p>
          <button
            onClick={() => { setOpen(true); sfx.pop(); }}
            className="mt-6 rounded-full bg-ember px-6 py-3 font-semibold text-primary-foreground shadow-ember transition hover:scale-105"
          >
            ✨ Talk with Parth
          </button>
        </div>
      </section>

      {!open && (
        <button
          onClick={() => { setOpen(true); sfx.pop(); }}
          className="glass-strong fixed bottom-6 right-6 z-[120] grid h-14 w-14 place-items-center rounded-full text-xl font-bold shadow-ember transition hover:scale-110"
          aria-label="open parth"
          title="Talk with Parth"
        >P</button>
      )}

      {open && (
        <div className="fixed inset-0 z-[130] flex items-end justify-end p-4 sm:items-center sm:justify-end sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="glass-strong relative z-10 flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ember text-sm font-bold text-primary-foreground shadow-ember">P</span>
                <div>
                  <p className="text-base font-semibold">Parth</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full neon-dot align-middle" />
                    online · at your service
                  </p>
                </div>
              </div>
              <button
                onClick={() => { sfx.click(); setOpen(false); }}
                className="glass rounded-full px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
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
              <div className="glass flex items-center gap-1 rounded-full p-1.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="ask Parth anything…"
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm outline-none"
                />
                <VoiceButton onTranscript={handleVoice} disabled={busy} />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="rounded-full bg-ember px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-ember disabled:opacity-40"
                >{busy ? "…" : "send"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
