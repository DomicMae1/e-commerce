// src/components/Navbar.tsx
"use client"; // Komponen ini interaktif (ada state), jadi harus Client Component

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react"; // Menggunakan ikon untuk tampilan lebih baik

export default function Navbar() {
  // State untuk mengontrol buka/tutup menu di mobile
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo / Nama Toko */}
          <Link
            href="/"
            className="font-bold text-2xl text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            TokoNext
          </Link>

          {/* Navigasi untuk Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/produk"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Produk
            </Link>
            <Link
              href="/keranjang"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart size={20} className="mr-1" />
              Keranjang
            </Link>
          </div>

          {/* Tombol Hamburger untuk Mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu untuk Mobile (muncul saat isOpen true) */}
        {isOpen && (
          <div className="md:hidden mt-4">
            <div className="flex flex-col items-start space-y-4">
              <Link
                href="/produk"
                className="text-gray-700 hover:text-blue-600 text-lg"
                onClick={() => setIsOpen(false)}
              >
                Produk
              </Link>
              <Link
                href="/keranjang"
                className="flex items-center text-gray-700 hover:text-blue-600 text-lg"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart size={20} className="mr-2" />
                Keranjang
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
