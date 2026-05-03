import { useState } from "react";
import { sustain } from "@/lib/sfx";
import { sfx } from "@/lib/sfx";

const COOLDOWN_MS = 2000;
const FLUTE_REEL = "https://www.instagram.com/p/DUThrv6Elfe/";

const instruments = [
  { name: "Flute",     icon: "🎶", note: "C5 · breathy",     reel: FLUTE_REEL,
    play: () => sustain([523.25, 659.25, 783.99], { dur: 2.6, type: "sine", vol: 0.16 }) },
  { name: "Tabla",     icon: "🥁", note: "membrane · dha",
    play: () => sustain([110, 165, 220], { dur: 2.4, type: "triangle", vol: 0.18 }) },
  { name: "Harmonium", icon: "🎹", note: "reedy chord",
    play: () => sustain([261.63, 329.63, 392.00, 523.25], { dur: 2.8, type: "sawtooth", vol: 0.07 }) },
  { name: "Guitar",    icon: "🎸", note: "plucked string",
    play: () => sustain([329.63, 415.30, 493.88, 659.25], { dur: 2.6, type: "triangle", vol: 0.12 }) },
  { name: "Sitar",     icon: "🪕", note: "buzzing drone",
    play: () => sustain([293.66, 440, 587.33], { dur: 3.0, type: "sawtooth", vol: 0.08 }) },
  { name: "Voice",     icon: "🎤", note: "om · long tone",
    play: () => sustain([196, 246.94, 293.66], { dur: 3.0, type: "sine", vol: 0.14 }) },
];

export const Instruments = () => {
  const [cool, setCool] = useState<Record<string, number>>({});
  const [reelOpen, setReelOpen] = useState(false);

  const trigger = (name: string, fn: () => void, reel?: string) => {
    const now = Date.now();
    if ((cool[name] ?? 0) > now) return;
    fn();
    sfx.tap();
    if (reel) setReelOpen(true);
    setCool((c) => ({ ...c, [name]: now + COOLDOWN_MS }));
    setTimeout(() => setCool((c) => ({ ...c, [name]: 0 })), COOLDOWN_MS + 50);
  };

  return (
    <section className="border-t border-border/40 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">03 · play</p>
        <h2 className="mt-2 text-4xl font-bold sm:text-5xl">Instrumental Hall</h2>
        <p className="mt-3 max-w-xl text-muted-foreground text-sm">
          Tap an instrument to hear it. More recordings coming soon.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {instruments.map((i) => {
            const onCool = (cool[i.name] ?? 0) > Date.now();
            return (
              <button
                key={i.name}
                onClick={() => trigger(i.name, i.play, i.reel)}
                disabled={onCool}
                className="group glass rounded-xl p-5 text-left transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-ember disabled:opacity-50"
              >
                <div className="text-3xl transition group-hover:scale-110">{i.icon}</div>
                <p className="mt-3 text-lg font-semibold">{i.name}</p>
                <p className="text-[11px] text-muted-foreground">{i.note}</p>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-primary">
                  {onCool ? "cooldown 2s…" : i.reel ? "tap · watch reel" : "tap to play"}
                </p>
              </button>
            );
          })}
        </div>

      </div>

      {/* Flute Reel modal */}
      {reelOpen && (
        <div className="fixed inset-0 z-[300] grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setReelOpen(false)} />
          <div className="glass-strong relative z-10 w-full max-w-md overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
              <p className="text-base font-semibold">Suman · Flute Reel</p>
              <button
                onClick={() => setReelOpen(false)}
                className="glass rounded-full px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >close ✕</button>
            </div>
            <div className="aspect-[9/16] w-full bg-black">
              <iframe
                src={`${FLUTE_REEL}embed`}
                className="h-full w-full"
                allow="encrypted-media; picture-in-picture"
                allowFullScreen
                title="Suman flute reel"
              />
            </div>
            <div className="p-4">
              <a
                href={FLUTE_REEL}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-full bg-ember px-4 py-2 text-center text-xs font-medium text-primary-foreground shadow-ember"
              >open on Instagram ↗</a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
