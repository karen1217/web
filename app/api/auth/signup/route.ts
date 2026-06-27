import { createClient } from "@supabase/supabase-js";
import { createTransport } from "nodemailer";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let email: string, password: string;
  try {
    ({ email, password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  // Local dev fallback: no email confirmation
  if (!gmailUser || !gmailPass) {
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      const status = error.message.toLowerCase().includes("already") ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ success: true, confirmed: true });
  }

  // Generate signup link (creates the user + confirmation URL in one call)
  const origin = req.headers.get("origin") ?? "https://angle-log.vercel.app";
  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: { redirectTo: `${origin}/pro/login` },
  });

  if (error) {
    const status = error.message.toLowerCase().includes("already") ? 409 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }

  const confirmUrl = data.properties.action_link;

  // Send confirmation email via Gmail SMTP
  const transporter = createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  try {
    await transporter.sendMail({
      from: `"Angle Log" <${gmailUser}>`,
      to: email,
      subject: "【Angle Log】メールアドレスの確認",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="margin:0 0 16px;font-size:20px">Angle Log へようこそ</h2>
          <p style="margin:0 0 24px;color:#444;line-height:1.6">
            以下のボタンをクリックして、メールアドレスの確認を完了してください。
          </p>
          <a href="${confirmUrl}"
             style="display:inline-block;padding:12px 28px;background:#22c55e;color:#000;
                    text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">
            メールアドレスを確認する
          </a>
          <p style="margin:32px 0 0;color:#999;font-size:12px">
            このメールに心当たりがない場合は無視してください。
          </p>
        </div>
      `,
    });
  } catch (e) {
    await admin.auth.admin.deleteUser(data.user.id).catch(() => {});
    return NextResponse.json(
      { error: `メール送信に失敗しました: ${String(e)}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, confirmed: false });
}
