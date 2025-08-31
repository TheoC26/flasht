"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import TopBar from "@/components/TopBar";
import FlashcardInput from "@/components/FlashcardInput";

import { collections as initialCollections } from "@/data/collection";
import ListItem from "@/components/UI/ListItem";
import withAuth from "@/utils/withAuth";

const PageScreen = () => {
  const [collectionSelectionOpen, setCollectionSelectionOpen] = useState(false);
  const [collections, setCollections] = useState(initialCollections);
  const [collection, setCollection] = useState("");
  const [name, setName] = useState("");

  const [focusedCard, setFocusedCard] = useState(null);
  const [frontFontSize, setFrontFontSize] = useState(24);
  const [backFontSize, setBackFontSize] = useState(24);

  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);

  const flashcardInputRef = useRef();

  // Refs for focusing editable divs
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const frontContainerRef = useRef(null);
  const backContainerRef = useRef(null);

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
      collection
        ? col.name.toLowerCase().includes(collection.toLowerCase())
        : true
    );
    if (!match || collection == "") {
      setCollection("");
    } else {
      setCollection(match.name);
    }
  }

  function collectionSubmit() {
    const match = collections.find((col) =>
      collection
        ? col.name.toLowerCase().includes(collection.toLowerCase())
        : true
    );
    if (!match) return;
    setCollection(match.name);
    setCollectionSelectionOpen(false);
  }

  const handleNext = () => {
    if (currentCard === cards.length - 1) {
      if (cards[currentCard].front != "" && cards[currentCard].back != "") {
        setCards([
          ...cards,
          {
            id: uuidv4(),
            index: cards.length,
            front: "",
            back: "",
          },
        ]);
        flashcardInputRef.current.onNext();
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
    document.activeElement.blur();
    setCurrentCard(index);
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

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#F1F1F1]">
      <TopBar />
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
            !collection && "text-[#979797]"
          }`}
        >
          <input
            className="w-40 outline-none"
            placeholder="Collection"
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
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
                  collection
                    ? col.name.toLowerCase().includes(collection.toLowerCase())
                    : true
                )
                .map((col, i) => (
                  <button
                    onClick={(e) => {
                      setCollection(col.name);
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
        />
      </div>

      {/* All Flashcards Section */}
      <div className="w-2xl h-96 mt-24 font-bold text-[#303030]">
        <div className="flex-col mt-3 pb-28">
          {cards.map((card, index) => (
            <ListItem
              key={card.id}
              card={card}
              onClick={() => handleCardClick(index)}
              current={currentCard === index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default withAuth(PageScreen);
