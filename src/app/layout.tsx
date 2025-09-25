import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Script from "next/script"; // 1. Impor komponen Script
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Toko Online Modern",
  description: "E-commerce dibangun dengan Next.js dan Midtrans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* 2. TAMBAHKAN SCRIPT MIDTRANS DI SINI */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive" // Load sebelum halaman interaktif
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-gray-50 text-gray-800`}
      >
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
