import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND = process.env.API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new NextResponse("Invalid form data", { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND}/inpaint`, { method: "POST", body: form });
  } catch {
    return new NextResponse("Backend unavailable", { status: 502 });
  }

  if (!res.ok) {
    return new NextResponse(await res.text().catch(() => "Error"), {
      status: res.status,
    });
  }

  // Forward binary JPEG response
  return new NextResponse(res.body, {
    headers: { "content-type": "image/jpeg" },
  });
}
