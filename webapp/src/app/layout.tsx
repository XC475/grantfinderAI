import type { Metadata } from "next";
import { Source_Serif_4, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ToastHandler } from "@/components/toast-handler";
import { Providers } from "@/components/providers";
import { Suspense } from "react";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GrantWare AI",
  description: "Grant discovery and management platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sourceSerif.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Suspense fallback={null}>
            <ToastHandler />
          </Suspense>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
