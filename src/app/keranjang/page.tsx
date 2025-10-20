/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCookie } from "@/utils/cookies";
import { useCart } from "@/context/CartContext"; // ✅ pakai context

type CartItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string | null;
  description?: string;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  // ✅ ambil context
  const { incrementCart, decrementCart, syncCartFromServer } = useCart();

  // ✅ Ambil data keranjang dari backend
  const fetchCart = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/carts/get", { method: "GET" });
      if (!res.ok) throw new Error("Gagal mengambil keranjang");
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error(error);
      setItems([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ Ubah quantity (optimistic update)
  const handleQuantityChange = async (productId: string, delta: number) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    const attemptedQuantity = item.quantity + delta;
    // Jangan turunkan di bawah 1
    const newQuantity = Math.max(1, attemptedQuantity);

    // actualDelta = perubahan nyata yang akan kita lakukan
    const actualDelta = newQuantity - item.quantity;
    // kalau tidak ada perubahan (mis. coba kurangi saat sudah 1), jangan melakukan apa-apa
    if (actualDelta === 0) return;

    const userId = getCookie("_id");

    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: newQuantity } : i
      )
    );

    // hanya update context berdasarkan perubahan nyata
    if (actualDelta > 0) incrementCart(actualDelta);
    else decrementCart(Math.abs(actualDelta));

    try {
      const res = await fetch("/api/carts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // kirim actualDelta agar backend tahu berapa yang berubah
        body: JSON.stringify({
          userId,
          productId,
          quantity: actualDelta, // backend diharapkan menerima delta (positif/negatif)
        }),
      });
      if (!res.ok) throw new Error("Gagal update quantity");
      // 🔄 sync ulang biar pasti sama
      syncCartFromServer();
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui keranjang");
      fetchCart(); // rollback kalau error
      syncCartFromServer();
    }
  };

  // ✅ Hapus item (optimistic juga)
  const handleRemoveItem = async (productId: string) => {
    const userId = getCookie("_id");

    // langsung optimistik hapus di UI
    const removedItem = items.find((i) => i.productId === productId);
    if (!removedItem) return;
    setRemovingItem(productId);
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    decrementCart(removedItem.quantity);

    try {
      const res = await fetch("/api/carts/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });
      if (!res.ok) throw new Error("Gagal hapus produk");
      await fetchCart();
      syncCartFromServer();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus item");
      await fetchCart(); // rollback
      syncCartFromServer();
    } finally {
      setRemovingItem(null); // 🔹 matikan loading
    }
  };

  // ✅ Hitung total
  const total = useMemo(() => {
    return items.reduce(
      (acc, item) => acc + (item.price || 0) * item.quantity,
      0
    );
  }, [items]);

  // ✅ Checkout
  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("Keranjang Anda kosong!");
      return;
    }

    setLoading(true);
    try {
      // 🔹 Ambil nama user dari cookie (atau bisa dari auth context)
      const userName = getCookie("name") || "User";

      // 🔹 Hitung total quantity dari seluruh item di keranjang
      const totalQuantity = items.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );

      // 🔹 Hitung index order (bisa berdasarkan jumlah order user sebelumnya kalau backend mendukung)
      const orderIndex = Math.floor(Math.random() * 1000);

      // 2️⃣ (Opsional) Simpan order ke database / backend jika ingin disimpan
      const payload = {
        productName: `${userName} - keranjang ${orderIndex}`,
        price: total,
        quantity: totalQuantity,
        items, // daftar produk
        status: "pending",
        created_at: new Date().toISOString(),
      };

      // Misalnya kamu punya endpoint untuk membuat order baru
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Jika backend belum ada, blok ini bisa dilewati dulu
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Gagal membuat order");
      }

      // 🔹 Ambil hasil dari backend
      const result = await response.json();

      // Pastikan hasil mengandung `_id`
      const insertedId =
        result?.data?.insertedId ||
        result?.data?._id ||
        result?.insertedId ||
        null;

      if (!insertedId) {
        throw new Error("Tidak dapat menemukan ID order dari server.");
      }

      // 🔹 Redirect ke halaman detail order
      router.push(`/order/${insertedId}`);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat pesanan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 w-full">
      <h1 className="text-3xl font-bold mb-6">Keranjang Belanja Anda</h1>

      {fetching ? (
        <div className="w-full h-screen flex items-center justify-center">
          <p className="text-gray-500">Memuat keranjang...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <p className="text-xl text-gray-500">Keranjang Anda kosong.</p>
          <Link
            href="/produk"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daftar Item */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between border p-4 rounded-lg"
              >
                {removingItem === item.productId && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <p className="text-gray-700 font-medium animate-pulse">
                      Mohon tunggu sebentar...
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <img
                    src={item.image || "/no-image.png"}
                    alt={item.productName}
                    className="w-24 h-24 object-cover rounded"
                  />

                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      Rp {(item.price || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      item.quantity > 1 &&
                      handleQuantityChange(item.productId, -1)
                    }
                    className="px-2 py-1 border rounded disabled:opacity-50"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.productId, 1)}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="ml-4 text-red-500"
                    disabled={removingItem === item.productId}
                  >
                    {removingItem === item.productId ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Ringkasan Belanja */}
          <div className="lg:col-span-1">
            <div className="p-6 border rounded-lg shadow-sm sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Ringkasan Belanja</h2>
              <div className="flex justify-between mb-6">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-2xl">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
