import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "no image" }, { status: 400 });

  const id = crypto.randomUUID();
  const path = `${id}.jpg`;

  const { error: uploadError } = await admin.storage
    .from("share-images")
    .upload(path, file, { contentType: "image/jpeg", cacheControl: "86400" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { error: dbError } = await admin
    .from("share_cards")
    .insert({ id, image_path: path });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ id });
}
