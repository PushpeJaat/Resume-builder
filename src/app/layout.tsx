import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-app",
});

export const metadata: Metadata = {
  title: "Resume Studio — Build polished resumes",
  description: "Production-ready resume builder with pixel-perfect PDF export. Create stunning professional resumes that look identical on screen and in print.",
  keywords: ["resume builder", "resume maker", "professional resume", "PDF export", "resume templates"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
