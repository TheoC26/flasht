import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import { getUser } from "@/utils/auth";

export default async function Page() {

  return <LandingPage />;
}
