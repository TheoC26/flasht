import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAX_SMALL_CARD_STACK_HEIGHT } from "@/constants";

import Flashcard from "@/components/Flashcard";

const AssessScreen = ({ piles, setPiles, history, setHistory, setRound }) => {
  const draggedCardRef = useRef(null);
  const [flipped, setFlipped] = useState(false);

  const flip = () => setFlipped(!flipped);

  const skip = () => {
    if (piles.main.length === 0) return;
    const card = piles.main[0];
    setHistory([...history, { cardId: card.id, from: "main", to: "main" }]);
    setPiles((prev) => {
      const newPiles = { ...prev };
      newPiles.main = [...newPiles.main.slice(1), card];
      return newPiles;
    });
    setFlipped(false);
  };

  const know = () => {
    if (piles.main.length === 0) return;
    const card = piles.main[0];
    setHistory([...history, { cardId: card.id, from: "main", to: "know" }]);
    setPiles((prev) => {
      const newPiles = { ...prev };
      newPiles.main = newPiles.main.slice(1);
      newPiles.know = [card, ...newPiles.know];
      return newPiles;
    });
    setFlipped(false);
  };

  const dontKnow = () => {
    if (piles.main.length === 0) return;
    const card = piles.main[0];
    setHistory([...history, { cardId: card.id, from: "main", to: "dontKnow" }]);
    setPiles((prev) => {
      const newPiles = { ...prev };
      newPiles.main = newPiles.main.slice(1);
      newPiles.dontKnow = [card, ...newPiles.dontKnow];
      return newPiles;
    });
    setFlipped(false);
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastMove = history[history.length - 1];
    const { cardId, from, to } = lastMove;

    if (from === "main" && to === "main") {
      setPiles((prev) => {
        const newPiles = { ...prev };
        const lastCard = newPiles.main[newPiles.main.length - 1];
        newPiles.main = [
          lastCard,
          ...newPiles.main.slice(0, newPiles.main.length - 1),
        ];
        return newPiles;
      });
    } else {
      setPiles((prev) => {
        const card = prev[to].find((c) => c.id === cardId);
        if (!card) return prev;

        const newPiles = { ...prev };
        newPiles[to] = newPiles[to].filter((c) => c.id !== cardId);
        newPiles[from] = [card, ...newPiles[from]];
        return newPiles;
      });
    }

    setHistory(history.slice(0, -1));
  };

  const onCardDragEnd = (e, card) => {
    const dropZones = ["main", "know", "dontKnow"];
    const dropZoneElements = dropZones.map((id) =>
      document.getElementById(`pile-${id}`)
    );

    let targetPile = null;
    dropZoneElements.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (
        e.clientX > rect.left &&
        e.clientX < rect.right &&
        e.clientY > rect.top &&
        e.clientY < rect.bottom
      ) {
        targetPile = dropZones[i];
      }
    });
    const sourcePile = Object.keys(piles).find((p) =>
      piles[p].find((c) => c.id === card.id)
    );

    if (targetPile && sourcePile && targetPile !== sourcePile) {
      setHistory([
        ...history,
        {
          cardId: card.id,
          from: sourcePile,
          to: targetPile,
        },
      ]);
      setPiles((prev) => {
        const newPiles = { ...prev };
        newPiles[sourcePile] = newPiles[sourcePile].filter(
          (c) => c.id !== card.id
        );
        newPiles[targetPile] = [card, ...newPiles[targetPile]];
        return newPiles;
      });
    } else {
      setPiles((prev) => {
        const newPiles = { ...prev };
        newPiles[sourcePile] = newPiles[sourcePile].filter(
          (c) => c.id !== card.id
        );
        newPiles[sourcePile] = [card, ...newPiles[sourcePile]];
        return newPiles;
      });
    }
    draggedCardRef.current = null;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "1":
        case "ArrowLeft":
          undo();
          break;
        case "2":
          dontKnow();
          break;
        case "3":
        case " ":
        case "ArrowUp":
        case "ArrowDown":
          flip();
          break;
        case "4":
          know();
          break;
        case "5":
        case "ArrowRight":
          skip();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, dontKnow, flip, know, skip]);

  const CardStack = ({ pileName, cards, size = "md" }) => {
    const isSmall = size === "sm";
    return (
      <div
        id={`pile-${pileName}`}
        className={`card-stack relative flex items-end justify-center ${
          isSmall ? "w-[220px] h-[126px]" : "w-[600px] h-[310px]"
        }`}
        style={
          isSmall
            ? {
                marginBottom: `${
                  cards.length <= MAX_SMALL_CARD_STACK_HEIGHT
                    ? cards.length * 10
                    : MAX_SMALL_CARD_STACK_HEIGHT * 10
                }px`,
              }
            : {}
        }
      >
        <AnimatePresence>
          {cards.slice(0, MAX_SMALL_CARD_STACK_HEIGHT).map((card, i) => (
            <motion.div
              key={card.id}
              layoutId={card.id}
              drag
              onDragStart={() => {
                draggedCardRef.current = card;
              }}
              onDragEnd={(e) => {
                setTimeout(() => (draggedCardRef.current = null), 10);
                onCardDragEnd(e, card);
              }}
              dragMomentum={false}
              whileDrag={{
                scale: isSmall ? 1.1 : 0.8,
                rotate: 3,
                zIndex: 9999,
              }}
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                zIndex:
                  draggedCardRef.current?.id == card.id
                    ? 9999
                    : isSmall
                    ? 30 - i
                    : 10 - i,
                y: i * 10,
                transformOrigin: "center center",
              }}
            >
              <Flashcard
                card={card}
                size={size}
                flipped={pileName === "main" && i === 0 && flipped}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto flex justify-center items-end overflow-hidden">
      <div className="flex flex-col items-center mr-20 mb-5 relative">
        <CardStack pileName="main" size="md" cards={piles.main} />
        <div
          className={`absolute text-[#303030] font-bold left-10 top-5 opacity-0 delay-300 duration-500 transition-opacity ${
            piles.main.length < 1 && "opacity-90 h-[310px]"
          }`}
        >
          <h1 className="text-6xl">Well done!</h1>
          <h2 className="text-3xl mb-3 text-[#7C7C7C]">
            You have assessed your knowledge of{" "}
            <span className="text-[#303030]">Common French Words</span>
          </h2>
          <div className="text-[#6AAD6A] text-3xl">
            You know: {piles.know.length} Cards
          </div>
          <div className="text-[#C98282] text-3xl">
            You are still learning: {piles.dontKnow.length} Cards
          </div>
          <div className="flex gap-5 text-2xl mt-5">
            <button
              onClick={undo}
              className="bg-white rounded-2xl p-2 px-4 flashcard-shadow cursor-pointer transition-all hover:scale-105"
            >
              Back
            </button>
            <button
              onClick={() => setRound(1)}
              className="bg-[#CBF2CB] outline-2 outline-[#BFEBBF] rounded-2xl p-2 px-12 flashcard-shadow cursor-pointer transition-all hover:scale-105"
            >
              Continue &gt;
            </button>
          </div>
        </div>
        <div className="absolute -left-10 -right-10 bottom-5 h-10 bg-gradient-to-b from-[#f1f1f100] to-[#f1f1f1] z-20"></div>
        <div className="absolute -left-10 -right-10 -bottom-[500px] h-[520px] bg-[#f1f1f1] z-20"></div>
        <div
          className={`mt-10 flex gap-3 z-30 justify-center font-bold transition-all ${
            piles.main.length < 1 && "opacity-0"
          }`}
        >
          <div className="flex flex-col relative">
            <button
              onClick={undo}
              className="px-6 flex-1 py-2.5 select-none text-sm text-gray-600 bg-white rounded-xl flashcard-shadow transition-all cursor-pointer hover:scale-105"
            >
              Back
            </button>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[#BFBFBF]">
              1
            </div>
          </div>
          <div className="flex flex-col relative">
            <button
              onClick={dontKnow}
              className="text-center w-32 py-2.5 select-none text-sm text-gray-600 bg-[#FFCACA] outline-2 outline-[#F7C1C1] rounded-xl flashcard-shadow transition-all cursor-pointer hover:scale-105"
            >
              Don't know
            </button>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[#BFBFBF]">
              2
            </div>
          </div>
          <div className="flex flex-col relative">
            <button
              onClick={flip}
              className="px-6 py-2.5 select-none text-sm text-gray-600 bg-white rounded-xl flashcard-shadow transition-all cursor-pointer hover:scale-105"
            >
              Flip
            </button>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[#BFBFBF]">
              3
            </div>
          </div>
          <div className="flex flex-col relative">
            <button
              onClick={know}
              className="text-center w-32 py-2.5 select-none text-sm text-gray-600 bg-[#CBF2CB] outline-2 outline-[#BFEBBF] rounded-xl flashcard-shadow transition-all cursor-pointer hover:scale-105"
            >
              Know
            </button>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[#BFBFBF]">
              4
            </div>
          </div>
          <div className="flex flex-col relative">
            <button
              onClick={skip}
              className="px-6 py-2.5 select-none text-sm text-gray-600 bg-white rounded-xl flashcard-shadow transition-all cursor-pointer hover:scale-105"
            >
              Skip
            </button>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[#BFBFBF]">
              5
            </div>
          </div>
        </div>
      </div>
      <div
        id="pile-dontKnow"
        className="p-4 rounded-xl h-[55vh] flex items-end justify-center relative"
      >
        {piles.dontKnow.length >= MAX_SMALL_CARD_STACK_HEIGHT && (
          <>
            <div className="absolute -left-0 -right-0 bottom-10 h-10 bg-gradient-to-b from-[#f1f1f100] to-[#f1f1f1] z-40"></div>
            <div className="absolute -left-0 -right-0 -bottom-[500px] h-[540px] bg-[#f1f1f1] z-40"></div>
          </>
        )}
        <CardStack pileName="dontKnow" size="sm" cards={piles.dontKnow} />
        <div
          className={`absolute transition-all text-xl font-bold text-[#303030] ${
            piles.dontKnow.length < 1 && "opacity-0"
          }`}
          style={{
            bottom:
              piles.dontKnow.length <= MAX_SMALL_CARD_STACK_HEIGHT
                ? piles.dontKnow.length * 10 + 150
                : MAX_SMALL_CARD_STACK_HEIGHT * 10 + 150,
          }}
        >
          Don't Know
        </div>
        <div className="w-[193.23px] h-[107.73px] absolute font-bold text-[#303030] bottom-[32px] rounded-xl bg-[#D9D9D9] border-4 border-[#C6C6C6] grid place-items-center">
          Don't Know
        </div>
      </div>
      <div
        id="pile-know"
        className="p-4 rounded-xl h-[55vh] flex items-end justify-center relative"
      >
        {piles.know.length >= MAX_SMALL_CARD_STACK_HEIGHT && (
          <>
            <div className="absolute -left-0 -right-0 bottom-10 h-10 bg-gradient-to-b from-[#f1f1f100] to-[#f1f1f1] z-40"></div>
            <div className="absolute -left-0 -right-0 -bottom-[500px] h-[540px] bg-[#f1f1f1] z-40"></div>
          </>
        )}
        <CardStack pileName="know" size="sm" cards={piles.know} />
        <div
          className={`absolute transition-all text-xl font-bold text-[#303030] ${
            piles.know.length < 1 && "opacity-0"
          }`}
          style={{
            bottom:
              piles.know.length <= MAX_SMALL_CARD_STACK_HEIGHT
                ? piles.know.length * 10 + 150
                : MAX_SMALL_CARD_STACK_HEIGHT * 10 + 150,
          }}
        >
          Know
        </div>
        <div className="w-[193.23px] h-[107.73px] absolute font-bold text-[#303030] bottom-[32px] rounded-xl bg-[#D9D9D9] border-4 border-[#C6C6C6] grid place-items-center">
          Know
        </div>
      </div>
    </div>
  );
};

export default AssessScreen;
