import { useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";
import { fireFx } from "./FxLayer";

export type CursorStyle = "ember" | "comet" | "ring" | "crosshair";

const CURSOR_OPTIONS: { id: CursorStyle; label: string; icon: JSX.Element }[] = [
  {
    id: "ember",
    label: "Circle",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>,
  },
  {
    id: "crosshair",
    label: "Crosshair",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6"><line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" /><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1" /></svg>,
  },
  {
    id: "ring",
    label: "Arrow",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6"><path d="M5 3l14 9-14 9V3z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  },
  {
    id: "comet",
    label: "Normal",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6"><path d="M4 4l7 17 2-7 7-2L4 4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  },
];

export const ConstellationIntro = ({
  onDone,
}: {
  onDone: (name: string, cursor: CursorStyle) => void;
}) => {
  const [name, setName] = useState("");
  const [cursor, setCursor] = useState<CursorStyle>("ember");
  const [step, setStep] = useState<"prep" | "hold" | "welcome" | "gone">("prep");
  const [progress, setProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [holding, setHolding] = useState(false);
  const holdRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const stars = useMemo(
    () =>
      Array.from({ length: 100 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.3 + Math.random() * 0.7,
        d: Math.random() * 3,
      })),
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const mx = e.clientX / window.innerWidth;
      const my = e.clientY / window.innerHeight;
      setMouse({ x: mx, y: my });
      // 3D tilt for welcome text
      setTilt({
        x: (mx - 0.5) * 20,
        y: (my - 0.5) * -15,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Constellation lines — connect near cursor, thin elegant lines
  const lines: Array<{ a: number; b: number; opacity: number }> = [];
  const maxDist = 0.13;
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const d = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
      if (d < maxDist) {
        const mid = { x: (stars[i].x + stars[j].x) / 2, y: (stars[i].y + stars[j].y) / 2 };
        const cursorDist = Math.hypot(mid.x - mouse.x, mid.y - mouse.y);
        const cursorBoost = 1 - Math.min(1, cursorDist * 3.5);
        if (cursorBoost > 0) {
          lines.push({ a: i, b: j, opacity: 0.02 + cursorBoost * 0.4 });
        }
      }
    }
  }

  const startHold = () => {
    if (step !== "hold" || holding) return;
    setHolding(true);
    startRef.current = performance.now();
    sfx.spaceship();
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 2000;
      const p = Math.min(elapsed, 1);
      setProgress(p);
      if (p < 1) {
        holdRef.current = requestAnimationFrame(tick);
      } else {
        sfx.sparkle();
        setStep("welcome");
        setHolding(false);
        setTimeout(() => fireFx("flowers"), 300);
        setTimeout(() => {
          setStep("gone");
          onDone(name.trim() || "friend", cursor);
        }, 2800);
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

  const goToHold = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      sfx.click();
      setStep("hold");
    }
  };

  if (step === "gone") return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background overflow-hidden">
      {/* Constellation — thin lines connecting near cursor */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {lines.map((l, k) => {
          const sa = stars[l.a], sb = stars[l.b];
          return (
            <line
              key={k}
              x1={sa.x * 100} y1={sa.y * 100}
              x2={sb.x * 100} y2={sb.y * 100}
              stroke="hsl(var(--primary))"
              strokeWidth={0.05}
              opacity={l.opacity}
            />
          );
        })}
        {stars.map((s, i) => {
          const dist = Math.hypot(s.x - mouse.x, s.y - mouse.y);
          const glow = 1 - Math.min(1, dist * 3);
          return (
            <circle
              key={i}
              cx={s.x * 100}
              cy={s.y * 100}
              r={s.r * 0.18 + (glow > 0 ? glow * 0.12 : 0)}
              fill="hsl(var(--foreground))"
              opacity={0.2 + (glow > 0 ? glow * 0.6 : 0)}
              className="animate-twinkle"
              style={{ animationDelay: `${s.d}s` }}
            />
          );
        })}
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {step === "prep" && (
          <div className="animate-fade-up flex flex-col items-center gap-8">
            <div className="flex gap-3">
              {CURSOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCursor(c.id); sfx.blip(); }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-4 py-3 transition ${
                    cursor === c.id
                      ? "bg-primary/10 text-foreground ring-1 ring-primary/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.icon}
                  <span className="text-[10px] font-medium tracking-wider uppercase">{c.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={goToHold} className="flex flex-col items-center gap-4">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your name"
                className="w-64 border-b border-border bg-transparent px-2 py-3 text-center text-lg font-medium text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary"
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="rounded-full bg-ember px-8 py-3 text-sm font-semibold text-primary-foreground shadow-ember transition hover:scale-105 disabled:opacity-30"
              >
                enter
              </button>
            </form>
          </div>
        )}

        {step === "hold" && (
          <div className="animate-fade-up flex flex-col items-center gap-6">
            {/* 3D hovering welcome text */}
            <h1
              className="text-5xl font-bold text-foreground sm:text-7xl transition-transform duration-100"
              style={{
                transform: `perspective(800px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                textShadow: "0 10px 30px hsl(0 0% 0% / 0.4)",
              }}
            >
              welcome, <span className="text-ember">{name.trim() || "friend"}</span>
            </h1>
            <p className="text-sm text-muted-foreground tracking-wide">hold to enter</p>
            <button
              onMouseDown={startHold}
              onTouchStart={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchEnd={cancelHold}
              className={`relative h-28 w-28 rounded-full transition ${
                holding ? "scale-105" : "hover:scale-105"
              }`}
              aria-label="Hold to enter"
            >
              <span className="absolute inset-0 rounded-full bg-ember opacity-80" />
              <span className="relative text-2xl font-bold text-primary-foreground">SN</span>
              <svg className="absolute inset-0" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.2" />
                {progress > 0 && (
                  <circle
                    cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--primary))" strokeWidth="2"
                    strokeDasharray={`${progress * 301.6} 301.6`} transform="rotate(-90 50 50)" strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        )}

        {step === "welcome" && (
          <h1
            className="text-5xl font-bold sm:text-8xl transition-transform duration-100"
            style={{
              transform: `perspective(800px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
              textShadow: "0 12px 40px hsl(0 0% 0% / 0.5)",
              animation: "nameFade 2.8s ease-in-out forwards",
            }}
          >
            welcome, <span className="text-ember">{name.trim() || "friend"}</span>
          </h1>
        )}
      </div>
    </div>
  );
};
