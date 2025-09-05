"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Delete, Edit, Pin, Trash } from "lucide-react";
import TopBar from "@/components/TopBar";
import FlashcardStack from "@/components/FlashcardStack";
import { Reorder } from "framer-motion";
import SetModal from "@/components/SetModal";
import OverflowScrollContainer from "@/components/UI/OverflowScrollContainer";
import withAuth from "@/utils/withAuth";
import { useUser } from "@/utils/hooks/useUser";
import { useFlashcards } from "@/utils/hooks/useFlashcards";
import Link from "next/link";
import EditCollectionTextModal from "@/components/EditCollectionTextModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function Home() {
  const { user } = useUser();
  const { getCollections, updateCollection, getSet, updateCollectionOrder } =
    useFlashcards();

  const scrollContainerRef = useRef(null);
  const bottomBarRef = useRef(null);
  const [indicatorLeftPercent, setIndicatorLeftPercent] = useState(0);
  const [indicatorWidthPercent, setIndicatorWidthPercent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [setModalOpen, setSetModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);
  const [deletingCollection, setDeletingCollection] = useState(null);

  const debouncedCollections = useDebounce(collections, 1000); // Debounce collections state

  useEffect(() => {
    const fetchCollections = async () => {
      if (user) {
        setLoading(true);
        const userCollections = await getCollections(user.id);
        if (userCollections) {
          setCollections(userCollections);
        }
        setLoading(false);
      }
    };
    fetchCollections();
  }, [user]);

  // Effect to update order in DB when debounced collections change
  useEffect(() => {
    if (debouncedCollections.length > 0) {
      const updates = debouncedCollections.map((collection, index) => ({
        id: collection.id,
        index: index,
      }));
      updateCollectionOrder(updates);
    }
  }, [debouncedCollections, updateCollectionOrder]);

  const pinned = collections.filter((c) => c.pinned);
  const unpinned = collections.filter((c) => !c.pinned);

  const handlePin = async (collection) => {
    const newPinnedState = !collection.pinned;
    const newCollections = collections.map((c) =>
      c.id === collection.id ? { ...c, pinned: newPinnedState } : c
    );
    setCollections(newCollections);
    await updateCollection(collection.id, { pinned: newPinnedState });
  };

  const handleSetClick = (set, collection) => {
    setSelectedSet({ info: set, collection });
    setSetModalOpen(true);
  };

  const handleReorder = (newOrderedList, type) => {
    let newFullList;
    if (type === "pinned") {
      newFullList = [...newOrderedList, ...unpinned];
    } else {
      newFullList = [...pinned, ...newOrderedList];
    }
    setCollections(newFullList);
  };

  const handleCollectionUpdate = (updatedCollection) => {
    const newCollections = collections.map((c) =>
      c.id === updatedCollection.id ? { ...c, name: updatedCollection.name } : c
    );
    setCollections(newCollections);
  };

  const handleCollectionDelete = (deletedCollectionId) => {
    const newCollections = collections.filter((c) => c.id !== deletedCollectionId);
    setCollections(newCollections);
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
  }, [collections]);

  const positionPointerToScroll = (clientX, smooth = false) => {
    const el = scrollContainerRef.current;
    const track = bottomBarRef.current;
    if (!el || !track) return;

    const rect = track.getBoundingClientRect();
    const usableWidth = Math.max(rect.width - 8, 1);
    let x = clientX - rect.left - 4;
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

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#F1F1F1]">
        <TopBar />
        <div>Study tip: reading the syllabus counts as preparation</div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-end justify-center min-h-screen bg-[#F1F1F1]">
      <TopBar />

      {selectedSet && (
        <SetModal
          setData={selectedSet.info}
          collection={selectedSet.collection}
          setModalOpen={setModalOpen}
          setSetModalOpen={setSetModalOpen}
        />
      )}

      <EditCollectionTextModal 
        isOpen={!!editingCollection}
        onClose={() => setEditingCollection(null)}
        collection={editingCollection}
        onCollectionUpdate={handleCollectionUpdate}
      />

      <DeleteConfirmationModal 
        isOpen={!!deletingCollection}
        onClose={() => setDeletingCollection(null)}
        item={deletingCollection}
        onDeleteSuccess={handleCollectionDelete}
      />

      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto px-10 h-screen hide-scrollbar w-full"
      >
        <Reorder.Group
          axis="x"
          values={pinned}
          onReorder={(newList) => handleReorder(newList, "pinned")}
          className="flex font-bold text-[#303030]"
        >
          {pinned.map((collection) => (
            <Reorder.Item
              key={collection.id}
              value={collection}
              className="flex flex-col px-10 py-32 items-left overflow-y-auto hide-scrollbar w-[560px]"
            >
              <button className="mb-2" onClick={() => handlePin(collection)}>
                <Pin
                  strokeWidth={3}
                  fill={collection.pinned ? "#303030" : "none"}
                  size={20}
                  color={`#303030`}
                  className={`transition-all hover:scale-105 cursor-pointer ${
                    collection.pinned ? "opacity-100" : "opacity-20"
                  }`}
                />
              </button>
              <div className="flex w-full items-center mb-6 group">
                <h1 className="text-4xl uppercase flex-1">{collection.name}</h1>
                <div className="flex items-center gap-2 pointer-events-none opacity-0 transition-all group-hover:opacity-100 group-hover:pointer-events-auto">
                  <button onClick={() => setEditingCollection(collection)} className="hover:bg-[#dedede] rounded-lg p-1 cursor-pointer">
                    <Edit strokeWidth={2.5} size={22} color={`#303030`} />
                  </button>
                  <button onClick={() => setDeletingCollection({ id: collection.id, name: collection.name, type: 'collection' })} className="hover:bg-[#FFCACA] rounded-lg p-1 cursor-pointer">
                    <Trash strokeWidth={2.5} size={22} color={`#303030`} />
                  </button>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 gap-5">
                {collection.sets.map((set) => (
                  <button
                    key={set.id}
                    onClick={() => handleSetClick(set, collection)}
                  >
                    <FlashcardStack title={set.name} />
                  </button>
                ))}
                <Link
                  href={`/create?collection=${encodeURIComponent(
                    collection.name
                  )}&collectionid=${encodeURIComponent(collection.id)}`}
                >
                  <div className="w-full aspect-[1.79] text-5xl text-[#a3a3a3] mt-4 rounded-xl grid place-items-center bg-[#D9D9D9] border-4 border-[#C6C6C6] transition-all hover:scale-102 cursor-pointer">
                    +
                  </div>
                </Link>
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
          onReorder={(newList) => handleReorder(newList, "unpinned")}
          className="flex font-bold text-[#303030]"
        >
          {unpinned.map((collection) => (
            <Reorder.Item
              key={collection.id}
              value={collection}
              className="flex flex-col px-10 py-32 items-left overflow-y-auto hide-scrollbar w-[560px]"
            >
              <button className="mb-2" onClick={() => handlePin(collection)}>
                <Pin
                  strokeWidth={3}
                  size={20}
                  color={`#303030`}
                  className={`transition-opacity ${
                    collection.pinned ? "opacity-100" : "opacity-20"
                  }`}
                />
              </button>
              <div className="flex w-full items-center mb-6 group">
                <h1 className="text-4xl uppercase flex-1">{collection.name}</h1>
                <div className="flex items-center gap-2 pointer-events-none opacity-0 transition-all group-hover:opacity-100 group-hover:pointer-events-auto">
                  <button onClick={() => setEditingCollection(collection)} className="hover:bg-[#dedede] rounded-lg p-1 cursor-pointer">
                    <Edit strokeWidth={2.5} size={22} color={`#303030`} />
                  </button>
                  <button onClick={() => setDeletingCollection({ id: collection.id, name: collection.name, type: 'collection' })} className="hover:bg-[#FFCACA] rounded-lg p-1 cursor-pointer">
                    <Trash strokeWidth={2.5} size={22} color={`#303030`} />
                  </button>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 gap-5">
                {collection.sets.map((set) => (
                  <button
                    key={set.id}
                    onClick={() => handleSetClick(set, collection)}
                  >
                    <FlashcardStack title={set.name} />
                  </button>
                ))}
                <Link
                  href={`/create?collection=${encodeURIComponent(
                    collection.name
                  )}&collectionid=${encodeURIComponent(collection.id)}`}
                >
                  <div className="w-full aspect-[1.79] text-5xl text-[#a3a3a3] mt-4 rounded-xl grid place-items-center bg-[#D9D9D9] border-4 border-[#C6C6C6] transition-all hover:scale-102 cursor-pointer">
                    +
                  </div>
                </Link>
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
        {pinned.map((collection) => (
          <div key={collection.id} className="uppercase z-30 whitespace-nowrap">
            {collection.name}
          </div>
        ))}
        {pinned.length > 0 && unpinned.length > 0 && (
          <div className="min-w-px rounded-full bg-[#D7D7D7] h-5 self-center z-40" />
        )}
        {unpinned.map((collection) => (
          <OverflowScrollContainer
            key={collection.id}
            styleNames={`uppercase z-30 whitespace-nowrap max-w-28`}
            maxWidth="max-w-28"
          >
            {collection.name}
          </OverflowScrollContainer>
        ))}
      </div>
    </main>
  );
}

export default withAuth(Home);
