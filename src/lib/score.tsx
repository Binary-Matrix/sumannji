import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ScoreCtx = { score: number; add: (n: number) => void; reset: () => void };
const Ctx = createContext<ScoreCtx>({ score: 0, add: () => {}, reset: () => {} });

export const ScoreProvider = ({ children }: { children: ReactNode }) => {
  const [score, setScore] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem("sn_score") || 0);
  });
  useEffect(() => { localStorage.setItem("sn_score", String(score)); }, [score]);
  return (
    <Ctx.Provider value={{ score, add: (n) => setScore((s) => s + n), reset: () => setScore(0) }}>
      {children}
    </Ctx.Provider>
  );
};

export const useScore = () => useContext(Ctx);
