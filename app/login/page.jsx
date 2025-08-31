"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginWithPassword, loginWithGoogle } from "@/utils/auth";
import LandingTopBar from "@/components/LandingTopBar";
import Google from "@/components/Icons/Google";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out email and password");
      return;
    }
    setError(null);
    const { error } = await loginWithPassword(email, password);
    if (error) {
      setError(error.message);
    } else {
      router.push("/home");
    }
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <LandingTopBar />
      <div className="bg-white text-[#303030] flashcard-shadow-dark rounded-4xl px-10 pt-8 pb-10 mb-4 w-full max-w-[620px] font-bold">
        <h1 className="text-5xl font-bold text-left mb-6">Login</h1>
        {error && <p className="text-[#C98282] text-center mb-4">{error}</p>}
        <div className="text-center mt-4">
          <button
            className="bg-[#f1f1f1] border-1 border-[#DDDDDD] cursor-pointer text-xl flex gap-3.5 items-center mx-auto font-bold py-2 px-4 rounded-2xl focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleGoogleLogin}
          >
            <Google />
            <div>Continue with Google</div>
          </button>
        </div>
        <div className="text-center my-4 text-xl">or</div>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              className="flashcard-shadow appearance-none border-1 placeholder:text-[#B3B3B3] border-[#DDDDDD] rounded-2xl text-xl w-full py-2 px-3 text-[#303030] bg-[#f1f1f1] leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div className="mb-6 relative">
            <input
              className="flashcard-shadow appearance-none border-1 border-[#DDDDDD] placeholder:text-[#B3B3B3] rounded-2xl text-xl w-full py-2 px-3 pr-10 text-[#303030] bg-[#f1f1f1] mb-2 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-2/3 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xl text-[#B3B3B3]">
              <span>Don't have an account?</span>
              <Link href="/signup" className="text-[#303030] ml-1 underline">
                Sign up
              </Link>
            </div>
            <button
              className="bg-[#f1f1f1] text-xl border-1 cursor-pointer border-[#DDDDDD] text-[#303030] font-bold py-2 px-5 rounded-2xl focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign in {">"}
            </button>
          </div>
        </form>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-sm font-bold text-[#7F7F7F]">
        By logging in you agree to our <Link href={"/"} className="text-[#303030]">terms and conditions</Link>
      </div>
    </div>
  );
}
