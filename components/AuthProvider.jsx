"use client";

import { useUser } from "@/utils/hooks/useUser";
import { UserProvider } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

const AuthProvider = ({ children }) => {
  const { user, loading } = useUser();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          router.push("/auth/reset-password");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center"></div>
    );
  }

  return <UserProvider value={{ user, loading }}>{children}</UserProvider>;
};

export default AuthProvider;
