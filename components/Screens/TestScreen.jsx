import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAX_SMALL_CARD_STACK_HEIGHT } from "@/constants";

import Flashcard from "@/components/Flashcard";
import Link from "next/link";
import confetti from "canvas-confetti";
import FloatingMenuBar from "../UI/FloatingMenuBar";
import { Edit, Trash } from "lucide-react";
import EditCardModal from "../EditCardModal";
import DeleteConfirmationModal from "../DeleteConfirmationModal";

const TestScreen = ({ piles, setPiles, history, setHistory, setRound, restart, setInfo, isSetFlipped, handleToggleSetFlipped }) => {
  const draggedCardRef = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [floatingMenuBar, setFloatingMenuBar] = useState(false);
  const [floatingMenuBarPos, setFloatingMenuBarPos] = useState({ x: 0, y: 0 });
  const [currentFloatingMenuBarCard, setCurrentFloatingMenuBarCard] =
    useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // on scroll, set floating menu bar to false
  useEffect(() => {
    const closeMenu = () => setFloatingMenuBar(false);
    window.addEventListener("scroll", closeMenu);
    return () => window.removeEventListener("scroll", closeMenu);
  }, []);

  const handleCardUpdate = (updatedCard) => {
    setPiles((prevPiles) => {
      const newPiles = { ...prevPiles };
      for (const pileName in newPiles) {
        if (Array.isArray(newPiles[pileName])) {
            newPiles[pileName] = newPiles[pileName].map((card) =>
                card.id === updatedCard.id ? updatedCard : card
            );
        }
      }
      return newPiles;
    });
  };

  const handleDeleteSuccess = (deletedCardId) => {
    setPiles((prevPiles) => {
      const newPiles = { ...prevPiles };
      for (const pileName in newPiles) {
        if (Array.isArray(newPiles[pileName])) {
            newPiles[pileName] = newPiles[pileName].filter(
                (card) => card.id !== deletedCardId
            );
        }
      }
      return newPiles;
    });
  };

  // CONFETTITTTIII
  function makeConfetti() {
    var duration = 1.5 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function () {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

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

  const flip = () => setFlipped(!flipped);

  const next = () => {
    if (piles.dontKnow.length === 0) return;
    const card = piles.dontKnow[0];
    setHistory([
      ...history,
      { cardId: card.id, from: "dontKnow", to: "discard" },
    ]);
    setPiles((prev) => {
      const newPiles = { ...prev };
      newPiles.dontKnow = [...newPiles.dontKnow.slice(1)];
      newPiles.discard = [card, ...newPiles.discard];
      return newPiles;
    });
    setFlipped(false);
  };

  const know = () => {
    if (piles.dontKnow.length === 1 && piles.discard.length === 0)
      makeConfetti();
    if (piles.dontKnow.length === 0) return;
    const card = piles.dontKnow[0];
    setHistory([...history, { cardId: card.id, from: "dontKnow", to: "know" }]);
    setPiles((prev) => {
      const newPiles = { ...prev };
      newPiles.dontKnow = newPiles.dontKnow.slice(1);
      newPiles.know = [card, ...newPiles.know];
      return newPiles;
    });
    setFlipped(false);
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastMove = history[history.length - 1];
    const { cardId, from, to } = lastMove;

    if (from === "dontKnow" && to === "dontKnow") {
      setPiles((prev) => {
        const newPiles = { ...prev };
        const lastCard = newPiles.dontKnow[newPiles.dontKnow.length - 1];
        newPiles.dontKnow = [
          lastCard,
          ...newPiles.dontKnow.slice(0, newPiles.dontKnow.length - 1),
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
    const dropZones = ["know", "dontKnow"];
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
      if (editingCard || deletingItem) return; // Disable shortcuts if a modal is open
      switch (e.key) {
        case "1":
        case "ArrowLeft":
          undo();
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
          next();
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
  }, [undo, flip, know, next]);

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
                card={isSetFlipped ? { ...card, front: card.back, back: card.front } : card}
                size={size}
                flipped={pileName === "main" && i === 0 && flipped}
                isShuffled={isShuffled}
                toggleShuffle={toggleShuffle}
                setCurrentFloatingMenuBarCard={setCurrentFloatingMenuBarCard}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFloatingMenuBar(true);
                  setCurrentFloatingMenuBarCard(card);
                  setFloatingMenuBarPos({ x: e.clientX, y: e.clientY });
                }}
                setId={setInfo ? setInfo.id : null}
                toggleSetFlipped={handleToggleSetFlipped}
                isSetFlipped={isSetFlipped}
              />
            </motion.div>
          ))}
          {size == "md" && (
            <div
              className="absolute -left-12 bottom-0 w-10"
              style={{ perspective: "200px" }}
            >
              {[...cards].reverse().map((card, i) => (
                <motion.div
                  key={card.id + "mini"}
                  layoutId={card.id + "mini"}
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
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto flex justify-center items-end overflow-hidden">
      <EditCardModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        card={editingCard}
        onCardUpdate={handleCardUpdate}
      />
      <DeleteConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        item={deletingItem}
        onDeleteSuccess={handleDeleteSuccess}
      />
      <div className="flex flex-col items-center mr-20 mb-5 relative">
        <CardStack pileName="dontKnow" size="md" cards={piles.dontKnow} />
        <div
          className={`absolute text-[#303030] font-bold left-10 top-5 opacity-0 delay-300 duration-500 transition-opacity ${
            piles.dontKnow.length < 1 && "opacity-90 h-[310px]"
          }`}
        >
          <h1 className="text-6xl">
            {piles.discard.length == 0 ? "Congrats!" : "Well done!"}
          </h1>
          <h2 className="text-3xl mb-3 text-[#7C7C7C]">
            {piles.discard.length == 0
              ? "You have learned all of "
              : "You have tested your knowledge of "}
            <span className="text-[#303030]">Common French Words</span>
          </h2>
          <div className="text-[#6AAD6A] text-3xl">
            You know: {piles.know.length} Cards
          </div>
          <div className="text-[#C98282] text-3xl">
            You are still learning: {piles.discard.length} Cards
          </div>
          <div className="flex gap-5 text-2xl mt-5">
            <button
              onClick={undo}
              className="bg-white rounded-2xl p-2 px-4 flashcard-shadow cursor-pointer transition-all hover:scale-105"
            >
              Back
            </button>
            {piles.discard.length == 0 ? (
              <>
                <button
                  onClick={restart}
                  className="bg-white rounded-2xl p-2 px-4 flashcard-shadow cursor-pointer transition-all hover:scale-105"
                >
                  Restart
                </button>
                <Link
                  href={"/home"}
                  className="bg-[#CBF2CB] outline-2 outline-[#BFEBBF] rounded-2xl p-2 px-12 flashcard-shadow cursor-pointer transition-all hover:scale-105"
                >
                  Go home &gt;
                </Link>
              </>
            ) : (
              <button
                onClick={() => setRound((prev) => prev + 1)}
                className="bg-[#CBF2CB] outline-2 outline-[#BFEBBF] rounded-2xl p-2 px-12 flashcard-shadow cursor-pointer transition-all hover:scale-105"
              >
                Continue &gt;
              </button>
            )}
          </div>
        </div>
        <div className="absolute -left-10 -right-10 bottom-5 h-10 bg-gradient-to-b from-[#f1f1f100] to-[#f1f1f1] z-20"></div>
        <div className="absolute -left-10 -right-10 -bottom-[500px] h-[520px] bg-[#f1f1f1] z-20"></div>
        <div
          className={`mt-10 flex gap-3 z-30 justify-center font-bold transition-all ${
            piles.dontKnow.length < 1 && "opacity-0"
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
              onClick={next}
              className="px-6 py-2.5 select-none text-sm text-gray-600 bg-white rounded-xl flashcard-shadow transition-all cursor-pointer hover:scale-105"
            >
              Next
            </button>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[#BFBFBF]">
              5
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
          <button
            onClick={() => {
              setEditingCard(currentFloatingMenuBarCard);
              setFloatingMenuBar(false);
            }}
            className="hover:bg-[#F1F1F1] rounded-xl p-2 px-2 text-left flex items-center justify-between"
          >
            <div>Edit</div>
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              setDeletingItem({
                id: currentFloatingMenuBarCard.id,
                type: "card",
              });
              setFloatingMenuBar(false);
            }}
            className="hover:bg-[#FFCACA] rounded-xl p-2 px-2 text-left flex items-center justify-between"
          >
            <div>Delete</div>
            <Trash size={16} />
          </button>
        </div>
      </FloatingMenuBar>
    </div>
  );
};

export default TestScreen;
