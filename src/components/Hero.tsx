import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";

const useCountUp = (target: number, durationMs = 1200) => {
  const [val, setVal] = useState(target);
  const raf = useRef<number | null>(null);
  const start = useRef(0);
  const trigger = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    setVal(0);
    start.current = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - start.current) / durationMs);
      const eased = 1 - Math.pow(1 - t, 4);
      setVal(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
  return [val, trigger] as const;
};

const StatCard = ({
  k, target, suffix = "", showProgress = false,
}: { k: string; target: number; suffix?: string; showProgress?: boolean }) => {
  const [val, trigger] = useCountUp(target);

  return (
    <div
      onMouseEnter={() => { sfx.tap(); trigger(); }}
      className="group glass rounded-2xl p-5 transition hover:border-primary/40 hover:shadow-ember"
    >
      <p className="text-3xl font-bold text-ember">
        {Math.round(val)}{suffix}
      </p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{k}</p>
      {showProgress && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary/50">
          <div
            className="h-full bg-ember transition-[width] duration-500 ease-out"
            style={{ width: `${val}%` }}
          />
        </div>
      )}
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
        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          <span className="h-2 w-2 rounded-full neon-dot animate-neon" />
          <span className="text-[hsl(var(--neon))]">online</span>
          <span className="opacity-50">·</span>
          ml engineer · multi-instrumentalist · guruji · kathmandu
        </div>

        {visitorName && (
          <p className="mt-4 text-2xl text-accent">
            namaste, <span className="text-3xl font-bold text-ember">{visitorName}</span> 🙏
          </p>
        )}

        <h1 className="mt-4 text-6xl font-bold leading-[1] sm:text-8xl lg:text-9xl text-ember animate-hue">
          Suman Neupane
        </h1>
        <p className="mt-3 text-2xl font-semibold sm:text-4xl text-foreground">
          — meet me at the hub of the internet.
        </p>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Hii, welcome to your future wedding host. If you don't understand what I am talking about, you'll find out soon.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#shell"
            onClick={sfx.click}
            className="rounded-full bg-ember px-6 py-3 font-semibold text-primary-foreground shadow-ember transition hover:scale-105"
          >
            ✨ talk with Parth ↓
          </a>
          <button
            onClick={surprise}
            className="glass rounded-full px-6 py-3 font-medium text-foreground transition hover:scale-105 hover:border-primary/50"
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
