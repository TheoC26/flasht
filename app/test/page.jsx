"use client"
import { useState, useRef, useEffect } from "react";

export default function CenteredTextBox() {
  const [approach, setApproach] = useState("textarea");
  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const divRef = useRef(null);

  // Textarea auto-resize logic
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "2rem";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (approach === "textarea") {
      adjustTextareaHeight();
    }
  }, [text, approach]);

  const handleTextareaChange = (e) => {
    setText(e.target.value);
  };

  const handleDivInput = (e) => {
    setText(e.target.textContent);
  };

  // Handle placeholder for contenteditable
  const handleDivFocus = () => {
    if (divRef.current && divRef.current.textContent === "front") {
      divRef.current.textContent = "";
      divRef.current.classList.remove("text-gray-400");
    }
  };

  const handleDivBlur = () => {
    if (divRef.current && divRef.current.textContent.trim() === "") {
      divRef.current.textContent = "front";
      divRef.current.classList.add("text-gray-400");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Toggle buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setApproach("textarea")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            approach === "textarea"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Textarea Approach
        </button>
        <button
          onClick={() => setApproach("contenteditable")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            approach === "contenteditable"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          ContentEditable Div
        </button>
      </div>

      {approach === "textarea" ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextareaChange}
          className="w-full max-w-md p-5 border-2 border-gray-800 rounded-lg bg-white text-center shadow-lg resize-none overflow-hidden focus:border-blue-500 focus:outline-none focus:shadow-blue-200 focus:shadow-lg transition-all duration-200"
          placeholder="front"
          style={{
            minHeight: "2rem",
            lineHeight: "1.5rem",
            height: "2rem",
          }}
          rows={1}
        />
      ) : (
        <div
          ref={divRef}
          contentEditable
          onInput={handleDivInput}
          onFocus={handleDivFocus}
          onBlur={handleDivBlur}
          className="w-full max-w-md min-h-8 p-5 border-2 border-gray-800 rounded-lg bg-white text-center shadow-lg focus:border-blue-500 focus:outline-none focus:shadow-blue-200 focus:shadow-lg transition-all duration-200 text-gray-400"
          style={{ lineHeight: "1.5rem" }}
          suppressContentEditableWarning={true}
        >
          front
        </div>
      )}

      {/* Comparison info */}
      <div className="mt-6 max-w-md text-sm text-gray-600 text-center">
        <h3 className="font-semibold mb-2">
          {approach === "textarea"
            ? "Textarea Approach"
            : "ContentEditable Approach"}
        </h3>
        <p>
          {approach === "textarea"
            ? "Requires JavaScript to auto-resize, but better for forms and accessibility."
            : "Auto-resizes naturally, more flexible styling, but requires custom placeholder logic."}
        </p>
      </div>
    </div>
  );
}