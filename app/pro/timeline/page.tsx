import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TimelineClient from "./TimelineClient";
import type { CaseWithSessions, SessionWithShots } from "@/components/pro/TimelineGrid";
import type { CheckerResult } from "@/lib/supabase/types";

export default async function TimelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pro/login");

  const [
    { data: cases },
    { data: sessions },
    { data: shots },
    { data: checkerResults },
  ] = await Promise.all([
    supabase.from("cases").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("capture_sessions").select("*").eq("user_id", user.id).order("captured_at"),
    supabase.from("shots").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("checker_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  // Build shots map
  const shotMap = new Map<string, typeof shots>();
  for (const shot of (shots ?? [])) {
    const arr = shotMap.get(shot.session_id) ?? [];
    arr.push(shot);
    shotMap.set(shot.session_id, arr);
  }

  // Build sessions with shots
  const sessionsWithShots: SessionWithShots[] = (sessions ?? []).map(s => ({
    ...s,
    shots: shotMap.get(s.id) ?? [],
  }));

  // Group by case
  const sessionsByCase = new Map<string, SessionWithShots[]>();
  const uncasedSessions: SessionWithShots[] = [];
  for (const s of sessionsWithShots) {
    if (s.case_id) {
      const arr = sessionsByCase.get(s.case_id) ?? [];
      arr.push(s);
      sessionsByCase.set(s.case_id, arr);
    } else {
      uncasedSessions.push(s);
    }
  }

  const casesWithSessions: CaseWithSessions[] = (cases ?? []).map(c => ({
    ...c,
    sessions: (sessionsByCase.get(c.id) ?? []).sort(
      (a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
    ),
  }));

  // Signed URLs for capture shots
  const allShotPaths = (shots ?? []).map(sh => sh.image_path);
  const imageUrls: Record<string, string> = {};
  if (allShotPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("shots").createSignedUrls(allShotPaths, 3600);
    signed?.forEach(({ path, signedUrl }) => {
      if (path && signedUrl) imageUrls[path] = signedUrl;
    });
  }

  // Signed URLs for checker result images
  const checkerPaths = (checkerResults ?? []).flatMap(r => [r.before_path, r.after_path]);
  if (checkerPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("shots").createSignedUrls(checkerPaths, 3600);
    signed?.forEach(({ path, signedUrl }) => {
      if (path && signedUrl) imageUrls[path] = signedUrl;
    });
  }

  return (
    <TimelineClient
      initialCases={casesWithSessions}
      initialUncased={uncasedSessions}
      initialImageUrls={imageUrls}
      initialCheckerResults={(checkerResults ?? []) as CheckerResult[]}
    />
  );
}
