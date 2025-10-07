/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// src/app/wishlist/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/data/products"; // Kita bisa gunakan tipe Product yang ada
import { getCookie } from "@/utils/cookies";
import { useLikes } from "@/context/LikesContext";

export default function WishlistPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);

  const userId = getCookie("_id");

  const { setLikesCount } = useLikes();

  // Ambil data produk yang disukai dari backend
  const fetchWishlist = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/likes/get", {
        method: "GET",
        credentials: "same-origin",
      });
      const data = await res.json();
      console.log("fetchWishlist response:", res.status, data);

      if (!res.ok || !data?.items) {
        throw new Error(data?.error || "Gagal mengambil wishlist");
      }

      const normalized = data.items.map((it: any) => ({
        ...it,
        _id: it._id?.toString?.() ?? it._id,
      }));
      setItems(normalized);

      // ✅ update count global di context
      setLikesCount(normalized.length);
    } catch (error) {
      console.error("fetchWishlist error:", error);
      setItems([]);
      setLikesCount(0); // reset kalau gagal
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Hapus item dari daftar suka (unlike)
  const handleUnlikeItem = async (productId: string) => {
    // Optimistic update
    const newItems = items.filter((item) => item._id?.toString() !== productId);
    setItems(newItems);
    setLikesCount(newItems.length); // ⬅️ update count langsung

    try {
      console.log("Request unlike productId:", productId);
      const res = await fetch("/api/likes/toggle", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });

      const data = await res.json();
      console.log("unlike response:", res.status, data);

      const ok =
        res.ok &&
        (data?.success === true || typeof data?.liked !== "undefined");

      if (!ok) {
        throw new Error(data?.error || "Gagal unlike produk");
      }
    } catch (err) {
      console.error("handleUnlikeItem error:", err);
      alert("Gagal menghapus dari wishlist");
      // rollback UI
      fetchWishlist();
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 w-full">
      <h1 className="text-3xl font-bold mb-6">Produk yang Anda Sukai</h1>

      {fetching ? (
        <div className="w-full h-screen flex items-center justify-center">
          <p className="text-gray-500">Memuat wishlist...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <p className="text-xl text-gray-500">
            Anda belum menyukai produk apapun.
          </p>
          <Link
            href="/produk"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Cari Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item._id} className="border rounded-lg shadow-sm">
              <Link href={`/produk/${item._id.toString()}`}>
                <div className="relative w-full h-64">
                  <img
                    src={item.image || "/no-image.png"}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <p className="font-semibold truncate">{item.name}</p>
                  <p className="text-sm text-gray-700">
                    Rp {(item.price || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </Link>
              <div className="p-4 border-t">
                <button
                  onClick={() => handleUnlikeItem(item._id.toString())}
                  className="w-full bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600"
                >
                  Hapus dari Suka
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
