import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import ThemeProvider from "@/components/ThemeProvider";
import { Providers } from "@/components/Providers";

const noto = Noto_Sans_JP({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://angle-log.com";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  icons: { icon: "/icon.png" },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: APP_NAME,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="light">
      <body className={`${noto.variable} font-sans min-h-screen bg-bg text-fg`}>
        <ThemeProvider />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
