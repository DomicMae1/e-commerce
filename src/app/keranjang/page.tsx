/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/keranjang/page.tsx
"use client"; // Komponen ini interaktif, jadi harus Client Component

import { useState, useMemo } from "react";

// Mendefinisikan tipe data untuk setiap item di keranjang
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

// Data awal untuk simulasi (bisa diganti dengan data dari API atau state management)
const initialItems: CartItem[] = [
  {
    id: 1,
    name: "Exclusive Next.js Hoodie",
    price: 250000,
    quantity: 1,
    image: "/hoodie.jpg", // Ganti dengan path gambar produk Anda di folder /public
  },
  {
    id: 2,
    name: "React Developer Sticker",
    price: 25000,
    quantity: 2,
    image: "/sticker.jpg", // Ganti dengan path gambar produk Anda di folder /public
  },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [loading, setLoading] = useState(false);

  // Fungsi untuk mengubah jumlah barang
  const handleQuantityChange = (id: number, delta: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  // Fungsi untuk menghapus barang dari keranjang
  const handleRemoveItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Kalkulasi total harga menggunakan useMemo agar lebih efisien
  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  // Fungsi untuk proses checkout
  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("Keranjang Anda kosong!");
      return;
    }

    setLoading(true);
    try {
      // Menyiapkan detail item untuk dikirim ke Midtrans
      const item_details = items.map((item) => ({
        id: item.id.toString(),
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      }));

      const orderDetails = {
        order_id: `ORDER-${Date.now()}`,
        gross_amount: total,
        customer_details: {
          first_name: "Budi",
          last_name: "Susanto",
          email: "budi.s@example.com",
          phone: "081234567891",
        },
        item_details, // Kirim detail item ke backend
      };

      const response = await fetch("/api/payment/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDetails),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: (result: any) => alert("Pembayaran berhasil!"),
          onPending: (result: any) => alert("Menunggu pembayaran."),
          onError: (result: any) => alert("Pembayaran gagal."),
          onClose: () => alert("Anda menutup pop-up pembayaran."),
        });
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Keranjang Belanja Anda</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <p className="text-xl text-gray-500">Keranjang Anda kosong.</p>
          {/* Tambahkan link untuk kembali ke halaman produk */}
          <a
            href="/produk"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Mulai Belanja
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daftar Item */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-grow">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="px-2 py-1 border rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                </div>
                <p className="font-semibold w-28 text-right">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </p>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
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
