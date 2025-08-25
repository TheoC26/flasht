import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

const FlashcardInput = forwardRef(
  (
    {
      frontText = "",
      backText = "",
      onFrontChange,
      onBackChange,
      frontPlaceholder = "Front text",
      backPlaceholder = "Back text",
      className = "",
      handleBack,
      handleNext,
    },
    ref
  ) => {
    const [frontFontSize, setFrontFontSize] = useState(24);
    const [backFontSize, setBackFontSize] = useState(24);

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

        const containerHeight = container.clientHeight - 24;
        const containerWidth = container.clientWidth - 24;

        let fontSize = currentFontSize;
        textElement.style.fontSize = `${fontSize}px`;

        while (
          (textElement.scrollHeight > containerHeight ||
            textElement.scrollWidth > containerWidth) &&
          fontSize > 8
        ) {
          fontSize -= 0.5;
          textElement.style.fontSize = `${fontSize}px`;
        }

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

    // Expose functions to parent
    useImperativeHandle(ref, () => ({
      setFrontText: (text) => {
        if (frontRef.current) {
          if (text) {
            frontRef.current.textContent = text;
            frontRef.current.classList.remove("text-gray-400");
            frontRef.current.classList.add("text-[#303030]");
            // onFrontChange?.(text);
            adjustFontSize(
              frontContainerRef,
              frontRef,
              setFrontFontSize,
              frontFontSize
            );
          } else {
            frontRef.current.textContent = frontPlaceholder;
            frontRef.current.classList.add("text-gray-400");
            frontRef.current.classList.remove("text-[#303030]");
          }
        }
      },
      setBackText: (text) => {
        if (backRef.current) {
          if (text) {
            backRef.current.textContent = text;
            backRef.current.classList.remove("text-gray-400");
            backRef.current.classList.add("text-[#303030]");
            // onBackChange?.(text);
            adjustFontSize(
              backContainerRef,
              backRef,
              setBackFontSize,
              backFontSize
            );
          } else {
            backRef.current.textContent = backPlaceholder;
            backRef.current.classList.add("text-gray-400");
            backRef.current.classList.remove("text-[#303030]");
          }
        }
      },
      onNext: () => {
        backRef.current.innerHTML = "";
        frontRef.current.innerHTML = "";
        frontRef.current.focus();
        handleBackBlur();
        handleFrontFocus();
      },
      onBack: () => {
        handleBackBlur();
        handleFrontBlur();
      }
    }));

    // Update content when props change
    useEffect(() => {
        console.log("hello");
      if (frontRef.current) {
        if (frontText) {
            console.log("hello")
          frontRef.current.textContent = frontText;
          frontRef.current.classList.remove("text-gray-400");
          frontRef.current.classList.add("text-[#303030]");
        } else {
          frontRef.current.textContent = frontPlaceholder;
          frontRef.current.classList.add("text-gray-400");
          frontRef.current.classList.remove("text-[#303030]");
        }
      }
    }, [frontText, frontPlaceholder]);

    useEffect(() => {
      if (backRef.current) {
        if (backText) {
          backRef.current.textContent = backText;
          backRef.current.classList.remove("text-gray-400");
          backRef.current.classList.add("text-[#303030]");
        } else {
          backRef.current.textContent = backPlaceholder;
          backRef.current.classList.add("text-gray-400");
          backRef.current.classList.remove("text-[#303030]");
        }
      }
    }, [backText, backPlaceholder]);

    // Resize observers
    useEffect(() => {
      const frontObserver = new ResizeObserver(() => {
        if (frontText?.trim()) {
          adjustFontSize(
            frontContainerRef,
            frontRef,
            setFrontFontSize,
            frontFontSize
          );
        }
      });

      const backObserver = new ResizeObserver(() => {
        if (backText?.trim()) {
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
    }, [frontText, backText, adjustFontSize, frontFontSize, backFontSize]);

    // Input handlers
    const handleFrontInput = (e) => {
      const text = e.target.textContent || "";
      onFrontChange?.(text);
      if (text.trim()) {
        setTimeout(() => {
          adjustFontSize(
            frontContainerRef,
            frontRef,
            setFrontFontSize,
            frontFontSize
          );
        }, 0);
      }
    };

    const handleBackInput = (e) => {
      const text = e.target.textContent || "";
      onBackChange?.(text);
      if (text.trim()) {
        setTimeout(() => {
          adjustFontSize(
            backContainerRef,
            backRef,
            setBackFontSize,
            backFontSize
          );
        }, 0);
      }
    };

    // Placeholder logic
    const handleFrontFocus = () => {
      if (
        frontRef.current &&
        frontRef.current.textContent === frontPlaceholder
      ) {
        frontRef.current.textContent = "";
        frontRef.current.classList.remove("text-gray-400");
        frontRef.current.classList.add("text-[#303030]");
      }
    };

    const handleFrontBlur = () => {
      if (frontRef.current && frontRef.current.textContent.trim() === "") {
        frontRef.current.textContent = frontPlaceholder;
        frontRef.current.classList.add("text-gray-400");
        frontRef.current.classList.remove("text-[#303030]");
      }
    };

    const handleBackFocus = () => {
      if (backRef.current && backRef.current.textContent === backPlaceholder) {
        backRef.current.textContent = "";
        backRef.current.classList.remove("text-gray-400");
        backRef.current.classList.add("text-[#303030]");
      }
    };

    const handleBackBlur = () => {
      if (backRef.current && backRef.current.textContent.trim() === "") {
        backRef.current.textContent = backPlaceholder;
        backRef.current.classList.add("text-gray-400");
        backRef.current.classList.remove("text-[#303030]");
      }
    };

    return (
      <div className={`grid grid-cols-2 gap-3 place-items-start ${className}`}>
        {/* Front Card */}
        <div
          ref={frontContainerRef}
          className="w-full aspect-[1.79] rounded-2xl bg-white flashcard-shadow-dark flex items-center justify-center p-3 relative cursor-text overflow-hidden"
        >
          <div
            ref={frontRef}
            className="outline-none max-w-full text-center px-1 min-h-[1.2em] w-full break-words text-gray-400"
            contentEditable
            suppressContentEditableWarning
            onInput={handleFrontInput}
            onFocus={handleFrontFocus}
            onBlur={handleFrontBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                backRef.current?.focus();
              }
            }}
            style={{
              fontSize: `${frontFontSize}px`,
              lineHeight: "1.2",
              minHeight: "1.2em",
              display: "block",
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {frontPlaceholder}
          </div>
        </div>

        {/* Back Card */}
        <div
          ref={backContainerRef}
          className="w-full aspect-[1.79] rounded-2xl bg-white flashcard-shadow-dark flex items-center justify-center p-3 relative cursor-text overflow-hidden"
        >
          <div
            ref={backRef}
            className="outline-none max-w-full text-center px-1 min-h-[1.2em] w-full break-words text-gray-400"
            contentEditable
            suppressContentEditableWarning
            onInput={handleBackInput}
            onFocus={handleBackFocus}
            onBlur={handleBackBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleNext();
              }
            }}
            style={{
              fontSize: `${backFontSize}px`,
              lineHeight: "1.2",
              minHeight: "1.2em",
              display: "block",
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {backPlaceholder}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex flex-col relative">
          <button
            onClick={handleBack}
            className="px-6 py-2.5 select-none text-base text-gray-600 bg-white rounded-2xl flashcard-shadow-dark transition-all cursor-pointer hover:scale-105"
          >
            Back
          </button>
          <div className="absolute -bottom-7 text-lg left-1/2 -translate-x-1/2 text-[#BFBFBF]">
            {"<"}
          </div>
        </div>

        {/* Next Button */}
        <div className="flex flex-col relative place-self-end">
          <button
            onClick={() => {
              handleNext();
            }}
            className="px-6 py-2.5 select-none text-base text-gray-600 bg-white rounded-2xl flashcard-shadow-dark transition-all cursor-pointer hover:scale-105"
          >
            Next
          </button>
          <div className="absolute -bottom-7 text-lg left-1/2 -translate-x-1/2 text-[#BFBFBF]">
            &gt;
          </div>
        </div>
      </div>
    );
  }
);

export default FlashcardInput;
