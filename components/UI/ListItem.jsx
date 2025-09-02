import { EllipsisVertical } from "lucide-react";
import React from "react";

const ListItem = ({ card, onClick, current, onContextMenu, setCurrentFloatingMenuBarCard }) => {
  return (
    <div
      className={`bg-white border-1 border-[#F7F7F7] flashcard-shadow rounded-xl w-full items-center flex p-1 mb-1.5 cursor-pointer transition-all hover:scale-101 ${
        current && "bg-[#E9E9E9]"
      }`}
      onClick={onClick}
      // on two finger click, open floating menu bar
      onContextMenu={(e) => {
        e.preventDefault();
        setCurrentFloatingMenuBarCard(card);
        onContextMenu(e);
      }}
    >
      <div className="p-3 w-32 text-left overflow-scroll">{card.front}</div>
      <div className="w-px h-10 my-auto bg-[#D7D7D7]"></div>
      <div className="p-3 px-5 flex-1">{card.back}</div>
      <button className="m-2 p-1 rounded-lg transition-all hover:bg-[#F1F1F1] cursor-pointer" onClick={(e) => {
        setCurrentFloatingMenuBarCard(card);
        onContextMenu(e);
      }}>
        <EllipsisVertical color="#303030" />
      </button>
    </div>
  );
};

export default ListItem;