import { sfx } from "@/lib/sfx";

const projects = [
  { name: "Karmakanda", desc: "Spiritual event management & coordination" },
  { name: "Video Edits", desc: "Professional video editing portfolio" },
  { name: "Local Websites", desc: "Web presence for local businesses" },
  { name: "Content Writing", desc: "Articles, scripts & creative writing" },
  { name: "Kabita", desc: "Poetry collection & literary works" },
];

export const Work = () => (
  <section id="work" className="border-t border-border/40 px-6 py-24">
    <div className="mx-auto max-w-6xl">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">06 · selected work</p>
      <h2 className="mt-2 font-display text-4xl sm:text-5xl">Things I've shipped.</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div
            key={p.name}
            onMouseEnter={sfx.tap}
            className="group glass tilt-3d cursor-pointer rounded-2xl p-8 transition hover:border-primary/50 hover:shadow-ember"
          >
            <p className="font-mono text-[11px] uppercase tracking-wider text-primary">{p.name}</p>
            <p className="mt-3 font-display text-2xl font-bold">{p.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
