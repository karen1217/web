import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CaptureClient from "./CaptureClient";
import type { AnglePreset, Case } from "@/lib/supabase/types";

export default async function CapturePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pro/login");

  const [{ data: presets }, { data: cases }] = await Promise.all([
    supabase.from("angle_presets").select("*").eq("user_id", user.id).order("sort_order"),
    supabase.from("cases").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  return (
    <CaptureClient
      presets={(presets ?? []) as AnglePreset[]}
      cases={(cases ?? []) as Case[]}
    />
  );
}
