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

// SVG game icons instead of emojis
const GameIcon = ({ type }: { type: string }) => {
  const icons: Record<string, JSX.Element> = {
    reaction: <svg viewBox="0 0 40 40" className="h-10 w-10"><circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--primary))" strokeWidth="2"/><path d="M20 8v12l8 5" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round"/></svg>,
    memory: <svg viewBox="0 0 40 40" className="h-10 w-10"><rect x="4" y="4" width="14" height="14" rx="2" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5"/><rect x="22" y="4" width="14" height="14" rx="2" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5"/><rect x="4" y="22" width="14" height="14" rx="2" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5"/><rect x="22" y="22" width="14" height="14" rx="2" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5"/></svg>,
    note: <svg viewBox="0 0 40 40" className="h-10 w-10"><path d="M15 32c-3 0-5-2-5-4s2-4 5-4 5 2 5 4-2 4-5 4z" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5"/><line x1="20" y1="28" x2="20" y2="8" stroke="hsl(var(--primary))" strokeWidth="1.5"/><path d="M20 8c4 0 10 2 10 6" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5"/></svg>,
    word: <svg viewBox="0 0 40 40" className="h-10 w-10"><text x="8" y="28" fontSize="20" fontWeight="bold" fill="hsl(var(--primary))" fontFamily="sans-serif">Aa</text></svg>,
    mantra: <svg viewBox="0 0 40 40" className="h-10 w-10"><circle cx="20" cy="20" r="14" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5"/><circle cx="20" cy="20" r="6" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5"/><circle cx="20" cy="20" r="2" fill="hsl(var(--primary))"/></svg>,
  };
  return icons[type] || null;
};

const TapToPlay = ({ name, iconType, children }: { name: string; iconType: string; children: React.ReactNode }) => {
  const [started, setStarted] = useState(false);
  if (started) return <>{children}</>;
  return (
    <button
      onClick={() => { setStarted(true); sfx.pop(); }}
      className="glass group relative grid min-h-[220px] w-full place-items-center rounded-xl p-5 text-center transition hover:border-primary/60 hover:shadow-ember"
    >
      <div>
        <div className="flex justify-center transition group-hover:scale-110"><GameIcon type={iconType} /></div>
        <p className="mt-3 text-xl font-semibold">{name}</p>
        <p className="mt-2 text-[11px] font-semibold text-primary uppercase tracking-wider">▶ TAP TO PLAY</p>
      </div>
    </button>
  );
};

const Reaction = ({ award }: { award: (n: number) => void }) => {
  const [state, setState] = useState<"idle" | "wait" | "go" | "done">("idle");
  const [ms, setMs] = useState<number | null>(null);
  const start = useRef(0);
  const t = useRef<any>(null);

  const begin = () => { setState("wait"); setMs(null); const wait = 800 + Math.random() * 2200; t.current = setTimeout(() => { setState("go"); start.current = performance.now(); }, wait); };
  const tap = () => {
    if (state === "wait") { clearTimeout(t.current); setState("idle"); sfx.click(); return; }
    if (state === "go") { const r = Math.round(performance.now() - start.current); setMs(r); setState("done"); sfx.win(); award(r < 250 ? 10 : r < 400 ? 7 : r < 600 ? 5 : 3); }
  };
  useEffect(() => () => clearTimeout(t.current), []);

  return (
    <div className="glass rounded-xl p-5">
      <p className="text-xl font-semibold">Reaction</p>
      <p className="text-[11px] text-muted-foreground">click when it goes orange</p>
      <button
        onClick={state === "idle" || state === "done" ? begin : tap}
        className={`mt-4 h-24 w-full rounded-lg text-2xl font-bold transition ${state === "go" ? "bg-ember text-primary-foreground shadow-ember" : state === "wait" ? "bg-destructive/70 text-foreground" : "glass-strong text-foreground"}`}
      >{state === "idle" ? "start" : state === "wait" ? "wait…" : state === "go" ? "TAP!" : `${ms}ms · again`}</button>
    </div>
  );
};

const Memory = ({ award }: { award: (n: number) => void }) => {
  const colors = ["bg-red-500/70", "bg-yellow-500/70", "bg-green-500/70", "bg-blue-500/70"];
  const [seq, setSeq] = useState<number[]>([]);
  const [user, setUser] = useState<number[]>([]);
  const [showing, setShowing] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const next = () => {
    const s = [...seq, Math.floor(Math.random() * 4)]; setSeq(s); setUser([]); setPlaying(true);
    s.forEach((idx, i) => { setTimeout(() => { setShowing(idx); sfx.tap(); }, i * 600 + 400); setTimeout(() => setShowing(null), i * 600 + 800); });
    setTimeout(() => setPlaying(false), s.length * 600 + 600);
  };
  const press = (i: number) => {
    if (playing) return; sfx.click(); const u = [...user, i]; setUser(u);
    if (seq[u.length - 1] !== i) { sfx.pop(); setSeq([]); setUser([]); return; }
    if (u.length === seq.length) { award(5); setTimeout(next, 600); }
  };

  return (
    <div className="glass rounded-xl p-5">
      <p className="text-xl font-semibold">Memory</p>
      <p className="text-[11px] text-muted-foreground">repeat the pattern · +5 each round</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {colors.map((c, i) => (
          <button key={i} onClick={() => press(i)} className={`h-16 rounded-lg ${c} transition ${showing === i ? "scale-105 ring-2 ring-foreground" : "opacity-70"}`} />
        ))}
      </div>
      <button onClick={() => { setSeq([]); setUser([]); setTimeout(next, 100); }} className="mt-3 w-full rounded-lg bg-ember py-2 text-xs font-semibold text-primary-foreground shadow-ember">
        {seq.length === 0 ? "start" : `restart · round ${seq.length}`}
      </button>
    </div>
  );
};

const NoteMatch = ({ award }: { award: (n: number) => void }) => {
  const notes = ["sa", "re", "ga", "ma", "pa"];
  const [target, setTarget] = useState(notes[0]);
  const newRound = () => setTarget(notes[Math.floor(Math.random() * notes.length)]);
  useEffect(newRound, []);
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-xl font-semibold">Note Match</p>
      <p className="text-[11px] text-muted-foreground">tap the matching note</p>
      <p className="mt-3 text-center text-3xl font-bold text-ember">{target}</p>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {notes.map((n) => (
          <button key={n} onClick={() => { if (n === target) { sfx.win(); award(4); } else sfx.pop(); newRound(); }} className="glass-strong rounded-lg py-2 text-xs font-medium hover:border-primary/50">{n}</button>
        ))}
      </div>
    </div>
  );
};

const WordTap = ({ award }: { award: (n: number) => void }) => {
  const pool = ["jai", "om", "suman", "guruji", "tabla", "ember", "cocoa", "raga"];
  const [target, setTarget] = useState(pool[0]);
  const [opts, setOpts] = useState<string[]>([]);
  const round = () => { const t = pool[Math.floor(Math.random() * pool.length)]; const others = pool.filter((p) => p !== t).sort(() => 0.5 - Math.random()).slice(0, 3); setTarget(t); setOpts([...others, t].sort(() => 0.5 - Math.random())); };
  useEffect(round, []);
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-xl font-semibold">Word Tap</p>
      <p className="text-[11px] text-muted-foreground">tap the matching word</p>
      <p className="mt-3 text-center text-2xl text-accent">find: <span className="font-bold text-ember">{target}</span></p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {opts.map((o) => (
          <button key={o} onClick={() => { if (o === target) { sfx.win(); award(3); } else sfx.pop(); round(); }} className="glass-strong rounded-lg py-2 text-sm font-medium hover:border-primary/50">{o}</button>
        ))}
      </div>
    </div>
  );
};

const MantraRun = ({ award }: { award: (n: number) => void }) => {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hits, setHits] = useState(0);
  const move = () => setPos({ x: 5 + Math.random() * 90, y: 5 + Math.random() * 90 });
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-xl font-semibold">Mantra Run</p>
      <p className="text-[11px] text-muted-foreground">catch the target · +2 each</p>
      <div className="relative mt-3 h-40 overflow-hidden rounded-lg border border-border/50 bg-secondary/20">
        <button
          onClick={() => { setHits((h) => h + 1); award(2); sfx.tap(); move(); }}
          className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember shadow-ember transition-all duration-200 grid place-items-center"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5"><circle cx="10" cy="10" r="4" fill="hsl(var(--primary-foreground))"/></svg>
        </button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">caught: {hits}</p>
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
  const catchIt = () => { if (dodged) return; sfx.win(); setDodged(true); add(10); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typed.trim().toLowerCase() === phrase.toLowerCase()) { sfx.cheer(); fireFx("confetti"); setUnlocked(true); add(20); } else sfx.tap();
  };

  return (
    <section id="games" className="border-t border-border/40 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">05 · play to unlock</p>
            <h2 className="mt-2 text-4xl font-bold sm:text-5xl">Two gates. One arena.</h2>
          </div>
          <div className="glass rounded-full px-4 py-2 text-sm font-medium">
            score: <span className="text-ember">{score} pts</span>
            <span className="ml-2 text-muted-foreground">· chat unlocks at 100</span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">gate 1 · the gentle dodge</p>
            <div className="relative mt-6 grid h-44 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary/20">
              <button
                onMouseMove={onHover} onMouseLeave={() => setNudge({ x: 0, y: 0 })} onClick={catchIt}
                className="rounded-full bg-ember px-6 py-3 font-semibold text-primary-foreground shadow-ember transition-transform"
                style={{ transform: `translate(${dodged ? 0 : nudge.x}px, ${dodged ? 0 : nudge.y}px)` }}
              >{dodged ? "✓ caught (+10)" : "catch me"}</button>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">gate 2 · phrase captcha</p>
            <p className="mt-4 rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm text-accent">"{phrase}"</p>
            <form onSubmit={submit} className="mt-3 flex gap-2">
              <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="type the phrase exactly…" className="flex-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary" disabled={!dodged || unlocked} />
              <button type="submit" disabled={!dodged || unlocked} className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-primary-foreground shadow-ember disabled:opacity-40">verify</button>
            </form>
            <p className="mt-3 text-[11px] text-muted-foreground">
              {!dodged ? "catch the dodge first" : unlocked ? "verified ✓ +20 · games unlocked" : "type the phrase"}
            </p>
          </div>
        </div>

        {unlocked && (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            <TapToPlay name="Reaction" iconType="reaction"><Reaction award={add} /></TapToPlay>
            <TapToPlay name="Memory" iconType="memory"><Memory award={add} /></TapToPlay>
            <TapToPlay name="Note Match" iconType="note"><NoteMatch award={add} /></TapToPlay>
            <TapToPlay name="Word Tap" iconType="word"><WordTap award={add} /></TapToPlay>
            <TapToPlay name="Mantra Run" iconType="mantra"><MantraRun award={add} /></TapToPlay>
          </div>
        )}
      </div>
    </section>
  );
};
