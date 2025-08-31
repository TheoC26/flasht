import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createClient();
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        console.log(`${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error("Auth callback error:", err);
    }
  }

  if (token_hash && type) {
    const supabase = await createClient();
    try {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      if (!error) {
        console.log(`${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error("Auth verification error:", err);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
