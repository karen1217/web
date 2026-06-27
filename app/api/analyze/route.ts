import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
    res = await fetch(`${BACKEND}/analyze`, { method: "POST", body: form });
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
