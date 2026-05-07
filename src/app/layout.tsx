import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "CVpilot — Build polished resumes",
  description: "Production-ready resume builder with pixel-perfect PDF export. Create stunning professional resumes that look identical on screen and in print.",
  keywords: ["resume builder", "resume maker", "professional resume", "PDF export", "resume templates"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning className="min-h-screen antialiased">
        <Providers>{children}</Providers>
        <SiteFooter />
        <Toaster theme="dark" position="bottom-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
