import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get("code");
  const token    = searchParams.get("token");
  const type     = searchParams.get("type");
  const next     = searchParams.get("next") ?? "/pro/dashboard";

  const supabase = await createClient();

  // PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const dest = type === "signup" ? "/pro/login?verified=1" : next;
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  // Legacy token flow
  if (token && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: token, type: type as never });
    if (!error) {
      return NextResponse.redirect(`${origin}/pro/login?verified=1`);
    }
  }

  return NextResponse.redirect(`${origin}/pro/login?error=auth`);
}
