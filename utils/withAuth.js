
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from './auth';

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkUser = async () => {
        const user = await getUser();
        if (!user) {
          router.push('/login');
        } else {
          setUser(user);
          setLoading(false);
        }
      };
      checkUser();
    }, [router]);

    if (loading) {
      return <div></div>; // Or a spinner component
    }

    if (!user) {
      return null; // Or a redirect component
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
