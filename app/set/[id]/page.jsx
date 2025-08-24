"use client";
import { useEffect, useState } from "react";
import { cards as initialCards } from "@/data/cards";
import ViewSet from "@/components/ViewSet";
import TopBar from "@/components/TopBar";

export default function Set() {
  const [set, setSet] = useState(initialCards);
  return (
    <main className="flex flex-col items-end justify-center min-h-screen bg-[#F1F1F1] pt-40">
      <TopBar
        isHome={false}
        name={"Common French Words"}
        collection={"French 101"}
      />
      <ViewSet set={set} setSet={setSet} />
    </main>
  );
}
