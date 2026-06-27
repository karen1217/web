import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll:    () => request.cookies.getAll(),
        setAll: (pairs) => {
          pairs.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          pairs.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isProRoute = pathname.startsWith("/pro");

  // Pages accessible without login
  const isPublicProRoute =
    pathname === "/pro/login" ||
    pathname === "/pro/signup" ||
    pathname === "/pro/forgot-password" ||
    pathname.startsWith("/pro/reset-password");

  if (isProRoute && !isPublicProRoute && !user) {
    return NextResponse.redirect(new URL("/pro/login", request.url));
  }

  // Redirect already-logged-in users away from auth pages (not from reset-password)
  const isAuthPage = pathname === "/pro/login" || pathname === "/pro/signup";
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/pro/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/pro/:path*"],
};
