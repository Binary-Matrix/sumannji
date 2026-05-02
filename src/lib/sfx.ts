// Tiny WebAudio sound effects + sustained instrument tones
let ctx: AudioContext | null = null;
const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

type ToneOpts = { freq: number; dur?: number; type?: OscillatorType; vol?: number; slideTo?: number; attack?: number; release?: number };
export const tone = ({ freq, dur = 0.18, type = "sine", vol = 0.18, slideTo, attack = 0.01, release }: ToneOpts) => {
  const c = getCtx(); if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
  const rel = release ?? Math.min(0.4, dur * 0.5);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + attack);
  gain.gain.setValueAtTime(vol, c.currentTime + Math.max(attack, dur - rel));
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur + 0.05);
};

/** Sustained instrument tone with multiple harmonics — at least 2.2s */
export const sustain = (freqs: number[], opts: { dur?: number; type?: OscillatorType; vol?: number } = {}) => {
  const c = getCtx(); if (!c) return;
  const dur = opts.dur ?? 2.4;
  const vol = opts.vol ?? 0.12;
  const type = opts.type ?? "sine";
  freqs.forEach((f, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, c.currentTime);
    // gentle vibrato
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 5 + i * 0.4;
    lfoGain.gain.value = f * 0.004;
    lfo.connect(lfoGain).connect(osc.frequency);
    const v = vol * (1 - i * 0.18);
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(v, c.currentTime + 0.08);
    gain.gain.setValueAtTime(v, c.currentTime + dur - 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    osc.connect(gain).connect(c.destination);
    osc.start();
    lfo.start();
    osc.stop(c.currentTime + dur + 0.05);
    lfo.stop(c.currentTime + dur + 0.05);
  });
};

export const sfx = {
  click: () => tone({ freq: 520, dur: 0.08, type: "triangle", vol: 0.12 }),
  tap:   () => tone({ freq: 880, dur: 0.06, type: "sine", vol: 0.1 }),
  pop:   () => tone({ freq: 320, slideTo: 740, dur: 0.18, type: "triangle", vol: 0.18 }),
  whoosh:() => { tone({ freq: 200, slideTo: 80, dur: 0.4, type: "sawtooth", vol: 0.08 }); },
  sparkle: () => {
    [880, 1320, 1760].forEach((f, i) => setTimeout(() => tone({ freq: f, dur: 0.12, type: "sine", vol: 0.1 }), i * 60));
  },
  cheer: () => {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone({ freq: f, dur: 0.18, type: "triangle", vol: 0.14 }), i * 70));
  },
  warm: () => {
    [220, 277, 330, 440].forEach((f, i) => setTimeout(() => tone({ freq: f, dur: 0.6, type: "sine", vol: 0.1 }), i * 100));
  },
  win: () => {
    [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => tone({ freq: f, dur: 0.14, type: "triangle", vol: 0.16 }), i * 80));
  },
  flowerSwoosh: () => {
    // soft chime — like a temple bell
    [880, 1175, 1568, 2093].forEach((f, i) =>
      setTimeout(() => tone({ freq: f, dur: 0.7, type: "sine", vol: 0.09, release: 0.6 }), i * 90)
    );
    setTimeout(() => tone({ freq: 440, dur: 1.2, type: "sine", vol: 0.06, release: 1.0 }), 120);
  },
  confettiBoom: () => {
    // poppier party horn + sparkle
    tone({ freq: 180, slideTo: 720, dur: 0.35, type: "square", vol: 0.12 });
    setTimeout(() => tone({ freq: 720, slideTo: 1100, dur: 0.25, type: "square", vol: 0.1 }), 120);
    [1200, 1600, 2000, 2400].forEach((f, i) =>
      setTimeout(() => tone({ freq: f, dur: 0.12, type: "triangle", vol: 0.08 }), 250 + i * 50)
    );
  },
  spaceship: () => {
    // sci-fi whoosh
    tone({ freq: 80, slideTo: 600, dur: 1.2, type: "sawtooth", vol: 0.08 });
    setTimeout(() => tone({ freq: 1200, slideTo: 200, dur: 0.8, type: "sine", vol: 0.06 }), 200);
  },
  blip: () => tone({ freq: 1400, dur: 0.04, type: "square", vol: 0.05 }),
};
