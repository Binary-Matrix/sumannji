import { sfx } from "@/lib/sfx";

const links = [
  { label: "Instagram", href: "https://www.instagram.com/sumanananda.ji/", icon: "📷" },
  { label: "Facebook", href: "https://www.facebook.com/So0man.Neupane", icon: "👤" },
  { label: "Email", href: "mailto:soomonnp13@gmail.com", icon: "✉️" },
  { label: "Call", href: "tel:9843034032", icon: "📞" },
  { label: "College", href: "https://midvalleycollege.edu.np", icon: "🎓" },
];

export const Footer = () => (
  <footer className="border-t border-border/40 px-6 py-16">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="font-fancy text-3xl text-ember animate-hue">Suman Neupane</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full neon-dot align-middle" />
            online · cocoa &amp; ember · kathmandu
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              onClick={sfx.click}
              className="glass lift-3d flex items-center gap-2 rounded-full px-4 py-2 text-sm text-foreground transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-ember"
            >
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </a>
          ))}
        </div>
      </div>
      <p className="mt-10 text-center font-mono text-[11px] text-muted-foreground">
        © 2026 Suman Neupane · brewed in cocoa &amp; ember · 9843034032 · soomonnp13@gmail.com
      </p>
    </div>
  </footer>
);
