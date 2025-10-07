import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Script from "next/script"; // 1. Impor komponen Script
import Navbar from "@/components/Navbar";
import Image from "next/image"; // <-- Impor Image
import Link from "next/link"; // <-- Impor Link
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LikesProvider } from "@/context/LikesContext";
import { Toaster } from "react-hot-toast";

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
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-white text-gray-800`}
      >
        <AuthProvider>
          <CartProvider>
            <LikesProvider>
              <Navbar />
              <main className="container mx-auto px-4 py-8 bg-white text-black">
                {children}
                <Toaster position="top-center" />
              </main>
              <Footer />

              <HoverCard openDelay={50} closeDelay={50}>
                <HoverCardTrigger asChild>
                  <Link
                    href="https://wa.me/6281234567890?text=Halo,%20saya%20tertarik%20dengan%20produk%20Anda."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 p-3 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110"
                    aria-label="Chat di WhatsApp"
                  >
                    <Image
                      src="/whatsapp-vector.svg"
                      alt="WhatsApp Icon"
                      width={20}
                      height={20}
                    />
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent
                  side="left"
                  align="center"
                  sideOffset={8}
                  className="w-auto max-w-xs"
                >
                  <div className="flex items-center space-x-4">
                    <p className="text-sm">
                      Butuh bantuan? Chat admin kami di sini.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </LikesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
