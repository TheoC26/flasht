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
      aiSuggestion = "",
      isGeneratingSuggestion = false,
      onAutoFillSuggestion,
    },
    ref
  ) => {
    const [frontFontSize, setFrontFontSize] = useState(24);
    const [backFontSize, setBackFontSize] = useState(24);
    const [isFrontFocused, setIsFrontFocused] = useState(false);
    const [isBackEmpty, setIsBackEmpty] = useState(true);

    const frontRef = useRef(null);
    const backRef = useRef(null);
    const frontContainerRef = useRef(null);
    const backContainerRef = useRef(null);

    const isContentEmpty = (text) => !text || text.trim() === "";

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

    useImperativeHandle(ref, () => ({
      setFrontText: (text) => {
        if (frontRef.current) {
          frontRef.current.textContent = text;
          adjustFontSize(
            frontContainerRef,
            frontRef,
            setFrontFontSize,
            frontFontSize
          );
        }
      },
      setBackText: (text) => {
        if (backRef.current) {
          backRef.current.textContent = text;
          setIsBackEmpty(isContentEmpty(text));
          adjustFontSize(
            backContainerRef,
            backRef,
            setBackFontSize,
            backFontSize
          );
        }
      },
      onNext: () => {
        if (backRef.current) backRef.current.innerHTML = "";
        if (frontRef.current) frontRef.current.innerHTML = "";
        setIsBackEmpty(true);
        frontRef.current.focus();
      },
      onBack: () => {},
      setFrontFocusedState: (state) => {
        setIsFrontFocused(state)
      }
    }));

    useEffect(() => {
      if (frontRef.current && frontRef.current.textContent !== frontText) {
        frontRef.current.textContent = frontText;
      }
    }, [frontText]);

    useEffect(() => {
      if (backRef.current && backRef.current.textContent !== backText) {
        backRef.current.textContent = backText;
      }
      setIsBackEmpty(isContentEmpty(backText));
    }, [backText]);

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

    const handleFrontInput = (e) => {
      onFrontChange?.(e.target.textContent || "");
    };

    const handleBackInput = (e) => {
      const newText = e.target.textContent || "";
      onBackChange?.(newText);
      setIsBackEmpty(isContentEmpty(newText));
    };

    const handleBackKeyDown = (e) => {
      if ((e.key === "Enter" || e.key === "Tab") && isBackEmpty && aiSuggestion) {
        e.preventDefault();
        onAutoFillSuggestion?.();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleNext();
      }
    };

    const commonStyle = {
      lineHeight: "1.2",
      minHeight: "1.2em",
      display: "block",
      wordBreak: "break-word",
      hyphens: "auto",
    };

    return (
      <div className={`grid grid-cols-2 gap-3 place-items-start ${className}`}>
        {/* Front Card */}
        <div
          ref={frontContainerRef}
          className="w-full aspect-[1.79] rounded-2xl bg-white flashcard-shadow-dark flex items-center justify-center p-3 relative cursor-text overflow-hidden"
          onClick={() => frontRef.current?.focus()}
        >
          {isContentEmpty(frontText) && !isFrontFocused && (
            <div
              className="absolute text-center px-4 text-gray-400 pointer-events-none"
              style={{ fontSize: `${frontFontSize}px`, ...commonStyle }}
            >
              {frontPlaceholder}
            </div>
          )}
          <div
            ref={frontRef}
            className="outline-none max-w-full text-center px-1 w-full break-words text-[#303030] relative z-10 bg-transparent"
            contentEditable
            suppressContentEditableWarning
            onInput={handleFrontInput}
            onFocus={() => setIsFrontFocused(true)}
            onBlur={() => {
              isContentEmpty(frontRef.current.innerHTML) &&
                setIsFrontFocused(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                backRef.current?.focus();
              }
            }}
            style={{ fontSize: `${frontFontSize}px`, ...commonStyle }}
          />
        </div>

        {/* Back Card */}
        <div
          ref={backContainerRef}
          className="w-full aspect-[1.79] rounded-2xl bg-white flashcard-shadow-dark flex items-center justify-center p-3 relative cursor-text overflow-hidden"
          onClick={() => backRef.current?.focus()}
        >
          {isBackEmpty && (
            <div
              className="absolute text-center px-4 text-gray-400 pointer-events-none"
              style={{ fontSize: `${backFontSize}px`, ...commonStyle }}
            >
              {aiSuggestion || backPlaceholder}
            </div>
          )}
          <div
            ref={backRef}
            className="outline-none max-w-full text-center px-1 w-full break-words text-[#303030] relative z-10 bg-transparent"
            contentEditable
            suppressContentEditableWarning
            onInput={handleBackInput}
            onKeyDown={handleBackKeyDown}
            style={{ fontSize: `${backFontSize}px`, ...commonStyle }}
          />
          {/* {isGeneratingSuggestion && (
            <div className="absolute top-2 right-2 text-xs text-blue-500 animate-pulse">
              AI thinking...
            </div>
          )} */}
          {!isGeneratingSuggestion && aiSuggestion && isBackEmpty && (
            <div className="absolute top-2 right-2 text-xs text-gray-400">
              Press Enter of Tab to accept
            </div>
          )}
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
            onClick={handleNext}
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
