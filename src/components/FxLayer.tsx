import { useEffect, useState } from "react";
import { sfx } from "@/lib/sfx";

type Item = {
  id: number;
  left: number;       // starting x %
  delay: number;
  size: number;
  emoji?: string;
  color?: string;
  kind: "flower" | "confetti" | "kiss";
  xs: number; xm: number; xe: number; // wind drift offsets
  peak: number;       // how high it rises (vh)
  duration: number;
};

let nextId = 0;

const drift = () => (Math.random() - 0.5) * 80; // px

export const FxLayer = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    const make = (kind: Item["kind"], n: number, emojis?: string[], colors?: string[]): Item[] =>
      Array.from({ length: n }, () => ({
        id: ++nextId,
        left: Math.random() * 100,
        delay: Math.random() * 1.4,
        size: kind === "confetti" ? 6 + Math.random() * 10 : 20 + Math.random() * 26,
        emoji: emojis ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
        color: colors ? colors[Math.floor(Math.random() * colors.length)] : undefined,
        kind,
        xs: drift(),
        xm: drift(),
        xe: drift(),
        peak: 50 + Math.random() * 40, // vh
        duration: 4.5 + Math.random() * 2.5,
      }));

    const onFlowers = () => {
      sfx.flowerSwoosh();
      const flowers = ["🌸", "🌺", "🌼", "🌷", "💐", "🌹", "🏵️"];
      const batch = make("flower", 70, flowers);
      setItems((p) => [...p, ...batch]);
      setTimeout(() => setItems((p) => p.filter((x) => !batch.includes(x))), 8500);
    };
    const onConfetti = () => {
      sfx.confettiBoom();
      setWarm(true);
      setTimeout(() => setWarm(false), 2400);
      const colors = ["#f97316", "#fbbf24", "#ef4444", "#a855f7", "#22d3ee", "#84cc16", "#ec4899"];
      const batch = make("confetti", 160, undefined, colors);
      setItems((p) => [...p, ...batch]);
      setTimeout(() => setItems((p) => p.filter((x) => !batch.includes(x))), 8500);
    };
    const onLove = () => {
      sfx.warm();
      const batch = make("kiss", 60, ["💖", "💗", "💞", "❤️", "💕", "💋"]);
      setItems((p) => [...p, ...batch]);
      setTimeout(() => setItems((p) => p.filter((x) => !batch.includes(x))), 8500);
    };

    window.addEventListener("fx:flowers", onFlowers);
    window.addEventListener("fx:confetti", onConfetti);
    window.addEventListener("fx:love", onLove);
    return () => {
      window.removeEventListener("fx:flowers", onFlowers);
      window.removeEventListener("fx:confetti", onConfetti);
      window.removeEventListener("fx:love", onLove);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[150] overflow-hidden">
      {warm && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(22 88% 58% / 0.45), hsl(0 80% 55% / 0.25) 40%, transparent 75%)",
            animation: "warmGlow 2.4s ease-out forwards",
          }}
        />
      )}
      {items.map((it) => {
        const animName = it.kind === "confetti" ? "confettiRiseFall" : "riseAndFall";
        const style: React.CSSProperties = {
          left: `${it.left}%`,
          bottom: "-8vh", // start from below screen
          fontSize: it.size,
          // CSS variables consumed by the keyframes
          ["--xs" as any]: `${it.xs}px`,
          ["--xm" as any]: `${it.xm}px`,
          ["--xe" as any]: `${it.xe}px`,
          ["--peak" as any]: `${it.peak}vh`,
          animation: `${animName} ${it.duration}s ${it.delay}s cubic-bezier(.45,.05,.35,1) forwards`,
        };
        if (it.kind === "confetti") {
          return (
            <span
              key={it.id}
              className="absolute"
              style={{
                ...style,
                width: it.size,
                height: it.size * 0.4,
                background: it.color,
                borderRadius: 2,
              }}
            />
          );
        }
        return (
          <span key={it.id} className="absolute select-none" style={style}>
            {it.emoji}
          </span>
        );
      })}
    </div>
  );
};

export const fireFx = (kind: "flowers" | "confetti" | "love") =>
  window.dispatchEvent(new CustomEvent(`fx:${kind}`));
