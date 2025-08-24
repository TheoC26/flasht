"use client";
import { useEffect, useState } from "react";
import { cards as initialCards } from "@/data/cards";
import TopBar from "@/components/TopBar";
import BottomBar from "@/components/BottomBar";
import AssessScreen from "@/components/Screens/AssessScreen";
import LearnScreen from "@/components/Screens/LearnScreen";
import TestScreen from "@/components/Screens/TestScreen";

export default function Learn() {
  const [piles, setPiles] = useState({
    main: initialCards,
    know: [],
    dontKnow: [],
    discard: [],
  });
  const [history, setHistory] = useState([]);
  const [round, setRound] = useState(0);

  const reverse = (e) => {
    let numberOfRounds = 0;
    const reverseInterval = setInterval(() => {
      const card = piles.dontKnow[0];
      setPiles((prev) => {
        numberOfRounds++;
        const newPiles = { ...prev };
        newPiles.dontKnow = [...newPiles.dontKnow.slice(1), card];
        return newPiles;
      });
      if (numberOfRounds >= piles.dontKnow.length) {
        clearInterval(reverseInterval);
      }
    }, 100);
  };

  const animateReverse = () => {
    let arr = [...piles.dontKnow];
    let target = arr.length - 1;

    const interval = setInterval(() => {
      if (target <= 0) {
        clearInterval(interval);
        return;
      }

      // Remove the top card
      const top = arr.shift();

      // Insert it at the current target position
      arr.splice(target, 0, top);

      // Update state to animate
      setPiles((prev) => ({
        ...prev,
        dontKnow: [...arr],
      }));

      target--;
    }, 30); // Adjust delay as needed
  };

  useEffect(() => {
    if (round !== 0 && round % 2 === 0) {
      setHistory([]);
    }
    if (round > 1) {
      setPiles((prev) => {
        const newPiles = { ...prev };
        newPiles.dontKnow = [...[...piles.discard], ...piles.dontKnow];
        newPiles.discard = [];
        return newPiles;
      });
    }
    if (round % 2 === 1) {
      setTimeout(() => {
        animateReverse();
      }, 400);
    }
  }, [round]);

  return (
    <main className="flex flex-col items-end justify-center min-h-screen bg-[#F1F1F1]">
      <TopBar
        isHome={false}
        name={"Common French Words"}
        collection={"French 101"}
      />
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
