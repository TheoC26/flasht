import React, { useState, useEffect } from "react";
import Modal from "./UI/Modal";
import FlashcardInput from "./FlashcardInput";
import { useFlashcards } from "@/utils/hooks/useFlashcards";
import { Loader, Loader2 } from "lucide-react";

const EditCardModal = ({ isOpen, onClose, card, onCardUpdate }) => {
  const { updateCard } = useFlashcards();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false)

  // Load card data into local state when modal opens
  useEffect(() => {
    if (card) {
      setFront(card.front || "");
      setBack(card.back || "");
    } else {
      setFront("");
      setBack("");
    }
  }, [card, isOpen]);

  const handleUpdate = async () => {
    if (!card) return;
    setUpdateLoading(true)
    const updatedCard = await updateCard(card.id, { front, back });
    if (updatedCard) {
      onCardUpdate(updatedCard);
      setUpdateLoading(false)
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">Edit Flashcard</h2>
      <div className="w-[600px] font-bold">
        <FlashcardInput
          frontText={front}
          backText={back}
          onFrontChange={setFront}
          onBackChange={setBack}
          frontPlaceholder="Front text"
          backPlaceholder="Back text"
          showNavButtons={false} // 🚀 hide Back/Next in modal
          handleNext={() => {
            handleUpdate;
          }}
        />
      </div>
      <div className="w-full flex justify-end mt-5 gap-3 font-bold text-[#303030]">
        <button
          onClick={onClose}
          className="px-8 py-2 rounded-xl bg-white outline-2 outline-[#E8E8E8] cursor-pointer transition-all flashcard-shadow-dark hover:scale-102"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          className="px-8 py-2 rounded-xl bg-[#CBF2CB] outline-2 outline-[#BFEBBF] cursor-pointer transition-all flashcard-shadow-dark hover:scale-102"
        >
          {updateLoading ? (
            <Loader2 className="w-13 animate-spin" color="#476b47" />
          ) : (
            "Update"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default EditCardModal;
