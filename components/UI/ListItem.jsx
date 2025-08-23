import { EllipsisVertical } from 'lucide-react';
import React from 'react'

const ListItem = ({card}) => {
  return (
    <div className="bg-white border-1 border-[#F7F7F7] flashcard-shadow rounded-xl w-full items-center flex p-1 mb-1.5">
      <div className="p-3 w-32 text-left">{card.front}</div>
      <div className="w-px h-10 my-auto bg-[#D7D7D7]"></div>
      <div className="p-3 px-5 flex-1">
        {card.back}
      </div>
      <div className="p-3">
        <EllipsisVertical color="#303030" />
      </div>
    </div>
  );
}

export default ListItem