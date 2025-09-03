import React, { useEffect, useState } from "react";
import Modal from "./UI/Modal";
import ViewSet from "./ViewSet";
import Link from "next/link";
import { useFlashcards } from "@/utils/hooks/useFlashcards";
import { Cog } from "lucide-react";

const SkeletonCard = () => (
  <div className="w-full h-[107px] bg-gray-200 animate-pulse rounded-lg"></div>
);

const SetModal = ({ setData, collection, setModalOpen, setSetModalOpen }) => {
  const { getSet } = useFlashcards();
  const [cards, setCards] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (setModalOpen && setData?.id) {
      setIsLoading(true);
      const fetchCards = async () => {
        const result = await getSet(setData.id);
        if (result && result.cards) {
          setCards(result.cards);
        }
        setIsLoading(false);
      };
      fetchCards();
    } else if (!setModalOpen) {
      // Reset state when modal closes
      setCards(null);
      setIsLoading(true);
    }
  }, [setModalOpen]);

  return (
    <Modal isOpen={setModalOpen} onClose={() => setSetModalOpen(false)}>
      <div className="group">
        <h2 className="font-semibold uppercase text-[#6D6D6D] text-sm group flex">
          {collection.name}
        </h2>
        <h2 className="text-4xl font-semibold mb-4 uppercase flex items-center justify-between">
          <div>{setData.name}</div>
          <Link
            href={"/edit/" + setData.id}
            className="h-0 overflow-hidden transition-all group-hover:h-7 cursor-pointer hover:scale-105"
          >
            <Cog size={24} strokeWidth={2.5} color="#303030" />
          </Link>
        </h2>
      </div>
      <div className="w-[808px] h-[458px] bg-[#f1f1f1] border-2 border-[#E8E8E8] flashcard-shadow-dark rounded-2xl p-5 overflow-y-scroll">
        {isLoading ? (
          <div className="w-[600px] aspect-[1.79] bg-white rounded-xl mx-auto border-2 border-[#F7F7F7] animate-pulse"></div>
        ) : (
          <ViewSet set={cards} setSet={setCards} setData={setData} />
        )}
      </div>
      <div className="w-full flex justify-end mt-5 gap-3 font-bold text-[#303030]">
        <Link
          href={"/set/" + setData.id}
          className="px-8 py-2 rounded-xl bg-white outline-2 outline-[#E8E8E8] cursor-pointer transition-all flashcard-shadow-dark hover:scale-102"
        >
          View
        </Link>
        <Link
          href={"/learn/" + setData.id}
          className="px-8 py-2 rounded-xl bg-[#f1f1f1] outline-2 outline-[#E8E8E8] cursor-pointer transition-all flashcard-shadow-dark hover:scale-102"
        >
          Learn
        </Link>
      </div>
    </Modal>
  );
};

export default SetModal;
