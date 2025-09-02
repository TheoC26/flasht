import { CircleCheck } from 'lucide-react';
import React, { useState } from 'react'
import PricingArrow from './SVGs/PricingArrow';

const PaymentWall = ({onClose}) => {
    const [isAnual, setIsAnual] = useState(true)
  return (
    <div className="fixed inset-0 bg-[#f1f1f1] text-[#303030] font-bold z-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl mb-20">
        Actually learn with the most effective flashcard platform.
      </h1>
      <div>
        <div
          className={`flex bg-white flashcard-shadow mb-4 py-1 mx-auto rounded-xl text-xs w-fit relative transition-all`}
        >
          <PricingArrow className={"absolute -top-14 -right-18"} />
          <div
            className={`absolute top-0 bottom-0 transition-all ${
              !isAnual ? "w-20 left-0" : "w-21 left-19.5"
            } bg-[#F1F1F1] outline-1 outline-[#D7D7D7] rounded-xl text-xs`}
          ></div>
          <button
            className="z-20 px-4.5 py-1 cursor-pointer"
            onClick={() => setIsAnual(false)}
          >
            Monthly
          </button>
          <button
            className="z-20 px-4.5 py-1 cursor-pointer"
            onClick={() => setIsAnual(true)}
          >
            Annually
          </button>
        </div>
        <div className="p-6 bg-white rounded-[20px] flashcard-shadow-dark w-96">
          <h2 className="text-3xl text-[#959595]">
            Flasht <span className="text-[#303030]">Pro</span>
          </h2>
          <p className="-mt-1">Complete access to awesomeness</p>
          <div className="flex gap-1 items-baseline justify-start mt-3 -mb-3">
            <h1 className="text-7xl">{isAnual ? "2.99" : "5.99"}</h1>
            <p className="text-sm">/ month</p>
          </div>
          <p className="text-[#959595] text-base">
            billed {isAnual ? "35.99 yearly" : "5.99 monthly"}
          </p>
          <button className="w-full bg-[#CBF2CB] outline-2 outline-[#BFEBBF] rounded-2xl py-2.5 text-xl mt-4 flashcard-shadow cursor-pointer transition-all hover:scale-102">
            Try for free
          </button>
          <ul className="flex flex-col gap-1 text-base mt-5">
            <div className="flex gap-2 items-center">
              <CircleCheck size={16} strokeWidth={3} />
              <p>Unlimited flashcard sets</p>
            </div>
            <div className="flex gap-2 items-center">
              <CircleCheck size={16} strokeWidth={3} />
              <p>Designed for students</p>
            </div>
            <div className="flex gap-2 items-center">
              <CircleCheck size={16} strokeWidth={3} />
              <p>Auto complete flashcards</p>
            </div>
            <div className="flex gap-2 items-center">
              <CircleCheck size={16} strokeWidth={3} />
              <p>Proprietary research proved study method</p>
            </div>
            <div className="flex gap-2 items-center">
              <CircleCheck size={16} strokeWidth={3} />
              <p>Cancel anytime</p>
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PaymentWall