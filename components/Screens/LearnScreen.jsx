import React, { useEffect, useState } from "react";
import Flashcard from "../Flashcard";
import { motion, AnimatePresence } from "framer-motion";

const LearnScreen = ({ piles, setPiles, setRound }) => {
  const [flipped, setFlipped] = useState(false);
  const [dontKnowCards, setDontKnowCards] = useState(piles.dontKnow);
  const [seenCards, setSeenCards] = useState([]);

  const [isGrid, setIsGrid] = useState(true);

  const flip = () => setFlipped((prev) => !prev);

  const next = () => {
    if (dontKnowCards.length === 0) return;
    const card = dontKnowCards[0];
    setDontKnowCards((prev) => prev.slice(1));
    setSeenCards((prev) => [...prev, card]);
    setFlipped(false);
  };

  const back = () => {
    if (seenCards.length === 0) return;
    const lastCard = seenCards[seenCards.length - 1];
    setSeenCards((prev) => prev.slice(0, -1));
    setDontKnowCards((prev) => [lastCard, ...prev]);
    setFlipped(false);
  };

  const restart = () => {
    setDontKnowCards(seenCards);
    setSeenCards([]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "1":
        case "ArrowLeft":
          back();
          break;
        case "2":
        case " ":
        case "ArrowUp":
        case "ArrowDown":
          flip();
          break;
        case "3":
        case "ArrowRight":
          next();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [back, flip, next]);

  const CardStack = ({ cards }) => {
    return (
      <div
        className={`card-stack relative flex items-end mx-auto justify-center w-[600px] h-[310px]`}
      >
        <AnimatePresence>
          {[...cards].slice(0, 5).map((card, i) => (
            <motion.div
              key={card.id}
              layoutId={card.id}
              className="absolute"
              style={{
                zIndex: 10 - i,
                y: i * 10,
                transformOrigin: "center center",
              }}
            >
              <Flashcard card={card} flipped={i === 0 && flipped} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="absolute -left-10 -right-10 -bottom-[40px] h-10 bg-gradient-to-b from-[#f1f1f100] to-[#f1f1f1] z-20"></div>
        <div className="absolute -left-10 -right-10 -bottom-[100px] h-[60px] bg-[#f1f1f1] z-20"></div>
      </div>
    );
  };

  return (
    <div className="w-[600px] mx-auto flex-col items-center justify-center mt-28 relative">
      <CardStack cards={dontKnowCards} />
      <div
        className={`absolute text-[#303030] font-bold left-10 top-20 opacity-0 delay-300 duration-500 transition-opacity ${
          dontKnowCards.length < 1 && "opacity-90 h-[310px]"
        }`}
      >
        <h1 className="text-4xl">Thats it!</h1>
        <h2 className="text-2xl mb-3 text-[#7C7C7C]">
          You have gone through all of the cards you{" "}
          <span className="text-[#303030]">don't know</span>
        </h2>
        <div className="flex gap-5 text-lg mt-5">
          <button
            onClick={restart}
            className="bg-white rounded-2xl p-2 px-4 flashcard-shadow cursor-pointer transition-all hover:scale-105"
          >
            Restart
          </button>
          <button
            onClick={() => setRound((prev) => prev + 1)}
            className="bg-[#CBF2CB] outline-2 outline-[#BFEBBF] rounded-2xl p-2 px-6 flashcard-shadow cursor-pointer transition-all hover:scale-105"
          >
            Test my knowledge &gt;
          </button>
        </div>
      </div>
      <div className={`mt-10 flex gap-3 font-bold justify-center`}>
        <div className="flex flex-col relative z-30">
          <button
            onClick={back}
            className="px-6 flex-1 py-2.5 select-none text-sm text-gray-600 bg-white rounded-xl flashcard-shadow transition-all cursor-pointer hover:scale-105"
          >
            Back
          </button>
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[#BFBFBF]">
            1
          </div>
        </div>
        <div className="flex flex-col relative z-30">
          <button
            onClick={flip}
            className="px-6 py-2.5 select-none text-sm text-gray-600 bg-white rounded-xl flashcard-shadow transition-all cursor-pointer hover:scale-105"
          >
            Flip
          </button>
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[#BFBFBF]">
            2
          </div>
        </div>
        <div className="flex flex-col relative z-30">
          <button
            onClick={next}
            className="px-6 py-2.5 select-none text-sm text-gray-600 bg-white rounded-xl flashcard-shadow transition-all cursor-pointer hover:scale-105"
          >
            Next
          </button>
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[#BFBFBF]">
            3
          </div>
        </div>
      </div>
      <div className="w-full h-96 mt-16 font-bold text-[#303030]">
        <div className="flex bg-white flashcard-shadow rounded-xl text-xs w-fit relative">
          <div
            className={`absolute top-0 bottom-0 transition-all ${
              isGrid ? "w-14.5 left-0" : "w-14 left-14"
            } bg-[#F1F1F1] outline-1 outline-[#D7D7D7] rounded-xl text-xs`}
          ></div>
          <button
            className="z-20 px-4.5 py-1 cursor-pointer"
            onClick={() => setIsGrid(true)}
          >
            Grid
          </button>
          <button
            className="z-20 px-4.5 py-1 cursor-pointer"
            onClick={() => setIsGrid(false)}
          >
            List
          </button>
        </div>
        {isGrid ? (
          <div className="w-full grid grid-cols-3 mt-3 gap-2 pb-28">
            {[...piles.dontKnow].reverse().map((card, i) => (
              <Flashcard key={i} card={card} size="grid" />
            ))}
          </div>
        ) : (
          <div className="flex-col mt-3 pb-28">
            {[...piles.dontKnow].reverse().map((card, i) => (
              <div
                key={i}
                className="bg-white flashcard-shadow rounded-xl w-full items-center flex p-1 mb-1.5"
              >
                <div className="p-3 w-32 text-center">{card.front}</div>
                <div className="w-px h-10 my-auto bg-[#D7D7D7]"></div>
                <div className="p-3 px-5 flex-1">{card.back}</div>
                <div className="p-3">dots</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => setRound((prev) => prev + 1)}
        className="fixed right-8 bottom-6 bg-[#CBF2CB] outline-2 outline-[#BFEBBF] rounded-2xl flashcard-shadow font-bold text-[#303030] flex gap-4 p-3 px-10 cursor-pointer z-50 transition-all hover:scale-105"
      >
        Next &gt;
      </button>
    </div>
  );
};

export default LearnScreen;
