"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import TopBar from "@/components/TopBar";
import FlashcardInput from "@/components/FlashcardInput";
import ListItem from "@/components/UI/ListItem";
import withAuth from "@/utils/withAuth";
import { useUser } from "@/utils/hooks/useUser";
import { useFlashcards } from "@/utils/hooks/useFlashcards";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit, Loader2, Trash } from "lucide-react";
import { Reorder } from "framer-motion";
import FloatingMenuBar from "@/components/UI/FloatingMenuBar";
import EditCardModal from "@/components/EditCardModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

const CreatePageScreen = () => {
  const { user } = useUser();
  const { getCollections, createSet, createCollection } = useFlashcards();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCollection = searchParams.get("collection");
  const urlCollectionId = searchParams.get("collectionid");

  const [collectionSelectionOpen, setCollectionSelectionOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(
    urlCollectionId ? { name: urlCollection, id: urlCollectionId } : null
  );
  const [collectionName, setCollectionName] = useState(
    urlCollection ? urlCollection : ""
  );
  const [name, setName] = useState("");

  const [floatingMenuBar, setFloatingMenuBar] = useState(false);
  const [floatingMenuBarPos, setFloatingMenuBarPos] = useState({ x: 0, y: 0 });
  const [currentFloatingMenuBarCard, setCurrentFloatingMenuBarCard] =
    useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null); // State for delete modal

  const [focusedCard, setFocusedCard] = useState(null);
  const [frontFontSize, setFrontFontSize] = useState(24);
  const [backFontSize, setBackFontSize] = useState(24);

  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);

  // AI suggestion state
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  const [createLoading, setCreateLoading] = useState(false);

  const flashcardInputRef = useRef();

  // Refs for focusing editable divs
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const frontContainerRef = useRef(null);
  const backContainerRef = useRef(null);

  // Debounce timer for AI suggestions
  const suggestionTimerRef = useRef(null);

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

  const handleCreateSet = async () => {
    setCreateLoading(true);
    // Filter out cards that don't have BOTH a front AND a back
    const filteredCards = cards.filter(
      (card) => card.front.trim() && card.back.trim()
    );

    // If any card has a front but not a back, or a back but not a front, show alert
    const hasPartialCard = filteredCards.some(
      (card) =>
        (card.front.trim() && !card.back.trim()) ||
        (!card.front.trim() && card.back.trim())
    );
    if (hasPartialCard) {
      alert("Please make sure all flashcards have a front and back.");
      return;
    }

    if (!name.trim()) {
      alert("Please enter a name for the set.");
      return;
    }
    if (!selectedCollection) {
      alert("Please select a collection.");
      return;
    }
    if (filteredCards.some((card) => !card.front.trim() || !card.back.trim())) {
      alert("Please make sure all flashcards have a front and back.");
      return;
    }

    if (user) {
      const newSet = await createSet(
        name,
        selectedCollection.id,
        filteredCards,
        user.id
      );
      if (newSet) {
        router.push(`/set/${newSet.id}`);
        setCreateLoading(false);
      } else {
        setCreateLoading(false);
        alert("Failed to create set.");
      }
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

  // Auto-resize text to fit container
  const adjustFontSize = useCallback(
    (containerRef, textRef, setFontSize, currentFontSize) => {
      if (!containerRef.current || !textRef.current) return;

      const container = containerRef.current;
      const textElement = textRef.current;

      // Get container dimensions (subtract padding)
      const containerHeight = container.clientHeight - 24; // 12px padding top + 12px padding bottom
      const containerWidth = container.clientWidth - 24;

      // Start with current font size and adjust
      let fontSize = currentFontSize;
      textElement.style.fontSize = `${fontSize}px`;

      // If text is overflowing, reduce font size
      while (
        (textElement.scrollHeight > containerHeight ||
          textElement.scrollWidth > containerWidth) &&
        fontSize > 8
      ) {
        fontSize -= 0.5;
        textElement.style.fontSize = `${fontSize}px`;
      }

      // If text fits with room to spare, try to increase font size (up to default)
      while (
        fontSize < 24 &&
        textElement.scrollHeight <= containerHeight &&
        textElement.scrollWidth <= containerWidth
      ) {
        const testSize = fontSize + 0.5;
        textElement.style.fontSize = `${testSize}px`;

        if (
          textElement.scrollHeight > containerHeight ||
          textElement.scrollWidth > containerWidth
        ) {
          textElement.style.fontSize = `${fontSize}px`;
          break;
        }
        fontSize = testSize;
      }

      setFontSize(fontSize);
    },
    []
  );

  useEffect(() => {
    // check local state if theres already a set being made
    // else
    setCards([
      {
        id: uuidv4(),
        index: 0,
        front: ``,
        back: ``,
      },
    ]);
  }, []);

  useEffect(() => {
    if (cards.length > 1) {
      setCurrentCard(cards.length - 1);
    }
  }, [cards.length]);

  useEffect(() => {
    if (frontRef.current) {
      frontRef.current.innerHTML = cards[currentCard]?.front || "";
    }
    if (backRef.current) {
      backRef.current.innerHTML = cards[currentCard]?.back || "";
    }
  }, [currentCard, cards]);

  // Set up resize observers for auto-scaling text
  useEffect(() => {
    const frontObserver = new ResizeObserver(() => {
      if (cards[currentCard]?.front.trim()) {
        adjustFontSize(
          frontContainerRef,
          frontRef,
          setFrontFontSize,
          frontFontSize
        );
      }
    });

    const backObserver = new ResizeObserver(() => {
      if (cards[currentCard]?.back.trim()) {
        adjustFontSize(
          backContainerRef,
          backRef,
          setBackFontSize,
          backFontSize
        );
      }
    });

    if (frontRef.current) frontObserver.observe(frontRef.current);
    if (backRef.current) backObserver.observe(backRef.current);

    return () => {
      frontObserver.disconnect();
      backObserver.disconnect();
    };
  }, [cards, currentCard, adjustFontSize, frontFontSize, backFontSize]);

  // Track focus more reliably using document focus events
  useEffect(() => {
    const handleFocusChange = () => {
      const activeElement = document.activeElement;

      if (activeElement === frontRef.current) {
        setFocusedCard("front");
      } else if (activeElement === backRef.current) {
        setFocusedCard("back");
      } else {
        // Only clear focus if neither card is focused
        // Add a small delay to handle rapid focus changes
        setTimeout(() => {
          const currentActive = document.activeElement;
          if (
            currentActive !== frontRef.current &&
            currentActive !== backRef.current
          ) {
            setFocusedCard(null);
          }
        }, 10);
      }
    };

    // Listen for focus changes on the document
    document.addEventListener("focusin", handleFocusChange);
    document.addEventListener("focusout", handleFocusChange);

    return () => {
      document.removeEventListener("focusin", handleFocusChange);
      document.removeEventListener("focusout", handleFocusChange);
    };
  }, []);

  function collectionBlur() {
    const match = collections.find((col) =>
      collectionName
        ? col.name.toLowerCase().includes(collectionName.toLowerCase())
        : true
    );
    if (!match || collectionName == "") {
      setCollectionName("");
      setSelectedCollection(null);
    } else {
      setCollectionName(match.name);
      setSelectedCollection(match);
    }
  }

  function collectionSubmit() {
    const match = collections.find((col) =>
      collectionName
        ? col.name.toLowerCase().includes(collectionName.toLowerCase())
        : true
    );
    if (!match) return;
    setCollectionName(match.name);
    setSelectedCollection(match);
    setCollectionSelectionOpen(false);
  }

  const handleNext = () => {
    if (currentCard === cards.length - 1) {
      if (cards[currentCard].front != "" && cards[currentCard].back != "") {
        const newCardId = uuidv4();
        setCards([
          ...cards,
          {
            id: newCardId,
            index: cards.length,
            front: "",
            back: "",
          },
        ]);
        flashcardInputRef.current.onNext();

        // Clear AI suggestion for the new card
        setAiSuggestions((prev) => {
          const newSuggestions = { ...prev };
          delete newSuggestions[newCardId];
          return newSuggestions;
        });
      }
    } else {
      flashcardInputRef.current.setFrontText(cards[currentCard + 1].front);
      flashcardInputRef.current.setBackText(cards[currentCard + 1].back);
      setCurrentCard(currentCard + 1);
    }
  };

  const handleBack = () => {
    if (currentCard > 0) {
      flashcardInputRef.current.setFrontText(cards[currentCard - 1].front);
      flashcardInputRef.current.setBackText(cards[currentCard - 1].back);
      setCurrentCard(currentCard - 1);
      flashcardInputRef.current.onBack();
    }
  };

  const handleCardClick = (index) => {
    flashcardInputRef.current.setFrontText(cards[index].front);
    flashcardInputRef.current.setBackText(cards[index].back);
    flashcardInputRef.current.setFrontFocusedState(
      cards[index].front || cards[index].front.trim() !== ""
    );
    document.activeElement.blur();
    setCurrentCard(index);

    // Clear any existing AI suggestions when switching cards
    setAiSuggestions((prev) => {
      const newSuggestions = { ...prev };
      // Keep suggestions for all cards, just ensure current card has latest
      return newSuggestions;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          document.activeElement.blur();
          handleBack();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleBack, handleNext]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#F1F1F1]">
      <TopBar />
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
      {collectionSelectionOpen && (
        <button
          className="fixed inset-0 z-20"
          onClick={() => {
            collectionBlur();
            setCollectionSelectionOpen(false);
          }}
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
            onKeyDown={(e) => e.key == "Enter" && collectionSubmit()}
          />
          <button
            className={`transition-all duration-75 w-3 ${
              collectionSelectionOpen ? "-rotate-90" : "rotate-90"
            }`}
            onClick={() => {
              collectionSelectionOpen && collectionBlur();
              setCollectionSelectionOpen(!collectionSelectionOpen);
            }}
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
                    onClick={(e) => {
                      setSelectedCollection(col);
                      setCollectionName(col.name);
                      setCollectionSelectionOpen(false);
                    }}
                    key={i}
                    className={`text-left p-1 w-full rounded-xl transition-all cursor-pointer line-clamp-2 ${
                      i == 0
                        ? "bg-[#f1f1f1] hover:bg-[#eeeeee] mb-1"
                        : "hover:bg-[#f1f1f1]"
                    }`}
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
            newCards[currentCard].front = text;
            setCards(newCards);

            // Trigger AI suggestion generation
            debouncedGenerateSuggestion(text);
          }}
          onBackChange={(text) => {
            const newCards = [...cards];
            newCards[currentCard].back = text;
            setCards(newCards);
          }}
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
      <div className="w-2xl mt-24 font-bold text-[#303030]">
        <div className="flex-col mt-3 pb-6">
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
          <div className="w-full flex justify-center mt-6">
            <button
              onClick={handleCreateSet}
              className="mb-28 bg-white px-6 py-3 rounded-2xl flashcard-shadow cursor-pointer transition-all hover:scale-105 hover:bg-[#CBF2CB]"
            >
              {createLoading ? (
                <Loader2 className="w-18 animate-spin" color="#476b47" />
              ) : (
                "Create set!"
              )}
            </button>
          </div>
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
            className="hover:bg-[#F1F1F1] rounded-xl cursor-pointer p-2 px-2 text-left flex items-center justify-between"
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
            className="hover:bg-[#FFCACA] rounded-xl cursor-pointer p-2 px-2 text-left flex items-center justify-between"
          >
            <div>Delete</div>
            <Trash size={16} />
          </button>
        </div>
      </FloatingMenuBar>
    </div>
  );
};

export default withAuth(CreatePageScreen);
