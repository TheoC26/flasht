import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAX_SMALL_CARD_STACK_HEIGHT } from "@/constants";

import Flashcard from "@/components/Flashcard";
import FloatingMenuBar from "../UI/FloatingMenuBar";
import { Edit, Trash } from "lucide-react";

const AssessScreen = ({ piles, setPiles, history, setHistory, setRound }) => {
  const draggedCardRef = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [floatingMenuBar, setFloatingMenuBar] = useState(false);
  const [floatingMenuBarPos, setFloatingMenuBarPos] = useState({ x: 0, y: 0 });
  const [currentFloatingMenuBarCard, setCurrentFloatingMenuBarCard] =
    useState(null);

  // Mobile detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    setIsShuffled(
      piles.main.length > 0 &&
        !piles.main.every(
          (card, i) => i === 0 || card.index > piles.main[i - 1].index
        )
    );
  }, [piles.main]);

  const toggleShuffle = (e) => {
    setPiles((prev) => {
      const newPiles = { ...prev };

      if (isShuffled) {
        // Restore original order based on card.index
        newPiles.main = [...newPiles.main].sort((a, b) => a.index - b.index);
      } else {
        // Shuffle the main pile
        const shuffledMain = [...newPiles.main];
        for (let i = shuffledMain.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledMain[i], shuffledMain[j]] = [
            shuffledMain[j],
            shuffledMain[i],
          ];
        }
        newPiles.main = shuffledMain;
      }

      return newPiles;
    });

    setIsShuffled(!isShuffled);
  };

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
      console.log(e.clientX, rect.left)
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

  // Mobile swipe handling
  const handleSwipe = (direction) => {
    if (piles.main.length === 0) return;

    if (direction === "left") {
      dontKnow();
    } else if (direction === "right") {
      know();
    }
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
        case "s":
          toggleShuffle();
          break;
        case "Enter":
          if (piles.main.length === 0) {
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
  }, [undo, dontKnow, flip, know, skip]);

  const CardStack = ({ pileName, cards, size = "md" }) => {
    const isSmall = size === "sm";
    const isExtraSmall = size === "xs"
    const isMainPile = pileName === "main";
    const isDraggable = !isMobile || isMainPile;

    const maxCards = isMobile
      ? MAX_SMALL_CARD_STACK_HEIGHT/5
      : MAX_SMALL_CARD_STACK_HEIGHT;

    return (
      <div
        id={`pile-${pileName}`}
        className={`card-stack relative flex items-end justify-center ${
          isSmall
            ? "w-[226px] h-[126px]"
            : isExtraSmall
            ? "w-[169.5px] h-[94.5px]"
            : "w-[600px] h-[310px]"
        }`}
        style={
          isSmall
            ? {
                marginBottom: `${
                  cards.length <= maxCards ? cards.length * 10 : maxCards * 10
                }px`,
              }
            : {}
        }
      >
        <AnimatePresence>
          {cards.slice(0, maxCards).map((card, i) => (
            <motion.div
              key={card.id}
              layoutId={card.id}
              drag={isDraggable}
              onDragStart={() => {
                if (isDraggable) {
                  draggedCardRef.current = card;
                }
              }}
              onDragEnd={(e) => {
                if (isMobile && isMainPile && i === 0) {
                  console.log(e.pageX / window.innerWidth);
                  // Handle swipe gestures
                  if (e.pageX / window.innerWidth < 0.4) {
                    handleSwipe("left");
                    return;
                  } else if (e.pageX / window.innerWidth > 0.6) {
                    handleSwipe("right");
                    return;
                  }
                }
                if (isDraggable) {
                  setTimeout(() => (draggedCardRef.current = null), 10);
                  onCardDragEnd(e, card);
                }
              }}
              dragMomentum={false}
              whileDrag={
                isDraggable
                  ? {
                      scale: isSmall ? 1.1 : isMobile ? 0.9 : 0.8,
                      rotate: 3,
                      zIndex: 9999,
                    }
                  : {}
              }
              // Mobile swipe gestures for main pile cards
              dragConstraints={
                isMobile && isMainPile && i === 0
                  ? { left: -200, right: 200, top: 0, bottom: 0 }
                  : {}
              }
              onDrag={(event, info) => {
                if (isMobile && isMainPile && i === 0) {
                  // Visual feedback during swipe
                  if (Math.abs(info.offset.x) > 100) {
                    // Could add visual feedback here
                  }
                }
              }}
              //   onDragEnd={(event, info) => {
              //     if (isMobile && isMainPile && i === 0) {
              //       // Handle swipe gestures
              //       if (info.offset.x < -100) {
              //         handleSwipe("left");
              //         return;
              //       } else if (info.offset.x > 100) {
              //         handleSwipe("right");
              //         return;
              //       }
              //     }

              //     if (isDraggable) {
              //       setTimeout(() => (draggedCardRef.current = null), 10);
              //       onCardDragEnd(event, card);
              //     }
              //   }}
              className={
                isDraggable
                  ? "absolute cursor-grab active:cursor-grabbing"
                  : "absolute"
              }
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
                size={isMobile && isSmall ? "mobile" : size}
                flipped={pileName === "main" && i === 0 && flipped}
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
          {size == "md" && !isMobile && (
            <div
              className="absolute -left-12 bottom-0 w-10"
              style={{ perspective: "200px" }}
            >
              {[...cards].reverse().map((card, i) => (
                <motion.div
                  key={card.id + "mini"}
                  layoutId={card.id + "mini"}
                  className="w-full absolute flashcard-shadow aspect-[1.79] bg-white rounded-sm"
                  style={{
                    bottom: `${i * 3}px`,
                    zIndex: i,
                    transform: `rotateX(20deg)`,
                    boxShadow: "0 1px 7px rgba(0,0,0,0.08)",
                  }}
                  transition={{ duration: 0.1 }}
                ></motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="w-full h-screen flex flex-col justify-between p-4 overflow-hidden">
        {/* Main card area */}
        <div className="flex-1 flex flex-col items-center justify-center relative mt-24">
          <CardStack pileName="main" size="sm" cards={piles.main} />

          {/* Completion message */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 transition-opacity duration-500 ${
              piles.main.length < 1 && "opacity-90 flex"
            }`}
          >
            <h1 className="text-3xl font-bold text-[#303030] mb-2">
              Well done!
            </h1>
            <h2 className="text-lg mb-4 text-[#7C7C7C]">
              You have assessed your knowledge of{" "}
              <span className="text-[#303030]">Common French Words</span>
            </h2>
            <div className="text-[#6AAD6A] text-xl mb-2">
              You know: {piles.know.length} Cards
            </div>
            <div className="text-[#C98282] text-xl mb-4">
              You are still learning: {piles.dontKnow.length} Cards
            </div>
            <div className="flex gap-3">
              <button
                disabled={piles.main.length > 0}
                onClick={undo}
                className="bg-white rounded-xl px-4 py-2 flashcard-shadow cursor-pointer transition-all hover:scale-105"
              >
                Back
              </button>
              <button
                disabled={piles.main.length > 0}
                onClick={() => setRound((prev) => prev + 1)}
                className="bg-[#CBF2CB] outline-2 outline-[#BFEBBF] rounded-xl px-8 py-2 flashcard-shadow cursor-pointer transition-all hover:scale-105"
              >
                Continue &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Bottom piles */}
        <div className="flex justify-between gap-4 pb-20">
          {/* Don't Know pile */}
          <div className="flex-1 flex flex-col items-center">
            <div className="text-sm font-bold text-[#303030] mb-4">
              Don't Know ({piles.dontKnow.length})
            </div>
            <div className="w-full max-w-[120px] h-[80px] relative">
              <div
                id="pile-dontKnow"
                className="absolute inset-0 flex items-end justify-center"
              >
                {piles.dontKnow.length > 0 ? (
                  <CardStack
                    pileName="dontKnow"
                    size="xs"
                    cards={piles.dontKnow.slice(0, 3)}
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-[#FFCACA] border-2 border-[#F7C1C1] flex items-center justify-center text-xs text-gray-600">
                    Don't Know
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Know pile */}
          <div className="flex-1 flex flex-col items-center">
            <div className="text-sm font-bold text-[#303030] mb-4">
              Know ({piles.know.length})
            </div>
            <div className="w-full max-w-[120px] h-[80px] relative">
              <div
                id="pile-know"
                className="absolute inset-0 flex items-end justify-center"
              >
                {piles.know.length > 0 ? (
                  <CardStack
                    pileName="know"
                    size="xs"
                    cards={piles.know.slice(0, 3)}
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-[#CBF2CB] border-2 border-[#BFEBBF] flex items-center justify-center text-xs text-gray-600">
                    Know
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Control buttons */}
        <div
          className={`flex gap-2 justify-center mb-26 transition-all ${
            piles.main.length < 1 && "opacity-0"
          }`}
        >
          <button
            onClick={undo}
            className="px-4 py-2 text-xs text-gray-600 bg-white rounded-lg flashcard-shadow transition-all cursor-pointer hover:scale-105"
          >
            Back
          </button>
          <button
            onClick={dontKnow}
            className="px-4 py-2 text-xs text-gray-600 bg-[#FFCACA] rounded-lg flashcard-shadow transition-all cursor-pointer hover:scale-105"
          >
            Don't Know
          </button>
          <button
            onClick={flip}
            className="px-4 py-2 text-xs text-gray-600 bg-white rounded-lg flashcard-shadow transition-all cursor-pointer hover:scale-105"
          >
            Flip
          </button>
          <button
            onClick={know}
            className="px-4 py-2 text-xs text-gray-600 bg-[#CBF2CB] rounded-lg flashcard-shadow transition-all cursor-pointer hover:scale-105"
          >
            Know
          </button>
          <button
            onClick={skip}
            className="px-4 py-2 text-xs text-gray-600 bg-white rounded-lg flashcard-shadow transition-all cursor-pointer hover:scale-105"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  // Desktop layout (original)
  return (
    <div className="w-full max-w-[100rem] mx-auto h-screen flex justify-center items-center pt-12 overflow-hidden">
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
              onClick={() => setRound((prev) => prev + 1)}
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

export default AssessScreen;
