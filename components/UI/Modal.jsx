// Modal.js
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

const Modal = ({
  isOpen,
  onClose,
  children,
  ariaLabelledById = "modal-title",
  ariaDescribedById = "modal-desc",
}) => {
  const modalRef = useRef(null);
  const lastFocusedElement = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      lastFocusedElement.current = document.activeElement;
      modalRef.current?.focus();

      const handleTab = (e) => {
        const focusableEls = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleTab);
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleTab);
        document.body.style.overflow = "";
        lastFocusedElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledById}
      aria-describedby={ariaDescribedById}
      tabIndex={-1}
      ref={modalRef}
      className="fixed inset-0 z-[50] flex items-center justify-center bg-[#0000001d]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border-2 border-[#E8E8E8] text-[#303030] flashcard-shadow-dark p-8 pb-0 min-w-[300px] max-w-[90vw] max-h-[90vh] overflow-y-auto outline-none relative">
        <div id={ariaDescribedById} className="mb-6">
          {children}
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer"
        >
          <X />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
