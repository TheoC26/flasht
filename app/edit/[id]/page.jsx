"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import TopBar from "@/components/TopBar";
import FlashcardInput from "@/components/FlashcardInput";
import ListItem from "@/components/UI/ListItem";
import withAuth from "@/utils/withAuth";
import { useUser } from "@/utils/hooks/useUser";
import { useFlashcards } from "@/utils/hooks/useFlashcards";
import { useRouter, useParams } from "next/navigation"; // Import useParams
import { Edit, Loader2, Trash } from "lucide-react";
import { Reorder } from "framer-motion";
import FloatingMenuBar from "@/components/UI/FloatingMenuBar";
import EditCardModal from "@/components/EditCardModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

const EditPageScreen = () => {
  const { user } = useUser();
  const { getCollections, getSet, updateSet, createCollection } =
    useFlashcards();
  const router = useRouter();
  const { id: setId } = useParams(); // Get set ID from URL

  const [collectionSelectionOpen, setCollectionSelectionOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionName, setCollectionName] = useState("");
  const [name, setName] = useState("");

  const [floatingMenuBar, setFloatingMenuBar] = useState(false);
  const [floatingMenuBarPos, setFloatingMenuBarPos] = useState({ x: 0, y: 0 });
  const [currentFloatingMenuBarCard, setCurrentFloatingMenuBarCard] =
    useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null); // State for card delete modal
  const [deletingSet, setDeletingSet] = useState(null); // State for set delete modal

  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);

  // AI suggestion state
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Store initial data for comparison
  const [initialName, setInitialName] = useState("");
  const [initialCollectionId, setInitialCollectionId] = useState(null);
  const [initialCards, setInitialCards] = useState([]);

  const flashcardInputRef = useRef();

  // Debounce timer for AI suggestions
  const suggestionTimerRef = useRef(null);

  const hasUnsavedChanges =() => {
    return name !== initialName ||
    selectedCollection?.id !== initialCollectionId ||
    JSON.stringify(cards) !== JSON.stringify(initialCards);
  }

  const handleCardUpdate = (updatedCard) => {
    const updatePile = (pile) =>
      pile.map((c) => (c.id === updatedCard.id ? updatedCard : c));

    if (cards) {
      setCards(updatePile(cards));
    }
  };

  const handleDeleteSuccess = (deletedCardId) => {
    if (cards) {
      setCards(cards.filter((c) => c.id !== deletedCardId));
    }
  };

  const handleSetDeleteSuccess = () => {
    router.push('/home');
  };

  // Function to generate AI suggestion for flashcard back
  const generateAISuggestion = useCallback(
    async (frontText) => {
      if (!frontText.trim()) {
        setAiSuggestions((prev) => ({
          ...prev,
          [cards[currentCard].id]: "",
        }));
        return;
      }

      setIsGeneratingSuggestion(true);
      try {
        const payload = {
          title: name,
          collection: selectedCollection?.name || "",
          cards: cards,
          currentCardIndex: currentCard,
        };

        const response = await fetch("/api/generate-suggestion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          const suggestion = data.suggestion;

          setAiSuggestions((prev) => ({
            ...prev,
            [cards[currentCard].id]: suggestion,
          }));
        }
      } catch (error) {
        console.error("Error generating AI suggestion:", error);
      } finally {
        setIsGeneratingSuggestion(false);
      }
    },
    [cards, currentCard, name, selectedCollection]
  );

  // Debounced function to call AI suggestion
  const debouncedGenerateSuggestion = useCallback(
    (frontText) => {
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }

      suggestionTimerRef.current = setTimeout(() => {
        generateAISuggestion(frontText);
      }, 200); // .1 second debounce
    },
    [generateAISuggestion]
  );

  // Function to auto-fill back card with suggestion
  const autoFillWithSuggestion = useCallback(() => {
    const currentCardId = cards[currentCard]?.id;
    const suggestion = aiSuggestions[currentCardId];

    if (suggestion) {
      const newCards = [...cards];
      newCards[currentCard].back = suggestion;
      setCards(newCards);

      // Update the flashcard input component
      if (flashcardInputRef.current) {
        flashcardInputRef.current.setBackText(suggestion);
      }
    }
  }, [cards, currentCard, aiSuggestions]);

  // Fetch collections
  useEffect(() => {
    if (user) {
      const fetchCollections = async () => {
        const userCollections = await getCollections(user.id);
        if (userCollections) {
          setCollections(userCollections);
        }
      };
      fetchCollections();
    }
  }, [user]);

  // Fetch the existing set data
  useEffect(() => {
    if (setId && collections.length > 0) {
      const fetchSet = async () => {
        setIsLoading(true);
        const setData = await getSet(setId);
        if (setData) {
          setName(setData.info.name);
          setCards(setData.cards);
          setInitialName(setData.info.name);
          setInitialCards(setData.cards);
          setInitialCollectionId(setData.info.collection_id);
          const initialCollection = collections.find(
            (c) => c.id === setData.info.collection_id
          );
          if (initialCollection) {
            setSelectedCollection(initialCollection);
            setCollectionName(initialCollection.name);
          }
        }
        setIsLoading(false);
      };
      fetchSet();
    }
  }, [setId, collections]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        console.log("hasUnsavedChanges");
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // --- Intercept client-side navigation ---
  // Wrap router.push with a confirmation
  const guardedPush = (url) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Leave without saving?"
      );
      if (!confirmLeave) return;
    }
    router.push(url);
  };

  const handleUpdateSet = async () => {
    setUpdateLoading(true);
    const filteredCards = cards.filter(
      (card) => card.front.trim() && card.back.trim()
    );

    if (!name.trim()) {
      alert("Please enter a name for the set.");
      setUpdateLoading(false);
      return;
    }
    if (!selectedCollection) {
      alert("Please select a collection.");
      setUpdateLoading(false);
      return;
    }

    if (user) {
      const result = await updateSet(
        setId,
        { name, collection_id: selectedCollection.id },
        filteredCards
      );
      if (result) {
        setInitialName(name);
        setInitialCards(filteredCards);
        setInitialCollectionId(selectedCollection.id);
        router.push(`/set/${result.id}`);
      } else {
        alert("Failed to update set.");
      }
      setUpdateLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (collectionName.trim() && user) {
      const newCollection = await createCollection(collectionName, user.id);
      if (newCollection) {
        setCollections([...collections, newCollection]);
        setSelectedCollection(newCollection);
        setCollectionSelectionOpen(true);
      }
    }
  };

  const handleNext = () => {
    if (currentCard === cards.length - 1) {
      if (
        cards[currentCard].front.trim() !== "" &&
        cards[currentCard].back.trim() !== ""
      ) {
        const newCardId = uuidv4();
        setCards([
          ...cards,
          { id: newCardId, index: cards.length, front: "", back: "" },
        ]);
        setCurrentCard(cards.length);
        flashcardInputRef.current.onNext();
      }
    } else {
      setCurrentCard(currentCard + 1);
    }
  };

  const handleBack = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  const handleCardClick = (index) => {
    setCurrentCard(index);
    // Clear any existing AI suggestions when switching cards
    setAiSuggestions((prev) => {
      const newSuggestions = { ...prev };
      // Keep suggestions for all cards, just ensure current card has latest
      return newSuggestions;
    });
  };

  if (isLoading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#F1F1F1]">
        <TopBar isHome={false} loading={isLoading} />
        <div>Study tip: reading the syllabus counts as preparation</div>
      </main>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#F1F1F1]">
      <TopBar name={name} collection={collectionName} isHome={false} />
      <EditCardModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        card={editingCard}
        onCardUpdate={handleCardUpdate}
      />
      <DeleteConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        item={deletingItem}
        onDeleteSuccess={handleDeleteSuccess}
      />
      <DeleteConfirmationModal
        isOpen={!!deletingSet}
        onClose={() => setDeletingSet(null)}
        item={deletingSet}
        onDeleteSuccess={handleSetDeleteSuccess}
      />
      {collectionSelectionOpen && (
        <button
          className="fixed inset-0 z-20"
          onClick={() => setCollectionSelectionOpen(false)}
        ></button>
      )}
      <div className="mt-28 w-2xl flex gap-2">
        <input
          className="flex-1 bg-white flashcard-shadow-dark rounded-2xl text-xl font-bold outline-none p-2 px-3"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div
          className={`bg-white flex justify-between w-50 flashcard-shadow-dark rounded-2xl text-xl font-bold outline-none p-2 px-3 relative ${
            !selectedCollection && "text-[#979797]"
          }`}
        >
          <input
            className="w-40 outline-none"
            placeholder="Collection"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            onFocus={() => setCollectionSelectionOpen(true)}
          />
          <button
            className={`transition-all duration-75 w-3 ${
              collectionSelectionOpen ? "-rotate-90" : "rotate-90"
            }`}
            onClick={() => setCollectionSelectionOpen(!collectionSelectionOpen)}
          >
            &gt;
          </button>
          {collectionSelectionOpen && (
            <div className="absolute z-30 text-[#303030] flashcard-shadow-dark left-1/2 -translate-x-1/2 top-12 rounded-2xl w-50 max-h-50 overflow-y-scroll p-2 pb-1 bg-white">
              {collections
                .filter((col) =>
                  collectionName
                    ? col.name
                        .toLowerCase()
                        .includes(collectionName.toLowerCase())
                    : true
                )
                .map((col, i) => (
                  <button
                    onClick={() => {
                      setSelectedCollection(col);
                      setCollectionName(col.name);
                      setCollectionSelectionOpen(false);
                    }}
                    key={i}
                    className={`text-left p-1 w-full rounded-xl transition-all cursor-pointer line-clamp-2 hover:bg-[#f1f1f1]`}
                  >
                    {col.name}
                  </button>
                ))}
              <button
                onClick={handleCreateCollection}
                className={`p-1 mt-1 w-full rounded-xl text-center transition-all cursor-pointer line-clamp-2 border-2 border-[#D7D7D7] bg-[#f1f1f1] flashcard-shadow-dark hover:scale-102`}
              >
                Create new +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Flashcard Section */}
      <div className="mt-16 w-4xl font-bold text-[#303030] text-xl">
        <FlashcardInput
          ref={flashcardInputRef}
          onFrontChange={(text) => {
            const newCards = [...cards];
            if (newCards[currentCard]) {
              newCards[currentCard].front = text;
              setCards(newCards);
            }
            debouncedGenerateSuggestion(text);
          }}
          onBackChange={(text) => {
            const newCards = [...cards];
            if (newCards[currentCard]) {
              newCards[currentCard].back = text;
              setCards(newCards);
            }
          }}
          frontText={cards[currentCard]?.front || ""}
          backText={cards[currentCard]?.back || ""}
          frontPlaceholder="Front text"
          backPlaceholder="Back text"
          handleBack={handleBack}
          handleNext={handleNext}
          aiSuggestion={aiSuggestions[cards[currentCard]?.id]}
          isGeneratingSuggestion={isGeneratingSuggestion}
          onAutoFillSuggestion={autoFillWithSuggestion}
        />
      </div>

      {/* All Flashcards Section */}
      <div className="w-2xl mt-24 mb-24 font-bold text-[#303030]">
        <Reorder.Group
          axis="y"
          values={cards}
          onReorder={setCards}
          className="flex-col mt-3 pb-6"
        >
          {cards.map((card, index) => (
            <Reorder.Item key={card.id} value={card}>
              <ListItem
                key={card.id + card.front}
                card={card}
                setCurrentFloatingMenuBarCard={setCurrentFloatingMenuBarCard}
                onClick={() => handleCardClick(index)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFloatingMenuBar(true);
                  setFloatingMenuBarPos({ x: e.clientX, y: e.clientY });
                  setCurrentFloatingMenuBarCard(card);
                }}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <div className="w-full fixed bottom-0 gap-3 left-0 right-0 flex justify-end pr-6 bg-gradient-to-t from-[#f1f1f1] to-transparent pb-6">
          <button
            onClick={handleUpdateSet}
            className="bg-white px-6 py-3 rounded-2xl flashcard-shadow cursor-pointer transition-all hover:scale-105 hover:bg-[#CBF2CB]"
          >
            {updateLoading ? (
              <Loader2 className="w-18 animate-spin" color="#476b47" />
            ) : (
              "Update Set"
            )}
          </button>
          <button
            onClick={() => setDeletingSet({ id: setId, name: name, type: 'set' })}
            className="bg-white px-6 py-3 rounded-2xl flashcard-shadow cursor-pointer transition-all hover:scale-105 hover:bg-[#FFCACA]"
          >
            {deleteLoading ? (
              <Loader2 className="w-18 animate-spin" color="#476b47" />
            ) : (
              "Delete Set"
            )}
          </button>
        </div>
      </div>
      <FloatingMenuBar
        isOpen={floatingMenuBar}
        onClose={() => setFloatingMenuBar(false)}
        posX={floatingMenuBarPos.x}
        posY={floatingMenuBarPos.y}
      >
        <div className="flex flex-col">
          <button
            onClick={() => {
              setEditingCard(currentFloatingMenuBarCard);
              setFloatingMenuBar(false);
            }}
            className="hover:bg-[#F1F1F1] rounded-xl p-2 px-2 text-left flex items-center justify-between"
          >
            <div>Edit</div>
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              setDeletingItem({
                id: currentFloatingMenuBarCard.id,
                type: "card",
              });
              setFloatingMenuBar(false);
            }}
            className="hover:bg-[#FFCACA] rounded-xl p-2 px-2 text-left flex items-center justify-between"
          >
            <div>Delete</div>
            <Trash size={16} />
          </button>
        </div>
      </FloatingMenuBar>
    </div>
  );
};

export default withAuth(EditPageScreen);
