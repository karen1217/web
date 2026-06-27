import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";
import type { AnglePreset } from "@/lib/supabase/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pro/login");

  const { data: presets } = await supabase
    .from("angle_presets")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order");

  const displayName = (user.user_metadata?.display_name as string | undefined) ?? "";

  return (
    <SettingsClient
      presets={(presets ?? []) as AnglePreset[]}
      email={user.email ?? ""}
      displayName={displayName}
    />
  );
}
