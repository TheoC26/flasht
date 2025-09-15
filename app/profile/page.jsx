'use client';
import React, { useState } from 'react';
import TopBar from '@/components/TopBar';
import withAuth from '@/utils/withAuth';
import { useUser } from '@/utils/hooks/useUser';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const ProfilePage = () => {
  const { user, loading: userLoading } = useUser();
  const supabase = createClient();
  const router = useRouter();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleResetPassword = async () => {
    if (user) {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('A password reset link has been sent to your email.');
      }
    }
  };

  // IMPORTANT: Deleting a user requires admin privileges and cannot be done securely from the client-side.
  // This function should call a Supabase Edge Function that handles the deletion.
  const handleDeleteAccount = async () => {
    console.log("Attempting to delete account...");
    // 1. Create a Supabase Edge Function (e.g., `delete-user`)
    // 2. In that function, use the Supabase Admin Client to delete the user:
    //    await supabaseAdmin.auth.admin.deleteUser(userId)
    // 3. Call the function from the client:
    //    const { error } = await supabase.functions.invoke('delete-user');
    // 4. Handle success or error, and sign the user out.
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
            <div className="flex items-center">
                <p className="text-md text-[#6D6D6D] w-24">Email</p>
                <p className="text-md font-semibold text-[#303030]">{user?.email}</p>
            </div>
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
