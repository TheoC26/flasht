import React from "react";
import Link from "next/link";

const LandingTopBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-8 text-[#303030] font-bold z-50 bg-gradient-to-b from-[#F1F1F1] to-[#F1F1F100]">
      <div className="bg-white rounded-2xl flex gap-3 flashcard-shadow h-12 px-2 text-base transition-all hover:scale-105 group">
        <Link href="#" className="px-4 grid place-items-center">
          About
        </Link>
        <Link href="#" className="px-4 grid place-items-center">
          Pricing
        </Link>
        <Link href="#" className="px-4 grid place-items-center">
          Learn
        </Link>
      </div>
      <div className="bg-white absolute left-1/2 -translate-x-1/2 rounded-2xl flex gap-3 flashcard-shadow text-2xl h-12 transition-all hover:scale-105 group">
        <Link href="/" className="px-4 grid place-items-center">
          Flasht
        </Link>
      </div>
      <div className="bg-white rounded-2xl flex gap-3 flashcard-shadow h-12 transition-all hover:scale-105 group">
        <Link className="px-3 pl-5.5 grid place-items-center" href={"/login"}>
          Login
        </Link>
        <Link
          href={"/signup"}
          className="bg-[#F1F1F1] outline-1 group-hover:scale-[0.952380952] outline-[#D7D7D7] m-1.5 ml-0 flashcard-shadow rounded-xl px-3 grid place-items-center transition-all hover:scale-105"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LandingTopBar;
