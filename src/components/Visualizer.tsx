import { useEffect, useRef, useState } from "react";

/** Minimalistic audio-style visualizer (synthesized, not real audio). */
export const Visualizer = ({ active, mood = "calm", side = "left" }: { active: boolean; mood?: "calm" | "soft"; side?: "left" | "right" }) => {
  const [bars, setBars] = useState<number[]>(Array(18).fill(0.2));
  const raf = useRef<number | null>(null);
  const t = useRef(0);

  useEffect(() => {
    const tick = () => {
      t.current += 0.05;
      const next = bars.map((_, i) => {
        const base = mood === "calm" ? 0.25 : 0.4;
        const amp = mood === "calm" ? 0.35 : 0.55;
        const speed = mood === "calm" ? 0.6 : 1.1;
        const v = base + Math.abs(Math.sin(t.current * speed + i * 0.4)) * amp * (active ? 1 : 0.25);
        return v;
      });
      setBars(next);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mood]);

  return (
    <div className={`flex h-40 items-end justify-center gap-1 ${side === "right" ? "flex-row-reverse" : ""}`} aria-hidden>
      {bars.map((v, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full transition-[height] duration-100"
          style={{
            height: `${v * 100}%`,
            background:
              mood === "calm"
                ? `linear-gradient(180deg, hsl(38 78% 60% / 0.9), hsl(22 88% 58% / 0.5))`
                : `linear-gradient(180deg, hsl(32 95% 65% / 0.9), hsl(22 88% 58% / 0.4))`,
            opacity: active ? 1 : 0.5,
          }}
        />
      ))}
    </div>
  );
};
