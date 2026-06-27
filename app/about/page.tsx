import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AboutClient from "./AboutClient";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <AboutClient isLoggedIn={!!user} />;
}
