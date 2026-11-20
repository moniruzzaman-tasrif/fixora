/**
 * Root layout — wraps every route in the app.
 * Loads Inter via next/font (sets --font-inter CSS variable),
 * mounts the global <Toaster> for sonner toast notifications,
 * and injects site-wide metadata.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // consumed by globals.css: --font-sans: var(--font-inter)
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fixora — Your Home, Our Responsibility",
  description:
    "Browse repair service listings for smart devices and home appliances, request a repair, and track its progress.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Apply the Inter variable so Tailwind's font-sans picks it up globally.
    <html lang="en" className={`${inter.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-700">
        {children}
        {/* Toaster is here, not in a route layout, so it shows on every page. */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
