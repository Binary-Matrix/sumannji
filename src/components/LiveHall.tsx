import { useRef, useState } from "react";
import { sfx } from "@/lib/sfx";
import { useScore } from "@/lib/score";

const EMOJIS = ["🙏","🔥","✨","💖","😄","😎","🎉","🌸","🕉","🎵","🥁","🎼","💯","👏","🪔","💐","🌺","☮️","🥰","🙌","🤩","💫","🌟","😇","🤗","🫡","💌","🎊"];

type Msg = { who: string; what: string };

export const LiveHall = ({ visitorName }: { visitorName?: string }) => {
  const { score } = useScore();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [val, setVal] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const unlocked = score >= 100;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim() || !unlocked) return;
    sfx.tap();
    setMsgs((m) => [...m, { who: visitorName || "you", what: val.trim() }]);
    setVal("");
  };

  const insertEmoji = (em: string) => {
    setVal((v) => v + em);
    sfx.blip();
    inputRef.current?.focus();
  };

  return (
    <section id="hall" className="border-t border-border/40 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">07 · live hall</p>
        <h2 className="mt-2 font-display text-6xl sm:text-8xl text-ember">Say hi.</h2>
        <p className="mt-3 text-muted-foreground text-lg">
          One transparent room. Be kind.
          {!unlocked && <span className="ml-2 text-accent">· unlocks at 100 pts (you have {score})</span>}
        </p>

        <div className="relative mt-10 glass-strong tilt-3d rounded-[2rem] p-6 sm:p-12">
          {!unlocked && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-[2rem] backdrop-blur-md bg-background/30">
              <div className="text-center">
                <p className="font-display text-4xl text-ember">🔒 locked</p>
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  reach <span className="text-accent">100 points</span> in the games arena to unlock the hall
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  current score: <span className="text-ember">{score}</span> / 100
                </p>
                <a
                  href="#games"
                  onClick={sfx.click}
                  className="lift-3d mt-4 inline-block rounded-full bg-ember px-5 py-2 font-mono text-xs text-primary-foreground shadow-ember"
                >play games →</a>
              </div>
            </div>
          )}

          <div className={`min-h-[320px] max-h-[440px] space-y-3 overflow-y-auto pr-1 ${!unlocked ? "blur-sm select-none" : ""}`}>
            {msgs.length === 0 && unlocked && (
              <p className="font-script text-2xl text-muted-foreground/70">
                the hall is quiet — be the first to say hi…
              </p>
            )}
            {msgs.map((m, i) => (
              <div key={i} className="glass animate-fade-in flex items-baseline gap-3 rounded-2xl px-4 py-3">
                <span className="font-mono text-xs text-primary">{m.who}</span>
                <span className="text-foreground text-base">{m.what}</span>
              </div>
            ))}
          </div>

          {/* Emoji picker */}
          {emojiOpen && unlocked && (
            <div className="glass mt-3 rounded-2xl p-3">
              <div className="grid grid-cols-7 gap-1 sm:grid-cols-14">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => insertEmoji(em)}
                    className="rounded-lg p-1.5 text-xl transition hover:scale-125 hover:bg-secondary/40"
                  >{em}</button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={send} className="mt-6 flex flex-wrap gap-2 sm:flex-nowrap">
            <button
              type="button"
              onClick={() => { setEmojiOpen((e) => !e); sfx.click(); }}
              disabled={!unlocked}
              className="glass rounded-2xl px-3 py-3 text-xl transition hover:scale-105 disabled:opacity-40"
              aria-label="emojis"
            >😊</button>
            <input
              ref={inputRef}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={unlocked ? "type a message…" : "locked"}
              disabled={!unlocked}
              className="glass flex-1 rounded-2xl px-4 py-3 text-base outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              disabled={!unlocked}
              className="lift-3d rounded-2xl bg-ember px-6 text-sm font-medium text-primary-foreground shadow-ember disabled:opacity-40"
            >send</button>
          </form>
        </div>
      </div>
    </section>
  );
};
