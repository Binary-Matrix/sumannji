import { useEffect, useState } from "react";
import { ConstellationIntro, type CursorStyle } from "@/components/ConstellationIntro";
import { CursorFx } from "@/components/CursorFx";
import { FxLayer } from "@/components/FxLayer";
import { LoveLetter } from "@/components/LoveLetter";
import { Hero } from "@/components/Hero";
import { Shell } from "@/components/Shell";
import { MusicSection } from "@/components/MusicSection";
import { Instruments } from "@/components/Instruments";
import { Guruji } from "@/components/Guruji";
import { Games } from "@/components/Games";
import { Work } from "@/components/Work";
import { LiveHall } from "@/components/LiveHall";
import { Footer } from "@/components/Footer";
import { ScoreProvider, useScore } from "@/lib/score";
import { sfx } from "@/lib/sfx";

const Nav = () => {
  const { score } = useScore();
  const items = [
    { id: "shell", label: "parth" },
    { id: "music", label: "music" },
    { id: "guruji", label: "guruji" },
    { id: "games", label: "games" },
    { id: "work", label: "work" },
    { id: "hall", label: "hall" },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-40 glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <a href="#top" className="font-fancy text-xl" onClick={sfx.click}>
          <span className="text-ember">Suman</span> Neupane
        </a>
        <nav className="hidden gap-1 sm:flex">
          {items.map((i) => (
            <a
              key={i.id}
              href={`#${i.id}`}
              onClick={sfx.tap}
              className="rounded-full px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:bg-secondary/50 hover:text-foreground"
            >
              {i.label}
            </a>
          ))}
        </nav>
        <div className="glass rounded-full px-3 py-1 font-mono text-[11px]">
          <span className="text-muted-foreground">pts:</span> <span className="text-ember">{score}</span>
        </div>
      </div>
    </header>
  );
};

const Inner = ({ visitorName }: { visitorName: string }) => (
  <>
    <Nav />
    <main className="pt-14">
      <Hero visitorName={visitorName} />
      <Shell visitorName={visitorName} />
      <MusicSection />
      <Instruments />
      <Guruji />
      <Games />
      <Work />
      <LiveHall visitorName={visitorName} />
    </main>
    <Footer />
  </>
);

const Index = () => {
  const [entered, setEntered] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [cursor, setCursor] = useState<CursorStyle>("ember");
  const [letterOpen, setLetterOpen] = useState(false);

  useEffect(() => { document.documentElement.classList.add("dark"); }, []);
  useEffect(() => {
    const open = () => setLetterOpen(true);
    window.addEventListener("fx:loveletter", open);
    return () => window.removeEventListener("fx:loveletter", open);
  }, []);

  return (
    <ScoreProvider>
      <div id="top" className="min-h-screen bg-background text-foreground">
        <CursorFx style={cursor} />
        <FxLayer />
        <LoveLetter open={letterOpen} onClose={() => setLetterOpen(false)} />
        {!entered && (
          <ConstellationIntro
            onDone={(n, c) => { setVisitorName(n); setCursor(c); setEntered(true); }}
          />
        )}
        <Inner visitorName={visitorName} />
      </div>
    </ScoreProvider>
  );
};

export default Index;
