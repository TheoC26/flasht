'use client';
import React, { useState } from 'react';
import TopBar from '@/components/TopBar';
import withAuth from '@/utils/withAuth';
import { useUserContext } from "@/context/UserContext";
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const ProfilePage = () => {
  const { user, loading: userLoading } = useUserContext();
  const supabase = createClient();
  const router = useRouter();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPro = user?.is_pro || false;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleResetPassword = async () => {
    if (user) {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('A password reset link has been sent to your email.');
      }
    }
  };

  const handleCheckout = async (plan) => {
    setLoading(true);
    const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
    });
    const data = await response.json();
    if (data.url) {
        router.push(data.url);
    }
    setLoading(false);
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    const response = await fetch('/api/create-portal-session', {
        method: 'POST',
    });
    const data = await response.json();
    if (data.url) {
        router.push(data.url);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    console.log("Attempting to delete account...");
    alert("This feature requires a server-side Edge Function to be implemented for security reasons. See console for details.");
    setIsDeleteModalOpen(false);
  };

  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F1F1]">
        <TopBar />
        <Loader2 className="w-12 h-12 animate-spin text-[#303030]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#F1F1F1]">
      <TopBar />
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        item={{ id: user?.id, name: "your account", type: 'account' }}
        onDeleteSuccess={handleDeleteAccount}
      />
      <div className="mt-32 w-full max-w-2xl px-4">
        <h1 className="text-4xl font-bold text-[#303030] mb-8">Profile</h1>
        
        <div className="bg-white p-6 rounded-2xl flashcard-shadow-dark mb-6">
            <h2 className="text-xl font-bold text-[#303030] mb-4">My Information</h2>
            <div className="flex items-center mb-2">
                <p className="text-md text-[#6D6D6D] w-32">Email</p>
                <p className="text-md font-semibold text-[#303030]">{user?.email}</p>
            </div>
            <div className="flex items-center">
                <p className="text-md text-[#6D6D6D] w-32">Subscription</p>
                <p className={`text-md font-semibold ${isPro ? 'text-green-500' : 'text-[#303030]'}`}>{isPro ? 'Flasht Pro' : 'Free Plan'}</p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl flashcard-shadow-dark mb-6">
            <h2 className="text-xl font-bold text-[#303030] mb-4">Subscription</h2>
            {isPro ? (
                <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="w-full text-center px-4 py-3 bg-white border-2 border-[#E8E8E8] rounded-xl flashcard-shadow cursor-pointer transition-all hover:bg-[#f1f1f1] hover:scale-[1.02] disabled:opacity-50"
                >
                    {loading ? <Loader2 className="mx-auto animate-spin" /> : 'Manage Subscription'}
                </button>
            ) : (
                <div className="space-y-4">
                    <p className="text-md text-[#6D6D6D]">Upgrade to Flasht Pro for unlimited sets and AI features.</p>
                    <button
                        onClick={() => handleCheckout('monthly')}
                        disabled={loading}
                        className="w-full text-center px-4 py-3 bg-[#303030] text-white rounded-xl flashcard-shadow cursor-pointer transition-all hover:bg-opacity-90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="mx-auto animate-spin" /> : 'Upgrade - $5/month'}
                    </button>
                    <button
                        onClick={() => handleCheckout('yearly')}
                        disabled={loading}
                        className="w-full text-center px-4 py-3 bg-white border-2 border-[#E8E8E8] rounded-xl flashcard-shadow cursor-pointer transition-all hover:bg-[#f1f1f1] hover:scale-[1.02] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="mx-auto animate-spin" /> : 'Upgrade - $50/year'}
                    </button>
                </div>
            )}
        </div>

        <div className="bg-white p-6 rounded-2xl flashcard-shadow-dark">
            <h2 className="text-xl font-bold text-[#303030] mb-4">Account Actions</h2>
            <div className="space-y-4">
                <button
                    onClick={handleResetPassword}
                    className="w-full text-left px-4 py-3 bg-white border-2 border-[#E8E8E8] rounded-xl flashcard-shadow cursor-pointer transition-all hover:bg-[#f1f1f1] hover:scale-[1.02]"
                >
                    Reset Password
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 bg-white border-2 border-[#E8E8E8] rounded-xl flashcard-shadow cursor-pointer transition-all hover:bg-[#f1f1f1] hover:scale-[1.02]"
                >
                    Log Out
                </button>
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="w-full text-left px-4 py-3 bg-white border-2 border-[#F8B6B6] text-[#9C3A3A] rounded-xl flashcard-shadow cursor-pointer transition-all hover:bg-[#FFCACA] hover:scale-[1.02]"
                >
                    Delete Account
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default withAuth(ProfilePage);
