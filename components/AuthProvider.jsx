'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AuthProvider = ({ children }) => {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // When the user clicks the password recovery link, they are redirected here.
        // The URL contains a hash fragment with the access token.
        // The Supabase client handles this automatically and fires the PASSWORD_RECOVERY event.
        // We can then redirect the user to the page where they can enter their new password.
        router.push('/auth/reset-password');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  return children;
};

export default AuthProvider;
