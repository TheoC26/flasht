import React, { useState } from "react";
import Modal from "./UI/Modal";
import { useFlashcards } from "@/utils/hooks/useFlashcards";
import { Loader2 } from "lucide-react";

const DeleteConfirmationModal = ({ isOpen, onClose, item, onDeleteSuccess }) => {
  const { deleteCard, deleteSet, deleteCollection } = useFlashcards();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!item) return;

    setIsLoading(true);
    let result;

    switch (item.type) {
      case "card":
        result = await deleteCard(item.id);
        break;
      case "set":
        result = await deleteSet(item.id);
        break;
      case "collection":
        result = await deleteCollection(item.id);
        break;
      default:
        console.error("Unknown item type for deletion:", item.type);
        setIsLoading(false);
        return;
    }

    setIsLoading(false);
    if (result) {
      onDeleteSuccess(item.id);
      onClose();
    }
  };

  const itemTypeDisplay = item ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-2">{`Delete ${itemTypeDisplay}`}</h2>
      <p className="text-md text-[#6D6D6D]">
        {`Are you sure you want to delete `}
        {item?.name ? <span className="font-bold text-[#303030]">{item.name}</span> : "this card"}
        {`? This action cannot be undone.`}
      </p>
      <div className="w-full flex justify-end mt-6 gap-3 font-bold text-[#303030]">
        <button
          onClick={onClose}
          className="px-8 py-2 rounded-xl bg-[#F1F1F1] outline-2 outline-[#E8E8E8] cursor-pointer transition-all flashcard-shadow-dark hover:scale-102"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="px-8 py-2 rounded-xl bg-[#FFCACA] text-[#9C3A3A] outline-2 outline-[#F8B6B6] cursor-pointer transition-all flashcard-shadow-dark hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-13 animate-spin" />
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
