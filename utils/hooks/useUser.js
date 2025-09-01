
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';

export const useUser = () => {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      }
      setUser(data?.user || null);
      setLoading(false);
    };

    getUser();
  }, []);

  return { user, loading };
};
