'use client';
import React from 'react';
import Link from 'next/link';

const AuthCodeErrorPage = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#F1F1F1]">
        <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-2xl flashcard-shadow-dark">
            <h1 className="text-3xl font-bold text-[#303030]">Link Expired or Invalid</h1>
            <p className="text-[#6D6D6D] mt-2">
                The password reset link you used is no longer valid. Please return to the login page to request a new one.
            </p>
            <div className="pt-4">
                <Link href="/home">
                    <div className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl flashcard-shadow text-lg font-bold text-white bg-[#303030] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#303030]">
                        Back home
                    </div>
                </Link>
            </div>
        </div>
    </main>
  );
};

export default AuthCodeErrorPage;
