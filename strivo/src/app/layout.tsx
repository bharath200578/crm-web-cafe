import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/navigation";
import { StorageInit } from "@/components/storage-init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cafe Delight - Table Booking System",
  description: "Book your table at Cafe Delight - Fine dining experience with easy online reservations",
  keywords: ["cafe", "restaurant", "booking", "reservations", "table booking", "dining"],
  authors: [{ name: "Cafe Delight" }],
  openGraph: {
    title: "Cafe Delight - Table Booking System",
    description: "Book your table at Cafe Delight - Fine dining experience with easy online reservations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <StorageInit>
          <Navigation />
          {children}
          <Toaster />
        </StorageInit>
      </body>
    </html>
  );
}
