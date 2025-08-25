"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAX_SMALL_CARD_STACK_HEIGHT } from "@/constants";
import { redirect } from "next/navigation";

import Flashcard from "@/components/Flashcard";

import AssessScreen from "@/components/Screens/AssessScreen";

const TopBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-8 text-[#303030] font-bold z-50 bg-gradient-to-b from-[#F1F1F1] to-[#F1F1F100]">
      <div className="bg-white rounded-2xl flex gap-3 flashcard-shadow h-12 transition-all hover:scale-105 group">
        <Link href="/" className="px-6 grid place-items-center">
          Flasht
        </Link>
      </div>
      <div className="bg-white rounded-2xl flex gap-3 flashcard-shadow h-12 transition-all hover:scale-105 group">
        <Link href="#" className="px-6 grid place-items-center">
          About
        </Link>
        <Link href="#" className="px-6 grid place-items-center">
          Pricing
        </Link>
        <Link href="#" className="px-6 grid place-items-center">
          Learn
        </Link>
      </div>
    </div>
  );
};

const AssessScreenDemo = () => {
  const [piles, setPiles] = useState({
    main: [
      {
        id: 1,
        front: "What is the capital of France?",
        back: "Paris",
        index: 0,
      },
      { id: 2, front: "What is 2 + 2?", back: "4", index: 1 },
      {
        id: 3,
        front: "What is the largest planet in our solar system?",
        back: "Jupiter",
        index: 2,
      },
    ],
    know: [],
    dontKnow: [],
    discard: [],
  });
  const [history, setHistory] = useState([]);
  const [round, setRound] = useState(0);

  useEffect(() => {
    console.log(round)
    if (round == 1) {
      redirect("/home");
    }
  }, [round]);

  return (
    <AssessScreen
      piles={piles}
      setPiles={setPiles}
      history={history}
      setHistory={setHistory}
      setRound={setRound}
    />
  );
};

export default function LandingPage() {
  return (
    <div className="bg-[#F1F1F1] min-h-screen text-[#303030]">
      <TopBar />

      {/* Hero Section */}
      <header className="text-center pt-48 pb-16">
        <h1 className="text-6xl font-bold mb-4">Learn smarter, not harder.</h1>
        <p className="text-xl max-w-2xl mx-auto mb-8">
          Flasht is a minimalist flashcard app designed to help you study
          efficiently, without the clutter.
        </p>
        <Link
          href="/home"
          className="bg-white text-[#303030] font-bold py-3 px-8 rounded-xl flashcard-shadow-dark transition-all hover:scale-105"
        >
          Get Started
        </Link>
      </header>

      {/* Interactive Flashcard Section */}
      <section className="py-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold">See it in action</h2>
          <p className="text-lg text-gray-600">
            Interact with the flashcards below to see how it works.
          </p>
        </div>
        <AssessScreenDemo />
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold">How It Works</h2>
          <p className="text-lg text-gray-600">
            A simple, research-backed process for effective learning.
          </p>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div className="bg-white p-8 rounded-2xl flashcard-shadow">
            <h3 className="text-2xl font-bold mb-2">1. Create</h3>
            <p>
              Create your own flashcard sets on any topic you need to master.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl flashcard-shadow">
            <h3 className="text-2xl font-bold mb-2">2. Assess</h3>
            <p>
              Quickly gauge what you know and what you don't with a simple
              assessment.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl flashcard-shadow">
            <h3 className="text-2xl font-bold mb-2">3. Learn</h3>
            <p>
              Focus your study time on the concepts you haven't mastered yet.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Trusted by learners everywhere.
          </h2>
          <p className="text-xl mb-8">
            "Flasht helped me ace my exams. The focused approach to learning is
            a game-changer."
          </p>
          <p className="font-bold">- A Happy Student</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold">
            Everything you need, nothing you don't.
          </h2>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">Focus on Learning</h3>
            <p>
              No distractions, no complicated features. Just a simple tool to
              help you learn.
            </p>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">Spaced Repetition</h3>
            <p>
              Our learning algorithm is based on proven spaced repetition
              techniques to maximize retention.
            </p>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">Track Your Progress</h3>
            <p>
              See how you're improving over time and what topics need more work.
            </p>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">Sync Across Devices</h3>
            <p>Access your flashcards anywhere, anytime, on any device.</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="text-center py-20">
        <h2 className="text-4xl font-bold mb-4">Ready to start learning?</h2>
        <Link
          href="/home"
          className="bg-white text-[#303030] font-bold py-4 px-10 rounded-xl flashcard-shadow-dark transition-all hover:scale-105 text-lg"
        >
          Create Your First Set
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center p-8 text-gray-500">
        <p>&copy; 2025 Flasht. All rights reserved.</p>
      </footer>
    </div>
  );
}
