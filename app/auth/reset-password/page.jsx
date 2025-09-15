'use client';
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const ResetPasswordPage = () => {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/home');
      }, 3000);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#F1F1F1]">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl flashcard-shadow-dark">
            {success ? (
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[#303030]">Password Updated!</h1>
                    <p className="text-[#6D6D6D] mt-2">You will be redirected to the home page shortly.</p>
                </div>
            ) : (
                <>
                    <h1 className="text-3xl font-bold text-center text-[#303030]">Reset Your Password</h1>
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-[#6D6D6D]" htmlFor="password">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 mt-1 text-lg border-2 border-[#E8E8E8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#303030]"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-[#6D6D6D]" htmlFor="confirm-password">
                                Confirm New Password
                            </label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 mt-1 text-lg border-2 border-[#E8E8E8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#303030]"
                            />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl flashcard-shadow text-lg font-bold text-white bg-[#303030] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#303030] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    </main>
  );
};

export default ResetPasswordPage;
