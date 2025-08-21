"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Flashcard({ card, size = "md", flipped = false }) {
  const [isFlipped, setIsFlipped] = useState(flipped);

  useEffect(() => {
    setIsFlipped(flipped)
  }, [flipped])

  const isSmall = size === "sm";
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
          : isGrid
          ? "w-full aspect-[1.79]"
          : "w-[585px] h-[326.667px]"
      } cursor-pointer rounded-2xl select-none`}
      onClick={handleCardClick}
      style={{ transformStyle: "preserve-3d" }}
      initial={{ rotateX: 0 }}
      animate={{ rotateX: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`absolute w-full h-full bg-white border-2 border-[#F7F7F7] rounded-xl flex flashcard-shadow items-center justify-center ${
          isSmall || isGrid ? "text-base" : "text-4xl"
        } font-bold text-[#303030] backface-hidden`}
        style={{ transform: "rotateX(0deg)" }}
      >
        {card.front}
      </div>
      <div
        className={`absolute w-full h-full bg-[#F7F7F7] rounded-xl flex flashcard-shadow items-center justify-center ${
          isSmall || isGrid ? "text-base" : "text-4xl"
        } font-bold text-[#303030] backface-hidden`}
        style={{ transform: "rotateX(180deg)" }}
      >
        {card.back}
      </div>
    </motion.div>
  );
}
