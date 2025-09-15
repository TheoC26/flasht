import { logout } from "@/utils/auth";
import { useUser } from "@/utils/hooks/useUser";
import { Cog, Edit, LogOut, PersonStanding, Trash, User, WalletCards } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const TopBar = ({ name, collection, id, isHome = true, loading = false }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const router = useRouter();

  const { user } = useUser();
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between p-6 text-[#303030] font-bold z-50 bg-gradient-to-b from-[#F1F1F1] to-[#F1F1F100]">
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
        {!isHome && !loading && (
          <Link
            href={"/edit/" + id}
            className="ml-0 w-0 overflow-hidden transition-all group-hover:ml-3 group-hover:w-6 cursor-pointer hover:scale-105"
          >
            <Cog size={20} strokeWidth={2.5} color="#303030" />
          </Link>
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
        onClick={() => setProfileOpen(!profileOpen)}
        className="bg-white h-12 aspect-square cursor-pointer rounded-2xl flashcard-shadow grid place-items-center transition-all hover:scale-105"
      >
        {user && user.email[0].toUpperCase()}
      </button>
      {profileOpen && (
        <div
          className="fixed inset-0"
          onClick={() => {
            setProfileOpen(false);
          }}
        >
          <div className="fixed w-64 top-20 right-6 rounded-2xl border-1 border-[#E8E8E8] z-50 bg-white flex flex-col p-2">
            <div className="mx-2 my-2 font-light">{user.email}</div>
            <div className="h-px bg-[#9e9e9e] rounded-full mx-2 mb-2"></div>
            <Link
              href={`/profile`}
              className="hover:bg-[#F1F1F1] rounded-xl p-2 px-2 text-left flex items-center justify-between"
            >
              <div>Profile</div>
              <User size={16} strokeWidth={3} />
            </Link>
            <Link
              href={`/home`}
              className="hover:bg-[#F1F1F1] rounded-xl p-2 px-2 text-left flex items-center justify-between"
            >
              <div>My cards</div>
              <WalletCards size={16} strokeWidth={3} />
            </Link>
            <div className="h-px bg-[#9e9e9e] rounded-full mx-2 my-2"></div>
            <button
              onClick={() => {
                logout();
                router.push("/login")
              }}
              className="hover:bg-[#FFCACA] cursor-pointer rounded-xl p-2 px-2 text-left flex items-center justify-between"
            >
              <div>Logout</div>
              <LogOut size={16} strokeWidth={3} />
            </button>
            <div className="h-px bg-[#9e9e9e] rounded-full mx-2 my-2"></div>
            <Link
              href={``}
              className="hover:bg-[#F1F1F1] rounded-xl p-2 px-2 text-left flex items-center justify-between"
            >
              <div>Terms</div>
            </Link>
            <Link
              href={``}
              className="hover:bg-[#F1F1F1] rounded-xl p-2 px-2 text-left flex items-center justify-between"
            >
              <div>Privacy policy</div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
