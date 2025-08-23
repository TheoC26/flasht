import React from 'react'

const FlashcardStack = ({title}) => {
  return (
    <div className="w-full flex flex-col-reverse transition-all hover:scale-102 cursor-pointer">
      <div className="w-full aspect-[1.79] bg-white rounded-xl flashcard-shadow-dark z-0"></div>
      <div className="w-full aspect-[1.79] bg-white rounded-xl flashcard-shadow-dark -mb-30 z-10"></div>
      <div className="w-full aspect-[1.79] bg-white rounded-xl flashcard-shadow-dark -mb-30 z-20 grid place-items-center">
        <h2 className='uppercase text-[#303030]'>{title}</h2>
      </div>
    </div>
  );
}

export default FlashcardStack