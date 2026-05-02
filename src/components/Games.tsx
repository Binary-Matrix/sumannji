import { useEffect, useRef, useState } from "react";
import { fireFx } from "./FxLayer";
import { sfx } from "@/lib/sfx";
import { useScore } from "@/lib/score";

const phrases = [
  "suman maharaj ki jai",
  "suman is the greatest",
  "i love you suman",
  "hope you have a great day suman",
  "jaiii suman",
  "maharaj suman ki jaiii",
];

/** Tap-to-play gate — covers any game until tapped. */
const TapToPlay = ({ name, emoji, children }: { name: string; emoji: string; children: React.ReactNode }) => {
  const [started, setStarted] = useState(false);
  if (started) return <>{children}</>;
  return (
    <button
      onClick={() => { setStarted(true); sfx.pop(); }}
      className="glass tilt-3d group relative grid min-h-[220px] w-full place-items-center rounded-xl p-5 text-center transition hover:border-primary/60 hover:shadow-ember"
    >
      <div>
        <div className="text-5xl transition group-hover:scale-110">{emoji}</div>
        <p className="mt-3 font-display text-xl">{name}</p>
        <p className="mt-2 font-space text-[11px] text-primary">▶ TAP TO PLAY</p>
      </div>
    </button>
  );
};

/** ============= 1. Reaction game ============= */
const Reaction = ({ award }: { award: (n: number) => void }) => {
  const [state, setState] = useState<"idle" | "wait" | "go" | "done">("idle");
  const [ms, setMs] = useState<number | null>(null);
  const start = useRef(0);
  const t = useRef<any>(null);

  const begin = () => {
    setState("wait"); setMs(null);
    const wait = 800 + Math.random() * 2200;
    t.current = setTimeout(() => { setState("go"); start.current = performance.now(); }, wait);
  };
  const tap = () => {
    if (state === "wait") { clearTimeout(t.current); setState("idle"); sfx.click(); return; }
    if (state === "go") {
      const r = Math.round(performance.now() - start.current);
      setMs(r); setState("done"); sfx.win();
      const pts = r < 250 ? 10 : r < 400 ? 7 : r < 600 ? 5 : 3;
      award(pts);
    }
  };
  useEffect(() => () => clearTimeout(t.current), []);

  return (
    <div className="glass rounded-xl p-5">
      <p className="font-display text-xl">Reaction</p>
      <p className="font-mono text-[11px] text-muted-foreground">click as fast as you can when it goes orange</p>
      <button
        onClick={state === "idle" || state === "done" ? begin : tap}
        className={`mt-4 h-24 w-full rounded-lg font-display text-2xl transition ${
          state === "go" ? "bg-ember text-primary-foreground shadow-ember"
          : state === "wait" ? "bg-destructive/70 text-foreground"
          : "glass-strong text-foreground"
        }`}
      >
        {state === "idle" ? "start" : state === "wait" ? "wait…" : state === "go" ? "TAP!" : `${ms}ms · play again`}
      </button>
    </div>
  );
};

/** ============= 2. Memory ============= */
const Memory = ({ award }: { award: (n: number) => void }) => {
  const colors = ["bg-red-500/70", "bg-yellow-500/70", "bg-green-500/70", "bg-blue-500/70"];
  const [seq, setSeq] = useState<number[]>([]);
  const [user, setUser] = useState<number[]>([]);
  const [showing, setShowing] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const next = () => {
    const s = [...seq, Math.floor(Math.random() * 4)];
    setSeq(s); setUser([]); setPlaying(true);
    s.forEach((idx, i) => {
      setTimeout(() => { setShowing(idx); sfx.tap(); }, i * 600 + 400);
      setTimeout(() => setShowing(null), i * 600 + 800);
    });
    setTimeout(() => setPlaying(false), s.length * 600 + 600);
  };
  const press = (i: number) => {
    if (playing) return;
    sfx.click();
    const u = [...user, i]; setUser(u);
    if (seq[u.length - 1] !== i) {
      sfx.pop();
      setSeq([]); setUser([]);
      return;
    }
    if (u.length === seq.length) { award(5); setTimeout(next, 600); }
  };

  return (
    <div className="glass rounded-xl p-5">
      <p className="font-display text-xl">Memory</p>
      <p className="font-mono text-[11px] text-muted-foreground">repeat the pattern · +5 each round</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {colors.map((c, i) => (
          <button
            key={i}
            onClick={() => press(i)}
            className={`h-16 rounded-lg ${c} transition ${showing === i ? "scale-105 ring-2 ring-foreground" : "opacity-70"}`}
          />
        ))}
      </div>
      <button
        onClick={() => { setSeq([]); setUser([]); setTimeout(next, 100); }}
        className="mt-3 w-full rounded-lg bg-ember py-2 font-mono text-xs text-primary-foreground shadow-ember"
      >
        {seq.length === 0 ? "start" : `restart · round ${seq.length}`}
      </button>
    </div>
  );
};

/** ============= 3. Note Match ============= */
const NoteMatch = ({ award }: { award: (n: number) => void }) => {
  const notes = ["sa", "re", "ga", "ma", "pa"];
  const [target, setTarget] = useState(notes[0]);
  const newRound = () => setTarget(notes[Math.floor(Math.random() * notes.length)]);
  useEffect(newRound, []);
  return (
    <div className="glass rounded-xl p-5">
      <p className="font-display text-xl">Note Match</p>
      <p className="font-mono text-[11px] text-muted-foreground">tap the matching note</p>
      <p className="mt-3 text-center font-display text-3xl text-ember">{target}</p>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {notes.map((n) => (
          <button
            key={n}
            onClick={() => {
              if (n === target) { sfx.win(); award(4); }
              else sfx.pop();
              newRound();
            }}
            className="glass-strong rounded-lg py-2 font-mono text-xs hover:border-primary/50"
          >{n}</button>
        ))}
      </div>
    </div>
  );
};

/** ============= 4. Word Tap ============= */
const WordTap = ({ award }: { award: (n: number) => void }) => {
  const pool = ["jai", "om", "suman", "guruji", "tabla", "ember", "cocoa", "raga"];
  const [target, setTarget] = useState(pool[0]);
  const [opts, setOpts] = useState<string[]>([]);
  const round = () => {
    const t = pool[Math.floor(Math.random() * pool.length)];
    const others = pool.filter((p) => p !== t).sort(() => 0.5 - Math.random()).slice(0, 3);
    setTarget(t); setOpts([...others, t].sort(() => 0.5 - Math.random()));
  };
  useEffect(round, []);
  return (
    <div className="glass rounded-xl p-5">
      <p className="font-display text-xl">Word Tap</p>
      <p className="font-mono text-[11px] text-muted-foreground">tap the word that matches</p>
      <p className="mt-3 text-center font-display text-2xl text-accent">find: <span className="text-ember">{target}</span></p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => { if (o === target) { sfx.win(); award(3); } else sfx.pop(); round(); }}
            className="glass-strong rounded-lg py-2 font-mono text-sm hover:border-primary/50"
          >{o}</button>
        ))}
      </div>
    </div>
  );
};

/** ============= 5. Mantra Run (click moving target) ============= */
const MantraRun = ({ award }: { award: (n: number) => void }) => {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hits, setHits] = useState(0);
  const move = () => setPos({ x: 5 + Math.random() * 90, y: 5 + Math.random() * 90 });
  return (
    <div className="glass rounded-xl p-5">
      <p className="font-display text-xl">Mantra Run</p>
      <p className="font-mono text-[11px] text-muted-foreground">catch om · +2 each catch</p>
      <div className="relative mt-3 h-40 overflow-hidden rounded-lg border border-border/50 bg-secondary/20">
        <button
          onClick={() => { setHits((h) => h + 1); award(2); sfx.tap(); move(); }}
          className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember text-lg shadow-ember transition-all duration-200"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >🕉</button>
      </div>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">caught: {hits}</p>
    </div>
  );
};

export const Games = () => {
  const { score, add } = useScore();
  const [unlocked, setUnlocked] = useState(false);
  const [phrase] = useState(() => phrases[Math.floor(Math.random() * phrases.length)]);
  const [typed, setTyped] = useState("");
  const [dodged, setDodged] = useState(false);
  const [nudge, setNudge] = useState({ x: 0, y: 0 });

  const onHover = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    setNudge({ x: -dx * 8, y: -dy * 8 });
  };
  const catchIt = () => {
    if (dodged) return;
    sfx.win(); setDodged(true); add(10);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typed.trim().toLowerCase() === phrase.toLowerCase()) {
      sfx.cheer(); fireFx("confetti"); setUnlocked(true); add(20);
    } else sfx.tap();
  };

  return (
    <section id="games" className="border-t border-border/40 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">05 · play to unlock</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">Two gates. One arena.</h2>
          </div>
          <div className="glass rounded-full px-4 py-2 font-mono text-sm">
            score: <span className="text-ember">{score} pts</span>
            <span className="ml-2 text-muted-foreground">· chat unlocks at 100</span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">gate 1 · the gentle dodge</p>
            <div className="relative mt-6 grid h-44 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary/20">
              <button
                onMouseMove={onHover}
                onMouseLeave={() => setNudge({ x: 0, y: 0 })}
                onClick={catchIt}
                className="rounded-full bg-ember px-6 py-3 font-medium text-primary-foreground shadow-ember transition-transform"
                style={{ transform: `translate(${dodged ? 0 : nudge.x}px, ${dodged ? 0 : nudge.y}px)` }}
              >
                {dodged ? "✓ caught (+10)" : "catch me"}
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">gate 2 · phrase captcha</p>
            <p className="mt-4 rounded-lg border border-border bg-secondary/30 px-4 py-3 font-mono text-sm text-accent">"{phrase}"</p>
            <form onSubmit={submit} className="mt-3 flex gap-2">
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="type the phrase exactly…"
                className="flex-1 rounded-lg border border-border bg-background/50 px-3 py-2 font-mono text-sm outline-none focus:border-primary"
                disabled={!dodged || unlocked}
              />
              <button
                type="submit"
                disabled={!dodged || unlocked}
                className="rounded-lg bg-ember px-4 py-2 text-sm font-medium text-primary-foreground shadow-ember disabled:opacity-40"
              >verify</button>
            </form>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              {!dodged ? "catch the dodge first" : unlocked ? "verified ✓ +20 · games unlocked" : "type the phrase"}
            </p>
          </div>
        </div>

        {unlocked && (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            <TapToPlay name="Reaction" emoji="⚡"><Reaction award={add} /></TapToPlay>
            <TapToPlay name="Memory" emoji="🧠"><Memory award={add} /></TapToPlay>
            <TapToPlay name="Note Match" emoji="🎵"><NoteMatch award={add} /></TapToPlay>
            <TapToPlay name="Word Tap" emoji="🔤"><WordTap award={add} /></TapToPlay>
            <TapToPlay name="Mantra Run" emoji="🕉"><MantraRun award={add} /></TapToPlay>
          </div>
        )}
      </div>
    </section>
  );
};
