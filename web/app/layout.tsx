import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BRGR Voice Demo",
  description: "Bilingual BRGR voice ordering demo powered by ElevenLabs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={outfit.variable} suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
