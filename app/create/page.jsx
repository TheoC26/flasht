"use client";
import React, { useState } from "react";
import TopBar from "@/components/TopBar";

import { units as initialUnits } from "@/data/unit";

const PageScreen = () => {
  const [unitSelectionOpen, setUnitSelectionOpen] = useState(false);
  const [units, setUnits] = useState(initialUnits);
  const [setUnit, setSetUnit] = useState("")
  const [setName, setSetName] = useState("")

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#F1F1F1]">
      <TopBar />
      <div className="mt-28 w-[600px] flex gap-3">
        <input
          className="flex-1 bg-white flashcard-shadow-dark rounded-2xl text-xl font-bold outline-none p-2 px-3"
          placeholder="Set name"
          value={setName}
          onChange={(e) => setSetName(e.target.value)}
        ></input>
        <button
          className={`bg-white flex gap-2 flashcard-shadow-dark rounded-2xl text-xl font-bold outline-none p-2 px-3 ${
            !setUnit && "text-[#979797]"
          }`}
        >
          <div className="">Set unit</div>
          <div className="rotate-90">&gt;</div>
        </button>
      </div>
    </div>
  );
};

export default PageScreen;
