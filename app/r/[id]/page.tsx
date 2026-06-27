import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://angle-log.com";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;

  const { data } = await admin
    .from("share_cards")
    .select("image_path")
    .eq("id", id)
    .single();

  if (!data) return {};

  const { data: { publicUrl } } = admin.storage
    .from("share-images")
    .getPublicUrl(data.image_path);

  return {
    title: "Angle Log — ビフォーアフター診断結果",
    description: "美容整形ビフォーアフター写真の角度・明るさを診断しました",
    openGraph: {
      images: [{ url: publicUrl, width: 800, height: 516 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [publicUrl],
    },
  };
}

export default async function SharePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data } = await admin
    .from("share_cards")
    .select("image_path")
    .eq("id", id)
    .single();

  const imageUrl = data
    ? admin.storage.from("share-images").getPublicUrl(data.image_path).data.publicUrl
    : null;

  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col items-center justify-center px-4 gap-6">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Angle Log 診断結果"
          className="w-full max-w-lg rounded-xl border border-border"
        />
      )}
      <p className="text-sm text-muted text-center">
        Angle Log でビフォーアフター写真を診断しました
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-accent text-white text-sm font-medium
                   px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
      >
        自分の写真を診断する →
      </Link>
      <p className="text-xs text-muted/60">
        <Link href="/" className="hover:text-muted transition-colors">{SITE_URL}</Link>
      </p>
    </div>
  );
}
