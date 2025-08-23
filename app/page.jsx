"use client";
import { useEffect, useRef, useState } from "react";
import { Pin } from "lucide-react";
import TopBar from "@/components/TopBar";
import FlashcardStack from "@/components/FlashcardStack";
import { Reorder } from "framer-motion";

import { units as initialUnits } from "@/data/unit";
import { cards as initialCards } from "@/data/cards";
import SetModal from "@/components/SetModal";

export default function Home() {
  const scrollContainerRef = useRef(null);
  const bottomBarRef = useRef(null);
  const [indicatorLeftPercent, setIndicatorLeftPercent] = useState(0);
  const [indicatorWidthPercent, setIndicatorWidthPercent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [units, setUnits] = useState(initialUnits);

  const [setModalOpen, setSetModalOpen] = useState(false);
  const [piles, setPiles] = useState({
    main: initialCards,
    know: [],
    dontKnow: initialCards,
    discard: [],
  });

  const pinned = units.filter((c) => c.isPinned);
  const unpinned = units.filter((c) => !c.isPinned);

  const handlePin = (unit) => {
    const newUnits = units.map((c) =>
      c.name === unit.name ? { ...c, isPinned: !c.isPinned } : c
    );
    setUnits(newUnits);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const computeAndSet = () => {
      const totalWidth = el.scrollWidth;
      const viewportWidth = el.clientWidth;
      const maxScrollable = Math.max(totalWidth - viewportWidth, 0);
      const viewportFraction = totalWidth > 0 ? viewportWidth / totalWidth : 1;
      const widthPct = Math.max(0, Math.min(1, viewportFraction)) * 100;

      const scrollLeft = el.scrollLeft;
      const scrollRatio = maxScrollable > 0 ? scrollLeft / maxScrollable : 0;
      const leftPct = scrollRatio * (100 - widthPct);

      setIndicatorWidthPercent(widthPct);
      setIndicatorLeftPercent(leftPct);
    };

    computeAndSet();
    el.addEventListener("scroll", computeAndSet, { passive: true });
    window.addEventListener("resize", computeAndSet);
    return () => {
      el.removeEventListener("scroll", computeAndSet);
      window.removeEventListener("resize", computeAndSet);
    };
  }, []);

  // Map a pointer X position over the bottom bar to a scrollLeft on the container
  const positionPointerToScroll = (clientX, smooth = false) => {
    const el = scrollContainerRef.current;
    const track = bottomBarRef.current;
    if (!el || !track) return;

    const rect = track.getBoundingClientRect();
    const usableWidth = Math.max(rect.width - 8, 1); // mirror 4px inset on both sides
    let x = clientX - rect.left - 4; // offset left padding/inset
    x = Math.max(0, Math.min(usableWidth, x));
    const ratio = x / usableWidth;

    const maxScrollable = Math.max(el.scrollWidth - el.clientWidth, 0);
    const targetLeft = ratio * maxScrollable;

    if (smooth) {
      el.scrollTo({ left: targetLeft, behavior: "smooth" });
    } else {
      el.scrollLeft = targetLeft;
    }
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => positionPointerToScroll(e.clientX, false);
    const handleUp = (e) => {
      setIsDragging(false);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerup", handleUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isDragging]);

  return (
    <main className="flex flex-col items-end justify-center min-h-screen bg-[#F1F1F1]">
      <TopBar />

      <SetModal
        setData={units[0].sets[0]}
        unit={units[0]}
        setModalOpen={setModalOpen}
        setSetModalOpen={setSetModalOpen}
        piles={piles}
      />

      {/* Horizontal scroll container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto px-10 h-screen hide-scrollbar w-full"
      >
        <Reorder.Group
          axis="x"
          values={pinned}
          onReorder={(newPinned) => {
            setUnits([...newPinned, ...unpinned]);
          }}
          className="flex font-bold text-[#303030]"
        >
          {pinned.map((unit, i) => (
            <Reorder.Item
              key={unit.name}
              value={unit}
              className="flex flex-col px-10 py-32 items-left overflow-y-auto hide-scrollbar w-[560px]"
            >
              <button className="mb-2" onClick={() => handlePin(unit)}>
                <Pin
                  strokeWidth={3}
                  size={20}
                  color={`#303030`}
                  className={`transition-all hover:scale-105 cursor-pointer ${
                    unit.isPinned ? "opacity-100" : "opacity-20"
                  }`}
                />
              </button>
              <h1 className="text-4xl uppercase w-full mb-6">{unit.name}</h1>
              {/* Vertical scroll for column content */}
              <div className="w-full grid grid-cols-2 gap-5">
                {unit.sets.map((set, j) => (
                  <button
                    key={j + set.name}
                    onClick={() => setSetModalOpen(true)}
                  >
                    <FlashcardStack title={set.name} />
                  </button>
                ))}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
        {pinned.length > 0 && unpinned.length > 0 && (
          <div className="min-w-1 rounded-full bg-[#cbcbcb] h-1/3 self-center z-50 mx-5" />
        )}
        <Reorder.Group
          axis="x"
          values={unpinned}
          onReorder={(newUnpinned) => {
            setUnits([...pinned, ...newUnpinned]);
          }}
          className="flex font-bold text-[#303030]"
        >
          {unpinned.map((unit, i) => (
            <Reorder.Item
              key={unit.name}
              value={unit}
              className="flex flex-col px-10 py-32 items-left overflow-y-auto hide-scrollbar w-[560px]"
            >
              <button className="mb-2" onClick={() => handlePin(unit)}>
                <Pin
                  strokeWidth={3}
                  size={20}
                  color={`#303030`}
                  className={`transition-opacity ${
                    unit.isPinned ? "opacity-100" : "opacity-20"
                  }`}
                />
              </button>
              <h1 className="text-4xl uppercase w-full mb-6">{unit.name}</h1>
              {/* Vertical scroll for column content */}
              <div className="w-full grid grid-cols-2 gap-5">
                {unit.sets.map((set, j) => (
                  <button
                    key={j + set.name}
                    onClick={() => setSetModalOpen(true)}
                  >
                    <FlashcardStack title={set.name} />
                  </button>
                ))}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      <div
        ref={bottomBarRef}
        className="fixed bottom-6 w-fit p-3 px-4 rounded-2xl flashcard-shadow-dark text-sm cursor-pointer transition-all hover:scale-102 flex gap-5 bg-white left-1/2 -translate-x-1/2 z-30 select-none"
        onPointerDown={(e) => {
          e.preventDefault();
          positionPointerToScroll(e.clientX, true);
          setIsDragging(true);
        }}
      >
        <div
          className={`absolute top-1 bottom-1 bg-[#F1F1F1] outline-1 font-bold outline-[#D7D7D7] rounded-xl z-20`}
          style={{
            left: `calc(${indicatorLeftPercent}% + 4px)`,
            width: `calc(${indicatorWidthPercent}% - 8px)`,
          }}
        ></div>
        {pinned.map((unit, i) => (
          <div key={i} className="uppercase z-30">
            {unit.name}
          </div>
        ))}
        {pinned.length > 0 && unpinned.length > 0 && (
          <div className="min-w-px rounded-full bg-[#D7D7D7] h-5 self-center z-40" />
        )}
        {unpinned.map((unit, i) => (
          <div key={i} className="uppercase z-30">
            {unit.name}
          </div>
        ))}
      </div>
    </main>
  );
}
