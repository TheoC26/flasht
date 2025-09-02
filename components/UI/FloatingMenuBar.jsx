import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const FloatingMenuBar = ({ children, posX, posY, isOpen, onClose }) => {
  const menuRef = useRef(null);
  const [positionStyle, setPositionStyle] = useState({ top: posY, left: posX });

  useLayoutEffect(() => {
    if (!isOpen) return;
    const element = menuRef.current;
    if (!element) return;

    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 0;

    // Measure after render
    const elementHeight = element.offsetHeight || 0;
    const wouldOverflowBottom =
      typeof posY === "number" ? posY + elementHeight > viewportHeight : false;

    if (wouldOverflowBottom) {
      const bottom = Math.max(
        0,
        viewportHeight - (typeof posY === "number" ? posY : 0)
      );
      setPositionStyle({ left: posX, bottom, top: "auto", position: "fixed" });
    } else {
      setPositionStyle({
        left: posX,
        top: posY,
        bottom: "auto",
        position: "fixed",
      });
    }
  }, [isOpen, posX, posY]);

  if (!isOpen) return null;
  return (
    <button
      className="fixed inset-0 z-[50] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        ref={menuRef}
        className="bg-white rounded-xl border-1 border-[#E8E8E8] flashcard-shadow-dark p-1 min-w-[150px]"
        style={positionStyle}
      >
        {children}
      </div>
    </button>
  );
};

export default FloatingMenuBar;
