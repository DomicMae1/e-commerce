"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Menu,
  X,
  Heart,
  SquareUserRound,
  Search,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { useCart } from "@/context/CartContext";
import { useLikes } from "@/context/LikesContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const { likesCount } = useLikes();
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  // 🔹 Handle search form
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;

    try {
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(searchQuery)}`
      );

      // kalau API gagal (401 / 500), langsung ke halaman hasil pencarian biasa
      if (!res.ok) {
        router.push(`/produk?search=${encodeURIComponent(searchQuery)}`);
        return;
      }

      const data = await res.json();
      if (data?.data?.length === 1) {
        router.push(`/produk/${data.data[0]._id}`);
      } else {
        router.push(`/produk?search=${encodeURIComponent(searchQuery)}`);
      }
    } catch (err) {
      console.error("Error searching product:", err);
      router.push(`/produk?search=${encodeURIComponent(searchQuery)}`);
    }

    setIsOpen(false);
  };

  // ✅ Role-based dynamic routing
  const kategoriLink = user?.role === "admin" ? "/kategori/admin" : "/kategori"; // jika tidak login, tetap /produk
  const productLink = user?.role === "admin" ? "/produk/admin" : "/produk"; // jika tidak login, tetap /produk
  const userLink = user?.role === "admin" ? "/user/admin" : "/user";

  return (
    <header className="bg-white backdrop-blur-md sticky top-0 z-50 border-b py-2">
      <nav className="container mx-auto px-4 pt-1">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="font-bold text-2xl text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            TokoNext
          </Link>

          {/* 🔹 Search bar desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-1/2"
          >
            <button type="submit">
              <Search size={18} className="text-gray-500" />
            </button>
            <input
              type="text"
              placeholder="Cari barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow bg-transparent outline-none px-2"
            />
          </form>

          {/* 🔹 Navigasi desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href={kategoriLink}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Kategori
            </Link>

            <Link
              href={productLink}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Produk
            </Link>

            <Link href="/keranjang" className="relative flex items-center">
              <ShoppingCart size={20} className="mr-1" />
              {isLoggedIn && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/wishlist"
              className="relative flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Heart size={20} className="mr-1" />
              {isLoggedIn && likesCount > 0 && (
                <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                  {likesCount}
                </span>
              )}
            </Link>

            <p className="border-l-2 border-gray-300 pl-2 h-6"></p>

            {isLoggedIn ? (
              <>
                <Link
                  href={userLink}
                  className="flex items-center text-gray-700 hover:text-blue-600 text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <SquareUserRound size={20} className="mr-2" />
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* 🔹 Tombol hamburger mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* 🔹 Menu mobile */}
        {isOpen && (
          <div className="md:hidden mt-4">
            <div className="flex flex-col items-start space-y-4">
              <Link
                href={productLink}
                className="text-gray-700 hover:text-blue-600 text-lg"
                onClick={() => setIsOpen(false)}
              >
                Produk
              </Link>

              <Link href="/keranjang" className="relative flex items-center">
                <ShoppingCart size={20} className="mr-1" />
                {isLoggedIn && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
                Keranjang
              </Link>

              <Link
                href="/wishlist"
                className="relative flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Heart size={20} className="mr-1" />
                Sukai
                {isLoggedIn && likesCount > 0 && (
                  <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {likesCount}
                  </span>
                )}
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    href={userLink}
                    className="flex items-center text-gray-700 hover:text-blue-600 text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <SquareUserRound size={20} className="mr-2" />
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full text-center px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="w-full text-center px-3 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
