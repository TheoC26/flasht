"use client";
import { useEffect, useState } from "react";
import ViewSet from "@/components/ViewSet";
import TopBar from "@/components/TopBar";
import { useUser } from "@/utils/hooks/useUser";
import { useFlashcards } from "@/utils/hooks/useFlashcards";
import { useParams } from "next/navigation";

export default function Set() {
  const { id } = useParams();
  const { getSet } = useFlashcards();
  const [set, setSet] = useState(null);
  const [setInfo, setSetInfo] = useState(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchSet = async () => {
        const cardData = await getSet(id);
        if (cardData) {
          setSet(cardData.cards);
          console.log(cardData.info)
          setSetInfo(cardData.info)
        }
        setLoading(false);
      };
      fetchSet();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#F1F1F1]">
        <TopBar isHome={false} />
        <div>Loading...</div>
      </main>
    );
  }

  if (!set) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#F1F1F1]">
        <TopBar isHome={false} />
        <div>Set not found.</div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-end justify-center min-h-screen bg-[#F1F1F1] pt-40">
      <TopBar
        isHome={false}
        name={setInfo.name || "Set"} // Assuming the set object has a name property
        collection={setInfo.collection_name || "Collection"} // Assuming the set has a collection object with a name
      />
      <ViewSet set={set} setSet={setSet} />
    </main>
  );
}
