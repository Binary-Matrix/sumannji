import { useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";
import { fireFx } from "./FxLayer";

/**
 * Spaceship cockpit intro:
 *  step 1 — pick a cursor style + enter name
 *  step 2 — big constellation orb · touch dots to draw lines, hold center to launch
 *  step 3 — warp + welcome with confetti + flowers
 */

export type CursorStyle = "ember" | "comet" | "ring" | "crosshair";

const CURSOR_OPTIONS: { id: CursorStyle; label: string; emoji: string; tag: string }[] = [
  { id: "ember",     label: "Ember",     emoji: "🔥", tag: "warm dot + sparks" },
  { id: "comet",     label: "Comet",     emoji: "☄️", tag: "tail trail" },
  { id: "ring",      label: "Ring",      emoji: "⭕", tag: "minimal halo" },
  { id: "crosshair", label: "Crosshair", emoji: "✛",  tag: "pilot mode" },
];

export const ConstellationIntro = ({
  onDone,
}: {
  onDone: (name: string, cursor: CursorStyle) => void;
}) => {
  const [name, setName] = useState("");
  const [cursor, setCursor] = useState<CursorStyle>("ember");
  const [step, setStep] = useState<"prep" | "orb" | "warp" | "welcome" | "gone">("prep");
  const [progress, setProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [touched, setTouched] = useState<Set<number>>(new Set());
  const [holding, setHolding] = useState(false);
  const holdRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // BIG dense constellation
  const stars = useMemo(
    () =>
      Array.from({ length: 220 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.6 + Math.random() * 2.2,
        d: Math.random() * 2.5,
      })),
    []
  );

  // Warp starfield (radiating from center) — used in warp step
  const warpStars = useMemo(
    () =>
      Array.from({ length: 80 }, () => {
        const a = Math.random() * Math.PI * 2;
        const r = 80 + Math.random() * 900;
        return {
          sx: Math.cos(a) * r,
          sy: Math.sin(a) * r,
          delay: Math.random() * 1.4,
        };
      }),
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) =>
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // touching dots draws connections — hover detection in svg via per-circle check
  const onStarHover = (i: number) => {
    if (step !== "orb") return;
    setTouched((t) => {
      if (t.has(i)) return t;
      const next = new Set(t); next.add(i);
      sfx.blip();
      return next;
    });
  };

  const startHold = () => {
    if (step !== "orb" || holding) return;
    setHolding(true);
    startRef.current = performance.now();
    sfx.spaceship();
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 2200;
      const p = Math.min(elapsed, 1);
      setProgress(p);
      if (p < 1) {
        if (Math.random() < 0.08) sfx.blip();
        holdRef.current = requestAnimationFrame(tick);
      } else {
        sfx.sparkle();
        setStep("warp");
        setHolding(false);
        // warp 1.4s → welcome 2.6s → done
        setTimeout(() => {
          setStep("welcome");
          fireFx("confetti");
          setTimeout(() => fireFx("flowers"), 250);
          setTimeout(() => {
            setStep("gone");
            onDone(name.trim() || "friend", cursor);
          }, 2800);
        }, 1400);
      }
    };
    holdRef.current = requestAnimationFrame(tick);
  };

  const cancelHold = () => {
    if (!holding) return;
    if (holdRef.current) cancelAnimationFrame(holdRef.current);
    setHolding(false);
    setProgress(0);
  };

  if (step === "gone") return null;

  // Lines: nearest neighbours; touched dots have brighter, fuller links.
  const lines: Array<{ a: number; b: number; opacity: number }> = [];
  if (step === "orb") {
    const maxDist = 0.16;
    for (let i = 0; i < stars.length; i++) {
      const dists = stars
        .map((s, j) => ({ j, d: Math.hypot(stars[i].x - s.x, stars[i].y - s.y) }))
        .filter((x) => x.j !== i && x.d < maxDist)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      for (const n of dists) {
        if (n.j < i) continue;
        const mid = { x: (stars[i].x + stars[n.j].x) / 2, y: (stars[i].y + stars[n.j].y) / 2 };
        const cursorBoost = 1 - Math.min(1, Math.hypot(mid.x - mouse.x, mid.y - mouse.y) * 2.5);
        const touchedBoost = touched.has(i) || touched.has(n.j) ? 0.8 : 0;
        lines.push({ a: i, b: n.j, opacity: 0.06 + cursorBoost * 0.45 + touchedBoost });
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-cocoa overflow-hidden">
      {/* Spaceship HUD frame */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-4 rounded-3xl border border-primary/20" />
        <div className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.3em] text-primary/70">
          ◉ deck · suman.spaceship · v1.4
        </div>
        <div className="absolute right-6 top-6 font-mono text-[10px] uppercase tracking-[0.3em] text-primary/70">
          coordinates {Math.round(mouse.x * 100)}·{Math.round(mouse.y * 100)}
        </div>
      </div>

      {/* Big constellation field (always visible behind orb) */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        onMouseLeave={() => {/* keep touched */}}
      >
        {lines.map((l, k) => {
          const sa = stars[l.a], sb = stars[l.b];
          return (
            <line
              key={k}
              x1={sa.x * 100} y1={sa.y * 100}
              x2={sb.x * 100} y2={sb.y * 100}
              stroke="hsl(var(--primary))"
              strokeWidth={0.1}
              opacity={l.opacity}
            />
          );
        })}
        {stars.map((s, i) => {
          const t = touched.has(i);
          return (
            <circle
              key={i}
              cx={s.x * 100}
              cy={s.y * 100}
              r={s.r * (t ? 0.55 : 0.28) + progress * 0.25}
              fill={t ? "hsl(var(--primary))" : "hsl(var(--accent))"}
              opacity={0.55 + progress * 0.4 + (t ? 0.3 : 0)}
              className="animate-twinkle"
              style={{ animationDelay: `${s.d}s` }}
              onMouseEnter={() => onStarHover(i)}
            />
          );
        })}
      </svg>

      {/* Warp tunnel */}
      {step === "warp" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          {warpStars.map((s, i) => (
            <span
              key={i}
              className="warp-star"
              style={{
                left: "50%", top: "50%",
                ["--sx" as any]: `${s.sx}px`,
                ["--sy" as any]: `${s.sy}px`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
          <p className="font-space text-2xl text-ember animate-vibrate">ENTERING HYPERSPACE</p>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {step === "prep" && (
          <div className="animate-fade-up flex flex-col items-center gap-6">
            <p className="font-space text-xs text-primary">◉ MISSION BRIEFING</p>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground">
              Welcome aboard, traveller.
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Pick a cursor for your journey, then tell me your name.
            </p>

            {/* Cursor picker */}
            <div className="grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
              {CURSOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCursor(c.id); sfx.blip(); }}
                  className={`glass lift-3d rounded-xl p-3 text-center transition ${
                    cursor === c.id ? "ring-2 ring-primary shadow-ember" : "hover:border-primary/40"
                  }`}
                >
                  <div className="text-2xl">{c.emoji}</div>
                  <p className="mt-1 font-space text-[10px]">{c.label}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">{c.tag}</p>
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); if (name.trim()) { sfx.click(); setStep("orb"); } }}
              className="flex flex-col items-center gap-3 sm:flex-row"
            >
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="captain's name…"
                className="glass-strong w-72 rounded-full px-5 py-3 text-center font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="lift-3d rounded-full bg-ember px-6 py-3 font-medium text-primary-foreground shadow-ember transition hover:scale-105 disabled:opacity-40"
              >
                board ship →
              </button>
            </form>
          </div>
        )}

        {step === "orb" && (
          <div className="animate-fade-up flex flex-col items-center gap-6">
            <p className="font-space text-xs text-primary">◉ TOUCH THE STARS · HOLD TO LAUNCH</p>
            <button
              onMouseDown={startHold}
              onTouchStart={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchEnd={cancelHold}
              className={`relative h-44 w-44 rounded-full glass-strong transition lift-3d ${
                holding ? "animate-vibrate scale-105 shadow-ember" : "hover:scale-105"
              }`}
              aria-label="Hold to launch"
            >
              <span className="absolute inset-3 rounded-full bg-ember opacity-90" />
              <span className="relative font-space text-3xl text-primary-foreground">SN</span>
              {holding && (
                <svg className="absolute inset-0" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="46"
                    fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5"
                    strokeDasharray={`${progress * 289} 289`}
                    transform="rotate(-90 50 50)"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
            <p className="font-mono text-[11px] text-muted-foreground/80">
              hello <span className="font-script text-2xl text-ember align-middle">{name}</span> — touch the constellation, then hold the orb
            </p>
            <p className="font-mono text-[10px] text-primary/70">
              stars touched: {touched.size}
            </p>
          </div>
        )}

        {step === "welcome" && (
          <div className="space-y-3">
            <p className="font-space text-xs text-accent animate-fade-up">◉ WELCOME ABOARD</p>
            <h1
              className="font-fancy text-6xl sm:text-8xl text-ember animate-hue"
              style={{ animation: "nameFade 2.8s ease-in-out forwards" }}
            >
              {name.trim() || "friend"}
            </h1>
            <p className="font-script text-3xl text-accent">welcome to suman's universe</p>
          </div>
        )}
      </div>
    </div>
  );
};
