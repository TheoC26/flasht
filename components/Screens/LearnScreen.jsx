import React, { useEffect, useState } from "react";
import Flashcard from "../Flashcard";
import { motion, AnimatePresence } from "framer-motion";
import ListItem from "../UI/ListItem";
import FloatingMenuBar from "../UI/FloatingMenuBar";
import { Edit, Trash } from "lucide-react";

const LearnScreen = ({ piles, setPiles, setRound }) => {
  const [flipped, setFlipped] = useState(false);

  const [isGrid, setIsGrid] = useState(true);

  const [isShuffled, setIsShuffled] = useState(false);
  const [floatingMenuBar, setFloatingMenuBar] = useState(false);
  const [floatingMenuBarPos, setFloatingMenuBarPos] = useState({ x: 0, y: 0 });
  const [currentFloatingMenuBarCard, setCurrentFloatingMenuBarCard] =
    useState(null);

  useEffect(() => {
    setIsShuffled(
      piles.dontKnow.length > 0 &&
        !piles.dontKnow.every(
          (card, i) => i === 0 || card.index > piles.dontKnow[i - 1].index
        )
    );
  }, [piles.dontKnow]);

  const toggleShuffle = (e) => {
    setPiles((prev) => {
      const newPiles = { ...prev };

      if (isShuffled) {
        // Restore original order based on card.index
        newPiles.dontKnow = [...newPiles.dontKnow].sort(
          (a, b) => a.index - b.index
        );
      } else {
        // Shuffle the dontKnow pile
        const shuffledDontKnow = [...newPiles.dontKnow];
        for (let i = shuffledDontKnow.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledDontKnow[i], shuffledDontKnow[j]] = [
            shuffledDontKnow[j],
            shuffledDontKnow[i],
          ];
        }
        newPiles.dontKnow = shuffledDontKnow;
      }

      return newPiles;
    });

    setIsShuffled(!isShuffled);
  };

  const flip = () => setFlipped((prev) => !prev);

  const next = () => {
    if (piles.dontKnow.length === 0) return;
    const card = piles.dontKnow[0];
    setPiles((prev) => {
      const newPiles = { ...prev };
      newPiles.dontKnow = [...newPiles.dontKnow.slice(1)];
      newPiles.discard = [card, ...newPiles.discard];
      return newPiles;
    });
    setFlipped(false);
  };

  const back = () => {
    if (piles.discard.length === 0) return;
    const lastCard = piles.discard[piles.discard.length - 1];
    setPiles((prev) => {
      const newPiles = { ...prev };
      newPiles.discard = newPiles.discard.slice(0, -1);
      newPiles.dontKnow = [lastCard, ...newPiles.dontKnow];
      return newPiles;
    });
    setFlipped(false);
  };

  const restart = () => {
    const restartedCards = isShuffled
      ? [...[...piles.discard], ...piles.dontKnow]
      : [...[...piles.discard], ...piles.dontKnow].sort(
          (a, b) => a.index - b.index
        );

    setPiles((prev) => {
      const newPiles = { ...prev };
      newPiles.discard = [];
      newPiles.dontKnow = [...restartedCards];
      return newPiles;
    });

    setIsShuffled(
      restartedCards.length > 0 &&
        !restartedCards.every(
          (card, i) => i === 0 || card.index > restartedCards[i - 1].index
        )
    );
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
          e.preventDefault();
          flip();
          break;
        case "3":
        case "ArrowRight":
          next();
          break;
        case "r":
          restart();
          break;
        case "s":
          toggleShuffle();
          break;
        case "Enter":
          if (piles.dontKnow.length === 0) {
            e.preventDefault();
            setRound((prev) => prev + 1);
          }
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
              <Flashcard
                card={card}
                flipped={i === 0 && flipped}
                isShuffled={isShuffled}
                toggleShuffle={toggleShuffle}
                setCurrentFloatingMenuBarCard={setCurrentFloatingMenuBarCard}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFloatingMenuBar(true);
                  setFloatingMenuBarPos({ x: e.clientX, y: e.clientY });
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="absolute -left-10 -right-10 -bottom-[40px] h-10 bg-gradient-to-b from-[#f1f1f100] to-[#f1f1f1] z-20"></div>
        <div className="absolute -left-10 -right-10 -bottom-[100px] h-[60px] bg-[#f1f1f1] z-20"></div>
        <AnimatePresence>
          <div
            className="absolute -left-12 bottom-0 w-10"
            style={{ perspective: "200px" }}
          >
            {[...cards].reverse().map((card, i) => (
              <motion.div
                layoutId={card.id + "mini"}
                key={card.id + "mini"}
                transition={{ duration: 0.1 }}
                className="w-full absolute flashcard-shadow aspect-[1.79] bg-white rounded-sm"
                style={{
                  bottom: `${i * 3}px`, // increase for more visible offset
                  zIndex: i,
                  transform: `rotateX(20deg)`, // slight scale for depth
                  boxShadow: "0 1px 7px rgba(0,0,0,0.08)",
                }}
              ></motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-[600px] mx-auto flex-col items-center justify-center mt-40 relative">
      <CardStack cards={piles.dontKnow} />
      <div
        className={`absolute text-[#303030] font-bold left-10 top-20 opacity-0 delay-300 duration-500 transition-opacity ${
          piles.dontKnow.length < 1 && "opacity-90 h-[310px]"
        }`}
      >
        <h1 className="text-4xl">Thats it!</h1>
        <h2 className="text-2xl mb-3 text-[#7C7C7C]">
          You have gone through all of the cards you{" "}
          <span className="text-[#303030]">don't know</span>
        </h2>
        <div className="flex gap-5 text-lg mt-5">
          <div className="flex-col relative">
            <button
              onClick={restart}
              className="bg-white rounded-2xl p-2 px-4 flashcard-shadow cursor-pointer transition-all hover:scale-105"
            >
              Restart
            </button>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[#BFBFBF]">
              R
            </div>
          </div>
          <div className="flex-col relative">
            <button
              onClick={() => setRound((prev) => prev + 1)}
              className="bg-[#CBF2CB] outline-2 outline-[#BFEBBF] rounded-2xl p-2 px-6 flashcard-shadow cursor-pointer transition-all hover:scale-105"
            >
              Test my knowledge &gt;
            </button>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[#BFBFBF]">
              ENTER
            </div>
          </div>
        </div>
      </div>
      <div
        className={`mt-10 flex gap-3 font-bold justify-center ${
          piles.dontKnow.length < 1 && "opacity-0"
        }`}
      >
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
        <div
          className={`flex bg-white flashcard-shadow rounded-xl text-xs w-fit relative transition-all ${
            piles.dontKnow.length + piles.discard.length < 1 && "opacity-0"
          }`}
        >
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
            {[...[...piles.discard], ...piles.dontKnow]
              .sort((a, b) => a.index - b.index)
              .map((card, i) => (
                <Flashcard key={card.id + card.front} card={card} size="grid" setCurrentFloatingMenuBarCard={setCurrentFloatingMenuBarCard} onContextMenu={(e) => {
                  e.preventDefault();
                  setFloatingMenuBar(true);
                  setFloatingMenuBarPos({ x: e.clientX, y: e.clientY });
                }} />
              ))}
          </div>
        ) : (
          <div className="flex-col mt-3 pb-28">
            {[...[...piles.discard], ...piles.dontKnow]
              .sort((a, b) => a.index - b.index)
              .map((card, i) => (
                <ListItem key={card.id + card.front} card={card} setCurrentFloatingMenuBarCard={setCurrentFloatingMenuBarCard} onContextMenu={(e) => {
                  e.preventDefault();
                  setFloatingMenuBar(true);
                  setFloatingMenuBarPos({ x: e.clientX, y: e.clientY });
                }} />
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
      <FloatingMenuBar
        isOpen={floatingMenuBar}
        onClose={() => setFloatingMenuBar(false)}
        posX={floatingMenuBarPos.x}
        posY={floatingMenuBarPos.y}
      >
        <div className="flex flex-col">
          <div className="hover:bg-[#F1F1F1] rounded-xl p-2 px-2 text-left  flex items-center justify-between">
            <div>Edit</div>
            <Edit size={16} />
          </div>
        </div>
        <div className="hover:bg-[#FFCACA] rounded-xl p-2 px-2 text-left  flex items-center justify-between">
          <div>Delete</div>
          <Trash size={16} />
        </div>
      </FloatingMenuBar>
    </div>
  );
};

export default LearnScreen;
