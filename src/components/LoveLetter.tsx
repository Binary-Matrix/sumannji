import { useEffect, useState } from "react";
import { sfx } from "@/lib/sfx";

type Kiss = { id: number; x: number; y: number; size: number; rot: number; emoji: string; delay: number };
let nextK = 0;

export const LoveLetter = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [kisses, setKisses] = useState<Kiss[]>([]);

  useEffect(() => {
    if (!open) { setKisses([]); return; }
    sfx.warm();
    setTimeout(() => sfx.cheer(), 600);

    const emojis = ["💋", "💖", "💗", "💞", "❤️", "💕", "💘", "💝"];
    const seed = (n: number): Kiss[] => Array.from({ length: n }, () => ({
      id: ++nextK,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 22 + Math.random() * 36,
      rot: -30 + Math.random() * 60,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      delay: Math.random() * 1.8,
    }));
    setKisses(seed(100));

    const iv = setInterval(() => {
      setKisses((k) => [...k.slice(-220), ...seed(35)]);
      sfx.sparkle();
    }, 1500);
    return () => clearInterval(iv);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center px-4">
      {/* peak-mode warm wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, hsl(355 85% 55% / 0.55), hsl(22 88% 50% / 0.45) 45%, hsl(28 22% 6% / 0.92) 80%)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      {/* kisses */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {kisses.map((k) => (
          <span
            key={k.id}
            className="absolute select-none"
            style={{
              left: `${k.x}%`,
              top: `${k.y}%`,
              fontSize: k.size,
              transform: `rotate(${k.rot}deg)`,
              animation: `kissPop 1.6s ${k.delay}s cubic-bezier(.2,.9,.2,1) both`,
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
            }}
          >
            {k.emoji}
          </span>
        ))}
      </div>

      {/* the letter */}
      <div
        className="glass-strong relative z-10 w-full max-w-lg animate-fade-up rounded-2xl p-8"
        style={{
          backgroundImage:
            "linear-gradient(180deg, hsl(28 25% 12% / 0.85), hsl(26 18% 9% / 0.85))",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">a personal patra for you</p>
          <button
            onClick={() => { sfx.click(); onClose(); }}
            className="glass rounded-full px-3 py-1 font-mono text-xs text-muted-foreground transition hover:text-foreground"
          >
            close ✕
          </button>
        </div>

        <p className="font-fancy text-6xl leading-tight text-ember animate-hue">
          lovely lovely 💋
        </p>

        <div className="mt-6 space-y-3 font-mono text-sm leading-relaxed text-muted-foreground">
          <p>dear visitor,</p>
          <p>thank you for stopping and taking a look at this.</p>
          <p>lovely lovely uuuu.</p>
          <p className="text-accent">Jaiiii Suman 🙏</p>
          <p>— suman 🙏</p>
        </div>

        <button
          onClick={() => { sfx.cheer(); onClose(); }}
          className="mt-6 w-full rounded-xl bg-ember py-3 font-medium text-primary-foreground shadow-ember transition hover:scale-[1.02]"
        >
          💖 sealed with love
        </button>
      </div>
    </div>
  );
};
