"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import TopBar from "@/components/TopBar";
import BottomBar from "@/components/BottomBar";
import AssessScreen from "@/components/Screens/AssessScreen";
import LearnScreen from "@/components/Screens/LearnScreen";
import TestScreen from "@/components/Screens/TestScreen";
import { useUser } from "@/utils/hooks/useUser";
import { useFlashcards } from "@/utils/hooks/useFlashcards";
import { useParams } from "next/navigation";

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Learn() {
  const { id: setId } = useParams();
  const { user } = useUser();
  const { getUserProgress, updateUserProgress, getSet } = useFlashcards();

  const [progress, setProgress] = useState(null);
  const [setInfo, setSetInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [piles, setPiles] = useState(null);
  const [history, setHistory] = useState(null);
  const [round, setRound] = useState(null);

  const debouncedPiles = useDebounce(piles, 1000);
  const debouncedHistory = useDebounce(history, 1000);
  const debouncedRound = useDebounce(round, 1000);

  useEffect(() => {
    const fetchProgress = async () => {
      if (user && setId) {
        setLoading(true);
        const userProgress = await getUserProgress(setId, user.id);
        const setData = await getSet(setId);
        if (userProgress && setData) {
          setProgress(userProgress);
          setPiles(userProgress.piles);
          setHistory(userProgress.history);
          setRound(userProgress.round);
          setSetInfo(setData.info);
        } else {
          // Handle error or not found case
        }
        setLoading(false);
      }
    };
    fetchProgress();
  }, [user]);

  useEffect(() => {
    const updateProgress = async () => {
      if (progress && debouncedPiles && debouncedHistory !== null && debouncedRound !== null) {
        const hasChanged = 
          JSON.stringify(debouncedPiles) !== JSON.stringify(progress.piles) ||
          JSON.stringify(debouncedHistory) !== JSON.stringify(progress.history) ||
          debouncedRound !== progress.round;

        if (hasChanged) {
          await updateUserProgress(progress.id, {
            piles: debouncedPiles,
            history: debouncedHistory,
            round: debouncedRound,
          });
        }
      }
    };

    updateProgress();
  }, [debouncedPiles, debouncedHistory, debouncedRound, progress, updateUserProgress]);


  const animateReverse = () => {
    if (!piles || !piles.dontKnow) return;
    let arr = [...piles.dontKnow];
    let target = arr.length - 1;

    const interval = setInterval(() => {
      if (target <= 0) {
        clearInterval(interval);
        return;
      }

      const top = arr.shift();
      arr.splice(target, 0, top);

      setPiles((prev) => ({
        ...prev,
        dontKnow: [...arr],
      }));

      target--;
    }, 30);
  };

  useEffect(() => {
    if (round !== null && round > 0) {
        if (round % 2 === 0) {
            setHistory([]);
        }
        if (round > 1) {
            setPiles((prev) => {
                if (!prev) return null;
                const newPiles = { ...prev };
                newPiles.dontKnow = [...(prev.discard || []), ...(prev.dontKnow || [])];
                newPiles.discard = [];
                return newPiles;
            });
        }
        if (round % 2 === 1) {
            setTimeout(() => {
                animateReverse();
            }, 400);
        }
    }
}, [round]);


  if (loading || piles === null || round === null) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#F1F1F1]">
        <TopBar isHome={false} />
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-end justify-center min-h-screen bg-[#F1F1F1]">
      <TopBar
        isHome={false}
        name={setInfo?.name || "Learn"}
        collection={setInfo?.collection_name || "Collection"}
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
