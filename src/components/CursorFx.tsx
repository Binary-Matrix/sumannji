import { useEffect, useRef } from "react";
import type { CursorStyle } from "./ConstellationIntro";

/** Cursor: variants — ember / comet / ring / crosshair. Active everywhere. */
export const CursorFx = ({ style = "ember" }: { style?: CursorStyle }) => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.documentElement.style.cursor = "none";

    const sparkOn = style === "ember" || style === "comet";
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };

      if (sparkOn && Math.random() < (style === "comet" ? 0.85 : 0.5) && layerRef.current) {
        const s = document.createElement("span");
        s.className = "cursor-spark";
        s.style.left = `${e.clientX}px`;
        s.style.top = `${e.clientY}px`;
        const hue = style === "comet" ? 200 + Math.random() * 40 : 22 + Math.random() * 30;
        s.style.background = `hsl(${hue} 95% 65%)`;
        s.style.setProperty("--dx", `${(Math.random() - 0.5) * (style === "comet" ? 70 : 50)}px`);
        s.style.setProperty("--dy", `${(Math.random() - 0.5) * 50 - 12}px`);
        layerRef.current.appendChild(s);
        setTimeout(() => s.remove(), 900);
      }
    };

    const onDown = () => {
      if (!ringRef.current) return;
      ringRef.current.classList.remove("cursor-burst");
      void ringRef.current.offsetWidth;
      ringRef.current.classList.add("cursor-burst");
    };

    let raf = 0;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.25;
      pos.current.y += (target.current.y - pos.current.y) * 0.25;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.documentElement.style.cursor = "";
    };
  }, [style]);

  const ringClasses =
    style === "crosshair"
      ? "h-10 w-10 border-2 border-primary/80"
      : style === "ring"
      ? "h-7 w-7 border border-foreground/60"
      : "h-8 w-8 border border-primary/60";

  return (
    <>
      <div ref={layerRef} className="pointer-events-none fixed inset-0 z-[9997]" />
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9998] -ml-4 -mt-4 rounded-full ${ringClasses}`}
      >
        {style === "crosshair" && (
          <>
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/70" />
            <span className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-primary/70" />
          </>
        )}
      </div>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-1 -mt-1 h-2 w-2 rounded-full bg-ember shadow-ember"
      />
    </>
  );
};
