import type { Metadata } from "next";
import { Suspense } from "react";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { RouteProgressBar } from "@/components/RouteProgressBar";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Master Within Admin",
  description: "Operator console — not for public access",
  icons: {
    icon: [
      { url: '/icon-light.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased bg-bg text-text font-body`}>
        <Suspense>
          <RouteProgressBar />
        </Suspense>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
