import React, { useState, useEffect } from "react";
import Modal from "./UI/Modal";
import { useFlashcards } from "@/utils/hooks/useFlashcards";
import { Loader2 } from "lucide-react";

const EditCollectionTextModal = ({ isOpen, onClose, collection, onCollectionUpdate }) => {
  const { updateCollection } = useFlashcards();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.name);
    } else {
      setName("");
    }
  }, [collection, isOpen]);

  const handleUpdate = async () => {
    if (!collection || !name.trim()) return;

    setIsLoading(true);
    const updatedCollection = await updateCollection(collection.id, { name });
    setIsLoading(false);

    if (updatedCollection) {
      onCollectionUpdate(updatedCollection);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4 min-w-xl">Edit Collection Name</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-white flashcard-shadow-dark rounded-2xl text-xl font-bold outline-none p-2 px-3"
        placeholder="Collection name"
        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
      />
      <div className="w-full flex justify-end mt-6 gap-3 font-bold text-[#303030]">
        <button
          onClick={onClose}
          className="px-8 py-2 rounded-xl bg-[#F1F1F1] outline-2 outline-[#E8E8E8] cursor-pointer transition-all flashcard-shadow-dark hover:scale-102"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          disabled={isLoading}
          className="px-8 py-2 rounded-xl bg-[#CBF2CB] outline-2 outline-[#BFEBBF] cursor-pointer transition-all flashcard-shadow-dark hover:scale-102 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-13 animate-spin" />
          ) : (
            "Update"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default EditCollectionTextModal;
