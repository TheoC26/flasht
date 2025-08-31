"use client";
import { createClient } from "@/utils/supabase/client";

export const loginWithGoogle = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
      },
    },
  });
  return error;
};

export const loginWithPassword = async (email, password) => {
  const supabase = createClient();
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signup = async (email, password) => {
  const supabase = createClient();
  return await supabase.auth.signUp({ email, password });
};

export const logout = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
};

export const getUser = async () => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return null;
    }
    return data.user;
  } catch {
    return null;
  }
};
