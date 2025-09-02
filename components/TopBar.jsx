import { logout } from "@/utils/auth";
import { Cog } from "lucide-react";
import Link from "next/link";
import React from "react";

const TopBar = ({ name, collection, isHome = true, loading = false }) => {
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between p-8 text-[#303030] font-bold z-50 bg-gradient-to-b from-[#F1F1F1] to-[#F1F1F100]">
      <div className="bg-white rounded-2xl flex gap-3 flashcard-shadow h-12 transition-all hover:scale-105 group">
        <Link
          href={"/home"}
          className="bg-[#F1F1F1] outline-1 group-hover:scale-[0.952380952] outline-[#D7D7D7] m-1.5 mr-0 flashcard-shadow rounded-xl px-3 grid place-items-center transition-all hover:scale-105"
        >
          My cards
        </Link>
        <Link className="px-3 pr-5.5 grid place-items-center" href={"/create"}>
          New +
        </Link>
      </div>
      <div
        className={`bg-white absolute left-1/2 -translate-x-1/2 rounded-2xl group transition-all duration-75 flashcard-shadow flex items-center justify-center text-2xl px-4 h-12 ${
          !isHome && "hover:scale-105"
        }`}
      >
        <div className="grid place-items-center">
          {isHome ? (
            "Flasht"
          ) : loading ? (
            <div className="w-60 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
          ) : (
            name
          )}
        </div>
        {!isHome && (
          <button className="ml-0 w-0 overflow-hidden transition-all group-hover:ml-3 group-hover:w-6 cursor-pointer hover:scale-105">
            <Cog size={20} strokeWidth={2.5} color="#303030" />
          </button>
        )}
        <div className="absolute pointer-events-none -bottom-6 left-1/2 -translate-x-1/2 text-sm w-[300%] text-center line-clamp-1">
          {!isHome && loading ? (
            <div className="w-16 h-4 bg-gray-300 rounded-lg animate-pulse mx-auto"></div>
          ) : (
            collection
          )}
        </div>
      </div>
      <button
        onClick={logout}
        className="bg-white cursor-pointer rounded-2xl flashcard-shadow grid place-items-center px-6 transition-all hover:scale-105"
      >
        Profile
      </button>
    </div>
  );
};

export default TopBar;
