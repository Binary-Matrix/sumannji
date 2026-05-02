import { useEffect, useMemo, useState } from "react";

/** Persistent constellation background — connections appear around cursor */
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

  // Only draw lines near mouse cursor — creates the "connecting when hovering" effect
  const lines: Array<{ a: number; b: number; opacity: number }> = [];
  if (mouse.x >= 0) {
    const connectRadius = 0.18; // how far from cursor stars connect
    const maxDist = 0.12; // max distance between two stars to form a line

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
          lines.push({ a: i, b: j, opacity: brightness * 0.3 });
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
        return (
          <circle
            key={i}
            cx={s.x * 100}
            cy={s.y * 100}
            r={s.r * 0.14 + glow * 0.1}
            fill="hsl(var(--foreground))"
            opacity={0.12 + glow * 0.5}
            className="animate-twinkle"
            style={{ animationDelay: `${s.d}s` }}
          />
        );
      })}
    </svg>
  );
};
