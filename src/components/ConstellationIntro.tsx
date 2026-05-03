import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { sfx } from "@/lib/sfx";
import { fireFx } from "./FxLayer";

export type CursorStyle = "ember" | "comet" | "ring" | "crosshair";

const CURSOR_OPTIONS: { id: CursorStyle; label: string; icon: JSX.Element }[] = [
  {
    id: "ember",
    label: "circle",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "crosshair",
    label: "crosshair",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1" />
        <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1" />
        <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" />
      </svg>
    ),
  },
  {
    id: "ring",
    label: "arrow",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path d="M5 3l14 9-14 9V3z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "comet",
    label: "default",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path d="M4 4l7 17 2-7 7-2L4 4z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export const ConstellationIntro = ({
  onDone,
}: {
  onDone: (name: string, cursor: CursorStyle) => void;
}) => {
  const [name, setName] = useState("");
  const [cursor, setCursor] = useState<CursorStyle>("ember");
  const [phase, setPhase] = useState<"entry" | "welcome" | "exit">("entry");
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [opacity, setOpacity] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const stars = useMemo(
    () =>
      Array.from({ length: 120 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
      })),
    []
  );

  // Canvas-based constellation for smoothness
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth * window.devicePixelRatio;
      h = canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw connections near cursor
      for (let i = 0; i < stars.length; i++) {
        const si = stars[i];
        const dCi = Math.hypot(si.x - mx, si.y - my);
        if (dCi > 0.2) continue;
        for (let j = i + 1; j < stars.length; j++) {
          const sj = stars[j];
          const dCj = Math.hypot(sj.x - mx, sj.y - my);
          if (dCj > 0.2) continue;
          const d = Math.hypot(si.x - sj.x, si.y - sj.y);
          if (d < 0.12) {
            const avg = (dCi + dCj) / 2;
            const alpha = (1 - avg / 0.2) * 0.35;
            ctx.beginPath();
            ctx.moveTo(si.x * w, si.y * h);
            ctx.lineTo(sj.x * w, sj.y * h);
            ctx.strokeStyle = `hsla(22, 88%, 58%, ${alpha})`;
            ctx.lineWidth = 0.5 * window.devicePixelRatio;
            ctx.stroke();
          }
        }
      }

      // Draw stars
      for (const s of stars) {
        const dist = Math.hypot(s.x - mx, s.y - my);
        const glow = Math.max(0, 1 - dist * 4);
        const twinkle = 0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase);
        const baseAlpha = 0.08 + twinkle * 0.12 + glow * 0.6;
        const r = (s.r * 0.8 + glow * 1.2) * window.devicePixelRatio;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(35, 45%, 92%, ${baseAlpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [stars]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const mx = e.clientX / window.innerWidth;
      const my = e.clientY / window.innerHeight;
      mouseRef.current = { x: mx, y: my };
      setMouse({ x: mx, y: my });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const tiltX = (mouse.x - 0.5) * 24;
  const tiltY = (mouse.y - 0.5) * -18;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      sfx.click();
      setPhase("welcome");

      // After welcome animation, exit
      setTimeout(() => {
        sfx.sparkle();
        fireFx("flowers");
      }, 400);
      setTimeout(() => {
        setPhase("exit");
        setOpacity(0);
      }, 2400);
      setTimeout(() => {
        onDone(name.trim(), cursor);
      }, 3200);
    },
    [name, cursor, onDone]
  );

  if (phase === "exit" && opacity <= 0) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "hsl(28 22% 8%)",
        opacity,
        transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        {phase === "entry" && (
          <div
            className="flex flex-col items-center gap-10"
            style={{
              animation: "introFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            {/* Terminal-style cursor picker */}
            <div className="font-mono text-xs text-muted-foreground/70 tracking-wider">
              <span className="text-primary/60">$</span> select cursor
            </div>
            <div className="flex gap-2">
              {CURSOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCursor(c.id);
                    sfx.blip();
                  }}
                  className={`group flex flex-col items-center gap-1.5 rounded-lg px-3.5 py-2.5 transition-all duration-300 ${
                    cursor === c.id
                      ? "bg-primary/8 text-foreground ring-1 ring-primary/30 shadow-[0_0_20px_-8px_hsl(22_88%_58%/0.3)]"
                      : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/30"
                  }`}
                >
                  <div className={`transition-transform duration-300 ${cursor === c.id ? "scale-110" : "group-hover:scale-105"}`}>
                    {c.icon}
                  </div>
                  <span className="text-[9px] font-mono tracking-widest uppercase opacity-70">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Name input — terminal style */}
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="text-primary/60">›</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="your name"
                  className="w-48 border-none bg-transparent text-center text-foreground outline-none placeholder:text-muted-foreground/30 caret-primary"
                  style={{ caretColor: "hsl(22 88% 58%)" }}
                />
              </div>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
              <button
                type="submit"
                disabled={!name.trim()}
                className="group relative rounded-full px-8 py-2.5 text-xs font-medium tracking-wider uppercase transition-all duration-500 disabled:opacity-0 disabled:translate-y-2"
                style={{
                  background: name.trim()
                    ? "linear-gradient(135deg, hsl(22 88% 58%), hsl(38 95% 62%))"
                    : "transparent",
                  boxShadow: name.trim()
                    ? "0 8px 32px -8px hsl(22 88% 58% / 0.5)"
                    : "none",
                  color: name.trim() ? "hsl(28 22% 8%)" : "transparent",
                }}
              >
                <span className="relative z-10">enter</span>
                <div className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "linear-gradient(135deg, hsl(22 88% 62%), hsl(38 95% 66%))" }}
                />
              </button>
            </form>
          </div>
        )}

        {(phase === "welcome" || phase === "exit") && (
          <h1
            className="text-5xl font-bold sm:text-7xl lg:text-8xl select-none"
            style={{
              transform: `perspective(900px) rotateY(${tiltX}deg) rotateX(${tiltY}deg) translateZ(0)`,
              transition: "transform 0.08s linear",
              textShadow: `0 0 60px hsl(22 88% 58% / 0.3), 0 20px 60px hsl(0 0% 0% / 0.5)`,
              animation: "welcomeReveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              willChange: "transform",
            }}
          >
            welcome,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(22 88% 58%), hsl(38 95% 62%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {name.trim()}
            </span>
          </h1>
        )}
      </div>
    </div>
  );
};
