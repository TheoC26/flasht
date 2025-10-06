
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

      if (authUser) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile not found, so create one
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              { id: authUser.id, email: authUser.email },
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
            setUser(authUser); // Set user without profile data
          } else {
            setUser({ ...authUser, ...newProfile });
          }
        } else if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setUser(authUser); // Set user without profile data
        } else {
          // Profile found, merge with auth user data
          setUser({ ...authUser, ...profile });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'SIGNED_IN') {
          fetchUser();
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };

  }, [supabase]);

  return { user, loading };
};
