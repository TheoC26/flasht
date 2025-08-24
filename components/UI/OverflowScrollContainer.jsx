import React, { useRef, useEffect, useState } from "react";

function OverflowScrollContainer({ children, maxWidth = "max-w-md", styleNames }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    function checkOverflow() {
      const container = containerRef.current;
      const content = contentRef.current;
      if (container && content) {
        setIsOverflowing(content.scrollWidth > container.clientWidth);
      }
    }
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return (
    <div className={`${maxWidth} overflow-hidden`}>
      <div
        ref={containerRef}
        className={`${styleNames} w-fit ${
          isOverflowing ? "scrolling-text" : ""
        }`}
        style={{ position: "relative" }}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
}

export default OverflowScrollContainer;
