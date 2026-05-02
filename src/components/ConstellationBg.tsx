import { useEffect, useMemo, useRef, useState } from "react";

/** Persistent constellation background that reacts to mouse movement */
export const ConstellationBg = () => {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.3 + Math.random() * 0.8,
        d: Math.random() * 4,
      })),
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) =>
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const lines: Array<{ a: number; b: number; opacity: number }> = [];
  const maxDist = 0.15;
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const d = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
      if (d < maxDist) {
        const mid = { x: (stars[i].x + stars[j].x) / 2, y: (stars[i].y + stars[j].y) / 2 };
        const cursorBoost = 1 - Math.min(1, Math.hypot(mid.x - mouse.x, mid.y - mouse.y) * 3.5);
        if (cursorBoost > 0.05) {
          lines.push({ a: i, b: j, opacity: cursorBoost * 0.2 });
        }
      }
    }
  }

  return (
    <svg
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
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
            strokeWidth={0.04}
            opacity={l.opacity}
          />
        );
      })}
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x * 100}
          cy={s.y * 100}
          r={s.r * 0.15}
          fill="hsl(var(--foreground))"
          opacity={0.15 + (1 - Math.min(1, Math.hypot(s.x - mouse.x, s.y - mouse.y) * 3)) * 0.3}
          className="animate-twinkle"
          style={{ animationDelay: `${s.d}s` }}
        />
      ))}
    </svg>
  );
};
