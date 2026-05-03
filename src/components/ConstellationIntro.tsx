import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { sfx } from "@/lib/sfx";
import { fireFx } from "./FxLayer";

export type CursorStyle = "ember" | "comet" | "ring" | "crosshair";

const CURSOR_OPTIONS: { id: CursorStyle; label: string; icon: JSX.Element }[] = [
  {
    id: "comet",
    label: "default",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path d="M4 4l7 17 2-7 7-2L4 4z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "ember",
    label: "circle",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4">
        <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: "crosshair",
    label: "crosshair",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "ring",
    label: "cross",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1.2" />
        <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.2" />
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
  const [phase, setPhase] = useState<"cursor" | "name" | "welcome" | "exit">("cursor");
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [opacity, setOpacity] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const stars = useMemo(
    () =>
      Array.from({ length: 100 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
      })),
    []
  );

  // Canvas constellation
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
        if (dCi > 0.22) continue;
        for (let j = i + 1; j < stars.length; j++) {
          const sj = stars[j];
          const dCj = Math.hypot(sj.x - mx, sj.y - my);
          if (dCj > 0.22) continue;
          const d = Math.hypot(si.x - sj.x, si.y - sj.y);
          if (d < 0.14) {
            const avg = (dCi + dCj) / 2;
            const alpha = (1 - avg / 0.22) * 0.4;
            ctx.beginPath();
            ctx.moveTo(si.x * w, si.y * h);
            ctx.lineTo(sj.x * w, sj.y * h);
            ctx.strokeStyle = `hsla(22, 88%, 58%, ${alpha})`;
            ctx.lineWidth = 0.5 * window.devicePixelRatio;
            ctx.stroke();
          }
        }
      }

      // Draw stars with base visibility
      for (const s of stars) {
        const dist = Math.hypot(s.x - mx, s.y - my);
        const glow = Math.max(0, 1 - dist * 4);
        const twinkle = 0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase);
        // 30-45% base opacity, up to 70% on hover
        const baseAlpha = 0.3 + twinkle * 0.15 + glow * 0.35;
        const r = (s.r * 0.9 + glow * 1.0) * window.devicePixelRatio;
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

  const handleCursorSelect = useCallback(() => {
    sfx.click();
    setPhase("name");
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      sfx.click();
      setPhase("welcome");

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
        backgroundColor: "hsl(28 22% 6%)",
        opacity,
        transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        {phase === "cursor" && (
          <div
            className="flex flex-col items-center gap-8"
            style={{ animation: "introFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          >
            {/* Glowing S orb */}
            <button
              onClick={handleCursorSelect}
              className="group relative grid h-24 w-24 place-items-center rounded-full transition-transform duration-500 hover:scale-105"
              style={{
                background: "radial-gradient(circle, hsl(22 88% 58%) 0%, hsl(22 88% 48%) 60%, transparent 100%)",
                boxShadow: "0 0 60px 20px hsla(22, 88%, 58%, 0.3), 0 0 120px 40px hsla(22, 88%, 58%, 0.1)",
                animation: "orbPulse 3s ease-in-out infinite",
              }}
            >
              <span className="text-3xl font-bold text-background select-none" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>S</span>
            </button>

            {/* Cursor picker pill */}
            <div
              className="flex items-center gap-1 rounded-full px-2 py-1.5"
              style={{
                background: "hsla(28, 22%, 12%, 0.8)",
                border: "1px solid hsla(22, 88%, 58%, 0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              {CURSOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCursor(c.id);
                    sfx.blip();
                  }}
                  className="relative grid h-9 w-9 place-items-center rounded-full transition-all duration-300"
                  style={{
                    background: cursor === c.id
                      ? "radial-gradient(circle, hsl(22 88% 58%) 0%, hsl(22 70% 45%) 100%)"
                      : "transparent",
                    color: cursor === c.id ? "hsl(28 22% 8%)" : "hsla(35, 45%, 80%, 0.5)",
                    boxShadow: cursor === c.id
                      ? "0 0 16px 4px hsla(22, 88%, 58%, 0.35)"
                      : "none",
                  }}
                >
                  {c.icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "name" && (
          <div
            className="flex flex-col items-center gap-8"
            style={{ animation: "introFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          >
            {/* Small S orb */}
            <div
              className="grid h-14 w-14 place-items-center rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(22 88% 58%) 0%, hsl(22 88% 48%) 60%, transparent 100%)",
                boxShadow: "0 0 40px 12px hsla(22, 88%, 58%, 0.2)",
                animation: "orbPulse 3s ease-in-out infinite",
              }}
            >
              <span className="text-xl font-bold text-background">S</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your name"
                className="w-52 border-none bg-transparent text-center text-lg text-foreground outline-none placeholder:text-muted-foreground/30"
                style={{
                  caretColor: "hsl(22 88% 58%)",
                  borderBottom: "1px solid hsla(22, 88%, 58%, 0.2)",
                  paddingBottom: "8px",
                }}
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="rounded-full px-8 py-2 text-xs font-medium tracking-wider uppercase transition-all duration-500 disabled:opacity-0 disabled:translate-y-2"
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
                enter
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
              textShadow: "0 0 60px hsl(22 88% 58% / 0.3), 0 20px 60px hsl(0 0% 0% / 0.5)",
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

      {/* Sprite fizz particles going UP */}
      {(phase === "cursor" || phase === "name") && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 3 + "px",
                height: 2 + Math.random() * 3 + "px",
                left: 30 + Math.random() * 40 + "%",
                bottom: "-5%",
                background: `hsla(22, 88%, ${55 + Math.random() * 20}%, ${0.3 + Math.random() * 0.4})`,
                animation: `fizzUp ${3 + Math.random() * 4}s linear ${Math.random() * 3}s infinite`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
