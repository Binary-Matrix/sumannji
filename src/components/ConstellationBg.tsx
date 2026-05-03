import { useEffect, useMemo, useState } from "react";

/** Persistent constellation background — visible at 30-45% base, 70% on hover */
export const ConstellationBg = () => {
  const [mouse, setMouse] = useState({ x: -1, y: -1 });

  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.3 + Math.random() * 0.6,
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

  const connectRadius = 0.2;
  const maxDist = 0.14;
  const lines: Array<{ a: number; b: number; opacity: number }> = [];

  if (mouse.x >= 0) {
    for (let i = 0; i < stars.length; i++) {
      const distToCursor = Math.hypot(stars[i].x - mouse.x, stars[i].y - mouse.y);
      if (distToCursor > connectRadius) continue;

      for (let j = i + 1; j < stars.length; j++) {
        const distToCursorJ = Math.hypot(stars[j].x - mouse.x, stars[j].y - mouse.y);
        if (distToCursorJ > connectRadius) continue;

        const d = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
        if (d < maxDist) {
          const avgDist = (distToCursor + distToCursorJ) / 2;
          const brightness = 1 - avgDist / connectRadius;
          lines.push({ a: i, b: j, opacity: brightness * 0.35 });
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
      {stars.map((s, i) => {
        const dist = mouse.x >= 0 ? Math.hypot(s.x - mouse.x, s.y - mouse.y) : 1;
        const glow = Math.max(0, 1 - dist * 4);
        // Base 30-45% opacity, up to 70% on hover
        const baseOpacity = 0.3 + Math.random() * 0.15;
        const finalOpacity = baseOpacity + glow * 0.4;
        return (
          <circle
            key={i}
            cx={s.x * 100}
            cy={s.y * 100}
            r={s.r * 0.14 + glow * 0.1}
            fill="hsl(var(--foreground))"
            opacity={Math.min(0.7, finalOpacity)}
            className="animate-twinkle"
            style={{ animationDelay: `${s.d}s` }}
          />
        );
      })}
    </svg>
  );
};
