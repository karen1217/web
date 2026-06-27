import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
// Allow up to 60 s so Render's free-plan cold start (≤ 50 s) can complete.
// Requires Vercel Pro; on Hobby the effective cap is 10 s regardless.
export const maxDuration = 60;

const BACKEND = process.env.API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  let res: Response;
  try {
    // 55-second client-side timeout — gives Render room to cold-start
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55_000);
    try {
      res = await fetch(`${BACKEND}/analyze`, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: await res.text().catch(() => "") },
      { status: res.status },
    );
  }

  return NextResponse.json(await res.json());
}
