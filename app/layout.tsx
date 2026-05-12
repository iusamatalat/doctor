import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingChatButton from "@/components/FloatingChatButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Doctor Connect AI – Find Doctors Nationwide",
  description:
    "Pakistan's first AI-powered doctor discovery platform. Find specialists, check symptoms with AI, and book appointments online or in-clinic.",
  keywords: ["doctor", "online consultation", "Pakistan", "healthcare", "AI", "specialist"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingChatButton />
      </body>
    </html>
  );
}
