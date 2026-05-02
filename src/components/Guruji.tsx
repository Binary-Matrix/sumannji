import { fireFx } from "./FxLayer";
import { sfx } from "@/lib/sfx";

export const Guruji = () => {
  return (
    <section id="guruji" className="border-t border-border/40 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">04 · guruji</p>
        <h2 className="mt-2 font-display text-4xl sm:text-5xl">Make your wedding a memory. 🙏</h2>
        <div className="mt-4 max-w-2xl space-y-2 text-muted-foreground">
          <p>As a maharaj, I am welcomed to your wedding.</p>
          <p>Call me for a proper wedding of your own.</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="tel:9843034032"
            onClick={sfx.click}
            className="rounded-full bg-ember px-6 py-3 font-medium text-primary-foreground shadow-ember transition hover:scale-105"
          >
            📞 9843034032
          </a>
          <a
            href="mailto:soomonnp13@gmail.com"
            onClick={sfx.click}
            className="glass rounded-full px-6 py-3 text-foreground transition hover:scale-105 hover:border-primary/50"
          >
            ✉️ soomonnp13@gmail.com
          </a>
        </div>

        <div className="mt-12">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">festive buttons</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => fireFx("flowers")}
              className="glass lift-3d rounded-xl px-5 py-3 text-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-ember"
            >
              🌸 rain flowers
            </button>
            <button
              onClick={() => fireFx("confetti")}
              className="glass lift-3d rounded-xl px-5 py-3 text-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-ember"
            >
              🎉 confetti rain
            </button>
            <button
              onClick={() => fireFx("love")}
              className="glass lift-3d rounded-xl px-5 py-3 text-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-ember"
            >
              💖 lovely lovely
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
