import { sfx } from "@/lib/sfx";

const links = [
  { label: "Instagram", href: "https://www.instagram.com/sumanananda.ji/", icon: <svg viewBox="0 0 20 20" className="h-4 w-4"><rect x="2" y="2" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="14.5" cy="5.5" r="1" fill="currentColor"/></svg> },
  { label: "Facebook", href: "https://www.facebook.com/So0man.Neupane", icon: <svg viewBox="0 0 20 20" className="h-4 w-4"><path d="M11 20V10h3l.5-3H11V5.5c0-1 .3-1.5 1.5-1.5H14V1h-2.5C9 1 8 2.5 8 5v2H5v3h3v10h3z" fill="currentColor"/></svg> },
  { label: "Email", href: "mailto:soomonnp13@gmail.com", icon: <svg viewBox="0 0 20 20" className="h-4 w-4"><rect x="2" y="4" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M2 4l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { label: "Call", href: "tel:9843034032", icon: <svg viewBox="0 0 20 20" className="h-4 w-4"><path d="M3 2c1-1 3 0 4 2s1 4 0 5l-1 1c1 2 3 4 5 5l1-1c1-1 3-1 5 0s3 3 2 4c-2 2-5 3-8 0S1 4 3 2z" fill="currentColor"/></svg> },
  { label: "College", href: "https://midvalleycollege.edu.np", icon: <svg viewBox="0 0 20 20" className="h-4 w-4"><path d="M10 2L2 7l8 5 8-5-8-5z" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M4 8v5c0 2 3 4 6 4s6-2 6-4V8" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg> },
];

export const Footer = () => (
  <footer className="border-t border-border/40 px-6 py-16">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-3xl font-bold text-ember">Suman Neupane</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full neon-dot align-middle" />
            online · kathmandu
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
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-foreground transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-ember"
            >
              {l.icon}
              <span>{l.label}</span>
            </a>
          ))}
        </div>
      </div>
      <p className="mt-10 text-center text-[11px] text-muted-foreground">
        © 2026 Suman Neupane · 9843034032 · soomonnp13@gmail.com
      </p>
    </div>
  </footer>
);
