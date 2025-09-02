"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EllipsisVertical, Repeat2, Shuffle } from "lucide-react";

export default function Flashcard({
  card,
  size = "md",
  flipped = false,
  isShuffled,
  toggleShuffle = () => {},
  onContextMenu,
  setCurrentFloatingMenuBarCard,
}) {
  const [isFlipped, setIsFlipped] = useState(flipped);

  useEffect(() => {
    setIsFlipped(flipped);
  }, [flipped]);

  const isMain = size == "md";
  const isSmall = size === "sm";
  const isMobile = size === "mobile";
  const isExtraSmall = size === "xs";
  const isGrid = size === "grid";

  const handleCardClick = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <motion.div
      className={`relative ${
        isSmall
          ? "w-[226px] h-[126px]"
          : isExtraSmall
          ? "w-[169.5px] h-[94.5px]"
          : isMobile
          ? "w-[339px] h-[189px]"
          : isGrid
          ? "w-full aspect-[1.79]"
          : "w-[585px] h-[326.667px]"
      } cursor-pointer rounded-2xl select-none`}
      onClick={handleCardClick}
      style={{ transformStyle: "preserve-3d" }}
      initial={{ rotateX: 0 }}
      animate={{ rotateX: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      onContextMenu={(e) => {
        e.preventDefault();
        setCurrentFloatingMenuBarCard(card);
        onContextMenu(e);
      }}
    >
      <div
        className={`absolute w-full h-full bg-white border-2 border-[#F7F7F7] rounded-xl text-center flex flashcard-shadow items-center justify-center ${
          isSmall || isGrid ? "text-sm" : isExtraSmall ? "text-xs" : "text-4xl"
        } font-bold text-[#303030] backface-hidden`}
        style={{ transform: "rotateX(0deg)" }}
      >
        {isMain && (
          <>
            <button className="absolute top-2 right-9 p-1 rounded-lg transition-all hover:bg-[#F1F1F1] cursor-pointer">
              <Shuffle
                color={isShuffled ? "#303030" : "#959595"}
                size={20}
                onClick={toggleShuffle}
              />
            </button>
            <button className="absolute top-1.5 right-16 p-1 rounded-lg transition-all hover:bg-[#F1F1F1] cursor-pointer">
              <Repeat2
                color={"#959595"}
                size={24}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            </button>
          </>
        )}
        {!isSmall && (
          <button
            className="absolute top-[7px] right-1.5 p-1 rounded-lg transition-all hover:bg-[#F1F1F1] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentFloatingMenuBarCard(card);
              onContextMenu(e);
            }}
          >
            <EllipsisVertical color={"#303030"} size={22} />
          </button>
        )}
        {card.front}
      </div>
      <div
        className={`absolute w-full h-full bg-[#F7F7F7] rounded-xl flex flashcard-shadow text-center items-center justify-center ${
          isSmall || isGrid
            ? "text-base"
            : isExtraSmall
            ? "text-sm"
            : "text-4xl"
        } font-bold text-[#303030] backface-hidden`}
        style={{ transform: "rotateX(180deg)" }}
      >
        {card.back}
      </div>
    </motion.div>
  );
}
