import React from "react";

const BottomBar = ({ piles, round }) => {
  const totalCards = piles && piles.main.length + piles.know.length + piles.dontKnow.length;
  return (
    <div className="fixed left-8 bottom-6 bg-white rounded-2xl flashcard-shadow font-bold text-[#303030] flex gap-4 p-3 px-4 z-50 transition-all group select-none hover:scale-105">
      <div className="flex gap-1">
        <div className="transition-all duration-300 overflow-hidden text-[#BEBEBE] max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100">
          Stage:{" "}
        </div>
        {round == 0 ? "Assess" : round % 2 == 1 ? "Learn" : "Test"}
      </div>
      <div className="flex">
        <div className="transition-all duration-300 overflow-hidden text-[#BEBEBE] max-w-0 opacity-0 whitespace-nowrap mr-1 group-hover:max-w-[180px] group-hover:opacity-100">
          Know/Don’t know/Total:
        </div>
        <span className="text-[#6AAD6A]">{piles && piles.know.length}</span>/
        <span className="text-[#C98282]">{piles && piles.dontKnow.length + piles.discard.length}</span>/<span>{totalCards}</span>
      </div>
      <div className="flex gap-1">
        <div className="transition-all duration-300 overflow-hidden text-[#BEBEBE] max-w-0 opacity-0 whitespace-nowrap group-hover:max-w-[120px] group-hover:opacity-100">
          Time spent:{" "}
        </div>
        12 min
      </div>
      <div className="flex gap-1">
        <div className="transition-all duration-300 overflow-hidden text-[#BEBEBE] max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100">
          Round:{" "}
        </div>
        {round}
      </div>
    </div>
  );
};

export default BottomBar;
