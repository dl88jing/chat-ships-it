import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat Ships It — Codex builds your overlay live",
  description:
    "Viewers redeem Ship a Feature. Codex writes a sandboxed overlay widget on stream. Built for the Codex x TwitchCon Hackathon by Green Robin Labs.",
  openGraph: {
    title: "Chat Ships It",
    description: "Codex as a live, on-stream game developer for Twitch.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
