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
            talk with Parth ↓
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

        {/* Social links */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            { label: "Instagram", href: "https://www.instagram.com/sumanananda.ji/", icon: <svg viewBox="0 0 20 20" className="h-4 w-4"><rect x="2" y="2" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="14.5" cy="5.5" r="1" fill="currentColor"/></svg> },
            { label: "Facebook", href: "https://www.facebook.com/So0man.Neupane", icon: <svg viewBox="0 0 20 20" className="h-4 w-4"><path d="M11 20V10h3l.5-3H11V5.5c0-1 .3-1.5 1.5-1.5H14V1h-2.5C9 1 8 2.5 8 5v2H5v3h3v10h3z" fill="currentColor"/></svg> },
            { label: "Email", href: "mailto:soomonnp13@gmail.com", icon: <svg viewBox="0 0 20 20" className="h-4 w-4"><rect x="2" y="4" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M2 4l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg> },
            { label: "Call", href: "tel:9843034032", icon: <svg viewBox="0 0 20 20" className="h-4 w-4"><path d="M3 2c1-1 3 0 4 2s1 4 0 5l-1 1c1 2 3 4 5 5l1-1c1-1 3-1 5 0s3 3 2 4c-2 2-5 3-8 0S1 4 3 2z" fill="currentColor"/></svg> },
            { label: "College", href: "https://midvalleycollege.edu.np", icon: <svg viewBox="0 0 20 20" className="h-4 w-4"><path d="M10 2L2 7l8 5 8-5-8-5z" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M4 8v5c0 2 3 4 6 4s6-2 6-4V8" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg> },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              onClick={sfx.click}
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-foreground transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-ember"
            >
              {l.icon}
              <span>{l.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
