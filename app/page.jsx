"use client";
import { useEffect, useState } from "react";
import { cards as initialCards } from "../data/cards";
import TopBar from "@/components/TopBar";
import BottomBar from "@/components/BottomBar";
import AssessScreen from "@/components/Screens/AssessScreen";
import LearnScreen from "@/components/Screens/LearnScreen";
import TestScreen from "@/components/Screens/TestScreen";

export default function Home() {
  const [piles, setPiles] = useState({
    main: initialCards,
    know: [],
    dontKnow: [],
    discard: [],
  });
  const [history, setHistory] = useState([]);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (round !== 0 && round % 2 === 0) {
      setHistory([]);
    }
    console.log(round, round !== 1 && round % 2 === 1);
    if (round !== 1 && round % 2 === 1) {
      console.log(piles);
      setPiles((prev) => {
        const newPiles = { ...prev };
        newPiles.dontKnow = newPiles.discard;
        newPiles.discard = [];
        return newPiles;
      });
    }
  }, [round]);

  return (
    <main className="flex flex-col items-end justify-center min-h-screen p-10 bg-[#F1F1F1]">
      <TopBar />
      {round == 0 ? (
        <AssessScreen
          piles={piles}
          setPiles={setPiles}
          history={history}
          setHistory={setHistory}
          setRound={setRound}
        />
      ) : round % 2 == 1 ? (
        <LearnScreen piles={piles} setPiles={setPiles} setRound={setRound} />
      ) : (
        round % 2 == 0 && (
          <TestScreen
            piles={piles}
            setPiles={setPiles}
            history={history}
            setHistory={setHistory}
            setRound={setRound}
          />
        )
      )}
      <BottomBar piles={piles} round={round} />
    </main>
  );
}
