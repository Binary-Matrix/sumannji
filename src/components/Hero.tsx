import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";

const useCountUp = (target: number, durationMs = 1600) => {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef(0);
  const trigger = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    setVal(0);
    start.current = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - start.current) / durationMs);
      // smoother — quintic ease-out
      const eased = 1 - Math.pow(1 - t, 5);
      setVal(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
  return [val, trigger] as const;
};

const StatCard = ({
  k, target, suffix = "", showProgress = false, big = false,
}: { k: string; target: number; suffix?: string; showProgress?: boolean; big?: boolean }) => {
  const [val, trigger] = useCountUp(target);
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => { sfx.tap(); trigger(); setHover(true); }}
      onMouseLeave={() => setHover(false)}
      className={`group glass tilt-3d rounded-2xl p-5 transition ${
        big ? "sm:row-span-1 sm:col-span-2 ring-1 ring-primary/30 shadow-ember" : ""
      }`}
    >
      <p className={`font-display ${big ? "text-5xl" : "text-3xl"} text-ember transition-all`}>
        {hover ? `${Math.round(val)}${suffix}` : `— ${suffix || ""}`.trim()}
      </p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{k}</p>
      {showProgress && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary/50">
          <div
            className="h-full bg-ember transition-[width] duration-700 ease-out"
            style={{ width: hover ? `${val}%` : "0%" }}
          />
        </div>
      )}
      <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">
        {hover ? "counting…" : "hover to reveal"}
      </p>
    </div>
  );
};

export const Hero = ({ visitorName }: { visitorName?: string }) => {
  const surprise = () => {
    sfx.sparkle();
    window.dispatchEvent(new CustomEvent("fx:loveletter"));
  };

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full neon-dot animate-neon" />
          <span className="text-[hsl(var(--neon))]">online</span>
          <span className="opacity-50">·</span>
          ml engineer · multi-instrumentalist · guruji · kathmandu
        </div>

        {visitorName && (
          <p className="mt-4 font-script text-3xl text-accent">
            namaste, <span className="font-fancy text-4xl text-ember">{visitorName}</span> 🙏
          </p>
        )}

        <h1 className="mt-4 font-fancy text-6xl leading-[1] sm:text-8xl lg:text-9xl text-ember animate-hue">
          Suman Neupane
        </h1>
        <p className="mt-3 font-display text-2xl sm:text-4xl text-foreground">
          — meet me at the hub of the internet.
        </p>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Hii, welcome to your future wedding host. If you don't understand what I am talking about, you'll find out soon.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#shell"
            onClick={sfx.click}
            className="lift-3d rounded-full bg-ember px-6 py-3 font-medium text-primary-foreground shadow-ember transition hover:scale-105"
          >
            ✨ talk with Parth ↓
          </a>
          <button
            onClick={surprise}
            className="glass lift-3d rounded-full px-6 py-3 text-foreground transition hover:scale-105 hover:border-primary/50"
          >
            ✦ surprise me
          </button>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard k="WPM" target={148} />
          <StatCard k="Models shipped" target={13} suffix="+" />
          <StatCard k="Instruments" target={6} suffix="+" />
          <StatCard k="Website build" target={32} suffix="%" showProgress />
        </div>
      </div>
    </section>
  );
};
