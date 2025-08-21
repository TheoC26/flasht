"use client";
import { Pin } from "lucide-react";
import TopBar from "@/components/TopBar";

export default function Home() {
  return (
    <main className="flex flex-col items-end justify-center min-h-screen bg-[#F1F1F1]">
      <TopBar />
      {/* Horizontal scroll container */}
      <div className="flex gap-5 overflow-x-auto px-10 h-screen hide-scrollbar w-full">
        <div
          className="flex font-bold text-[#303030]"
          // style={{ minWidth: `${30 * 32}rem` }} // 30 columns * 32rem (adjust as needed)
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col px-10 py-32 items-left overflow-y-auto hide-scrollbar w-[560px]"
            >
              <button className="mb-2">
                <Pin strokeWidth={3} size={20} color="#303030" />
              </button>
              <h1 className="text-4xl uppercase w-full mb-6">Math 6</h1>
              {/* Vertical scroll for column content */}
              <div className="w-full grid grid-cols-2 gap-5">
                {Array.from({ length: 20 }).map((_, j) => (
                  <div
                    key={j}
                    className="w-full aspect-[1.79] bg-white rounded-xl flashcard-shadow"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
