// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand & Deskripsi */}
        <div>
          <h2 className="text-2xl font-bold text-white">Toko Koding</h2>
          <p className="mt-4 text-sm text-gray-400">
            Tempat terbaik untuk mendapatkan merchandise developer favoritmu 🎉
          </p>
        </div>

        {/* Navigasi */}
        <div>
          <h3 className="text-lg font-semibold text-white">Navigasi</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/" className="hover:text-white transition">
                Beranda
              </Link>
            </li>
            <li>
              <Link href="/produk" className="hover:text-white transition">
                Produk
              </Link>
            </li>
            <li>
              <Link href="/keranjang" className="hover:text-white transition">
                Keranjang
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-white transition">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>

        {/* Kontak */}
        <div>
          <h3 className="text-lg font-semibold text-white">Kontak</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Email: support@tokokoding.com</li>
            <li>Telp: +62 812-3456-7890</li>
            <li>Alamat: Jakarta, Indonesia</li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Toko Koding. All rights reserved.
      </div>
    </footer>
  );
}
