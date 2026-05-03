import { useState } from "react";
import { sustain } from "@/lib/sfx";
import { sfx } from "@/lib/sfx";

const COOLDOWN_MS = 2000;

const instruments = [
  { name: "Flute",     icon: "🎶", note: "C5 · breathy",
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
  const [popup, setPopup] = useState<string | null>(null);

  const trigger = (name: string, fn: () => void) => {
    const now = Date.now();
    if ((cool[name] ?? 0) > now) return;
    fn();
    sfx.tap();
    setPopup(name);
    setCool((c) => ({ ...c, [name]: now + COOLDOWN_MS }));
    setTimeout(() => setCool((c) => ({ ...c, [name]: 0 })), COOLDOWN_MS + 50);
  };

  return (
    <section className="border-t border-border/40 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">03 · play</p>
        <h2 className="mt-2 text-4xl font-bold sm:text-5xl">Instrumental Hall</h2>
        <p className="mt-3 max-w-xl text-muted-foreground text-sm">
          Tap an instrument to hear it.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {instruments.map((i) => {
            const onCool = (cool[i.name] ?? 0) > Date.now();
            return (
              <button
                key={i.name}
                onClick={() => trigger(i.name, i.play)}
                disabled={onCool}
                className="group glass rounded-xl p-5 text-left transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-ember disabled:opacity-50"
              >
                <div className="text-3xl transition group-hover:scale-110">{i.icon}</div>
                <p className="mt-3 text-lg font-semibold">{i.name}</p>
                <p className="text-[11px] text-muted-foreground">{i.note}</p>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-primary">
                  {onCool ? "cooldown 2s…" : "tap to play"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* "Will be uploaded soon" popup */}
      {popup && (
        <div className="fixed inset-0 z-[300] grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPopup(null)} />
          <div className="glass-strong relative z-10 w-full max-w-sm overflow-hidden rounded-3xl p-8 text-center animate-fade-in">
            <p className="text-xl font-bold text-ember">{popup}</p>
            <p className="mt-4 text-lg text-foreground">will be uploaded soon baby</p>
            <p className="mt-2 text-sm text-muted-foreground">stay tuned ♪</p>
            <button
              onClick={() => setPopup(null)}
              className="mt-6 rounded-full bg-ember px-6 py-2 text-sm font-semibold text-primary-foreground shadow-ember transition hover:scale-105"
            >okay</button>
          </div>
        </div>
      )}
    </section>
  );
};
