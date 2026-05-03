import { useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";

type Track = { id: string; title: string };

const yt = (url: string): string => {
  const m = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
  return m ? m[1] : url;
};

const calmTracks: Track[] = [
  { id: yt("https://www.youtube.com/watch?v=MXprAR_7Omc"), title: "Calm · 01" },
  { id: yt("https://www.youtube.com/watch?v=LMnJp_dSdnw"), title: "Calm · 02" },
  { id: yt("https://www.youtube.com/watch?v=Qili95kUNQk"), title: "Calm · 03" },
  { id: yt("https://www.youtube.com/watch?v=_65_c-0ubCw"), title: "Calm · 04" },
  { id: yt("https://www.youtube.com/watch?v=txmLqITl1h8"), title: "Calm · 05" },
  { id: yt("https://www.youtube.com/watch?v=RoMAX5oPYwk"), title: "Calm · 06" },
  { id: yt("https://www.youtube.com/watch?v=SOJpE1KMUbo"), title: "Calm · 07" },
  { id: yt("https://www.youtube.com/watch?v=tlkb3cLfaOQ"), title: "Calm · 08" },
  { id: yt("https://www.youtube.com/watch?v=-Y4TYhbP2zc"), title: "Calm · 09" },
];

const waahhTracks: Track[] = [
  { id: yt("https://www.youtube.com/watch?v=0zmIgxfZz0M"), title: "Waahh · 01" },
  { id: yt("https://www.youtube.com/watch?v=yWZ5zQSJ6k8"), title: "Waahh · 02" },
  { id: yt("https://www.youtube.com/watch?v=-BzQVu8EuQ4"), title: "Waahh · 03" },
  { id: yt("https://www.youtube.com/watch?v=cpelb2QNc0k"), title: "Waahh · 04" },
  { id: yt("https://www.youtube.com/watch?v=-YlmnPh-6rE"), title: "Waahh · 05" },
  { id: yt("https://www.youtube.com/watch?v=UX740Wf7OUc"), title: "Waahh · 06" },
];

const Bars = ({ active, mood }: { active: boolean; mood: "calm" | "waahh" }) => {
  const [bars, setBars] = useState<number[]>(() => Array(28).fill(0.2));
  const t = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      t.current += active ? (mood === "waahh" ? 0.16 : 0.08) : 0.02;
      const next = Array.from({ length: 28 }, (_, i) => {
        const base = active ? 0.35 : 0.1;
        const amp = active ? (mood === "waahh" ? 0.65 : 0.45) : 0.08;
        const v = base + Math.abs(Math.sin(t.current + i * 0.45)) * amp * 0.6 + Math.abs(Math.sin(t.current * 1.7 + i * 0.21)) * amp * 0.4;
        return Math.min(1, v);
      });
      setBars(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, mood]);

  return (
    <div className="flex h-32 items-end justify-center gap-1 sm:h-40">
      {bars.map((v, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full transition-[height] duration-75 sm:w-2"
          style={{
            height: `${v * 100}%`,
            background: mood === "calm"
              ? "linear-gradient(180deg, hsl(38 78% 60% / 0.95), hsl(22 88% 58% / 0.4))"
              : "linear-gradient(180deg, hsl(290 90% 70% / 0.95), hsl(22 88% 58% / 0.4))",
          }}
        />
      ))}
    </div>
  );
};

const Disc = ({ playing, label }: { playing: boolean; label: string }) => {
  const grooves = useMemo(() => Array.from({ length: 12 }, (_, i) => 30 + i * 5), []);
  return (
    <div className="relative aspect-square w-full max-w-[420px]">
      <div
        className={`absolute inset-0 rounded-full ${playing ? "animate-spin-disc" : ""}`}
        style={{
          background: "radial-gradient(circle at 50% 50%, hsl(28 22% 12%) 0%, hsl(22 28% 5%) 50%, hsl(28 22% 8%) 100%)",
          boxShadow: "0 30px 60px -10px hsl(0 0% 0% / 0.7), inset 0 0 60px hsl(0 0% 0% / 0.5)",
        }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
          {grooves.map((r, i) => (
            <circle key={i} cx="50" cy="50" r={r} fill="none" stroke="hsl(35 45% 92%)" strokeOpacity={0.04 + (i % 2) * 0.03} strokeWidth="0.2" />
          ))}
          <defs>
            <linearGradient id="glint" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="hsl(38 95% 70% / 0.25)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#glint)" />
          <circle cx="50" cy="50" r="18" fill="hsl(22 88% 58%)" />
          <circle cx="50" cy="50" r="2.2" fill="hsl(28 22% 8%)" />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-[36%] w-[36%] place-items-center rounded-full text-center">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-primary-foreground">SUMAN · DECK</p>
              <p className="mt-1 text-sm font-semibold text-primary-foreground">{label}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -right-2 -top-2 h-2 w-32 origin-left rotate-[35deg] rounded-full bg-gradient-to-r from-primary/80 to-foreground/40 shadow-ember" />
      <div className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-foreground/60 ring-2 ring-primary" />
    </div>
  );
};

const Fader = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center gap-2">
    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
    <div className="relative h-24 w-2 rounded-full bg-secondary">
      <div className="absolute bottom-0 left-0 right-0 rounded-full bg-ember transition-[height] duration-200" style={{ height: `${value * 100}%` }} />
      <div className="absolute left-1/2 h-3 w-6 -translate-x-1/2 -translate-y-1/2 rounded-sm shadow-ember" style={{ bottom: `${value * 100}%`, background: "hsl(var(--primary))" }} />
    </div>
    <p className="text-[10px] font-medium text-ember">{Math.round(value * 100)}</p>
  </div>
);

export const MusicSection = () => {
  const [mood, setMood] = useState<"calm" | "waahh">("calm");
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const list = mood === "calm" ? calmTracks : waahhTracks;
  const cur = list[idx % list.length];

  const [faders, setFaders] = useState({ low: 0.55, mid: 0.45, high: 0.6, vol: 0.7 });
  useEffect(() => {
    let raf = 0; let t = 0;
    const tick = () => {
      t += playing ? 0.06 : 0.02;
      setFaders({
        low: 0.5 + Math.sin(t) * (playing ? 0.25 : 0.05),
        mid: 0.5 + Math.sin(t * 1.4 + 1) * (playing ? 0.3 : 0.05),
        high: 0.55 + Math.sin(t * 2.1 + 2) * (playing ? 0.25 : 0.05),
        vol: 0.7 + Math.sin(t * 0.8) * (playing ? 0.1 : 0.02),
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const swipe = (dir: 1 | -1) => {
    setIdx((i) => (i + dir + list.length) % list.length);
    sfx.tap();
  };

  return (
    <section
      id="music"
      className="border-t border-border/40 px-6 py-24"
      style={{ backgroundImage: mood === "calm" ? "var(--gradient-warm)" : "var(--gradient-party)" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">02 · the deck</p>
            <h2 className="mt-2 text-4xl font-bold sm:text-5xl flex items-center gap-3">
              Sangeet Hall
              <svg viewBox="0 0 32 32" className="h-8 w-8 text-primary/70"><path d="M16 4c-1 0-2 .5-2 1.5v14a4 4 0 104 0V8h6V5c0-.5-.5-1-1-1h-5V5.5c0 .5-.5 1-1 1s-1-.5-1-1z" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="12" cy="23" r="3" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg>
            </h2>
            <p className="mt-2 text-xl text-accent">music for your background experience</p>
          </div>
          <div className="glass flex gap-1 rounded-full p-1">
            {(["calm", "waahh"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMood(m); setIdx(0); sfx.click(); }}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  mood === m ? "bg-ember text-primary-foreground shadow-ember" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "calm" ? "calm · warm" : "waahh · party"}
              </button>
            ))}
          </div>
        </div>

        {/* DJ MIXER */}
        <div className="glass-strong relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <iframe
            key={`${cur.id}-${playing ? "p" : "s"}`}
            className="absolute h-px w-px opacity-0 pointer-events-none"
            src={`https://www.youtube.com/embed/${cur.id}?autoplay=${playing ? 1 : 0}&controls=0&rel=0&playsinline=1`}
            title={cur.title}
            allow="autoplay; encrypted-media"
          />

          <div className="grid gap-8 md:grid-cols-[auto,1fr]">
            <Disc playing={playing} label={cur.title} />
            <div className="flex flex-col justify-between gap-6">
              <div>
                <p className="text-xs font-semibold text-primary">◉ NOW SPINNING</p>
                <p className="mt-2 text-3xl font-bold">{cur.title}</p>
                <p className="text-xs text-muted-foreground">
                  {mood === "calm" ? "warm tone · slow burn" : "party tone · big mood"} · {(idx % list.length) + 1} / {list.length}
                </p>
              </div>
              <Bars active={playing} mood={mood} />
              <div className="glass flex items-end justify-around gap-4 rounded-2xl p-4">
                <Fader label="LOW" value={faders.low} />
                <Fader label="MID" value={faders.mid} />
                <Fader label="HIGH" value={faders.high} />
                <Fader label="VOL" value={faders.vol} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => swipe(-1)} className="glass rounded-full px-4 py-2 text-xs font-medium hover:border-primary/50">← prev</button>
                <button onClick={() => { setPlaying((p) => !p); sfx.pop(); }} className="rounded-full bg-ember px-6 py-2 text-sm font-semibold text-primary-foreground shadow-ember">
                  {playing ? "⏸ pause" : "▶ play"}
                </button>
                <button onClick={() => swipe(1)} className="glass rounded-full px-4 py-2 text-xs font-medium hover:border-primary/50">next →</button>
              </div>
            </div>
          </div>
        </div>

        {/* Track tiles with YouTube thumbnails */}
        <div className="mt-6 -mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
          {list.map((t, i) => (
            <button
              key={t.id}
              onClick={() => { setIdx(i); setPlaying(true); sfx.tap(); }}
              className={`glass group relative shrink-0 overflow-hidden rounded-2xl transition ${
                i === idx ? "ring-2 ring-primary shadow-ember" : "hover:border-primary/40"
              }`}
              style={{ width: 180 }}
              aria-label={t.title}
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${t.id}/mqdefault.jpg`}
                  alt={t.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[11px] font-semibold text-foreground truncate">{t.title}</p>
                </div>
                {i === idx && playing && (
                  <div className="absolute top-2 right-2 flex gap-0.5">
                    {[1,2,3].map(b => (
                      <span key={b} className="w-0.5 rounded-full bg-primary animate-pulse" style={{ height: 8 + b * 3, animationDelay: `${b * 0.15}s` }} />
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
