import React, { useEffect, useState } from "react";
import Modal from "./UI/Modal";
import ViewSet from "./ViewSet";
import Link from "next/link";

const SetModal = ({ setData, unit, setModalOpen, setSetModalOpen, piles }) => {
  const [set, setSet] = useState(piles.main);

  return (
    <Modal isOpen={setModalOpen} onClose={() => setSetModalOpen(false)}>
      <h2 className="font-semibold uppercase text-[#6D6D6D] text-sm">
        {unit.name}
      </h2>
      <h2 className="text-4xl font-semibold mb-4 uppercase">{setData.name}</h2>
      <div className="w-[808px] h-[458px] bg-[#f1f1f1] border-2 border-[#E8E8E8] flashcard-shadow-dark rounded-2xl p-5 overflow-y-scroll">
        <ViewSet set={set} setSet={setSet} />
      </div>
      <div className="w-full flex justify-end mt-5 gap-3 font-bold text-[#303030]">
        <Link
          href={"/set/id"}
          className="px-8 py-2 rounded-xl bg-white outline-2 outline-[#E8E8E8] cursor-pointer transition-all flashcard-shadow-dark hover:scale-102"
        >
          View
        </Link>
        <Link
          href={"/learn/id"}
          className="px-8 py-2 rounded-xl bg-[#f1f1f1] outline-2 outline-[#E8E8E8] cursor-pointer transition-all flashcard-shadow-dark hover:scale-102"
        >
          Learn
        </Link>
      </div>
    </Modal>
  );
};

export default SetModal;
