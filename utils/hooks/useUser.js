
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';

export const useUser = () => {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Error fetching auth user:', authError);
        setLoading(false);
        return;
      }

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Fetch the user's profile from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Still set the auth user data even if profile fetch fails
        setUser(authUser);
      } else {
        // Merge auth user data with profile data
        setUser({ ...authUser, ...profile });
      }

      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        // Re-fetch user data on sign-in or sign-out
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            fetchUser();
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };

  }, [supabase]);

  return { user, loading };
};
