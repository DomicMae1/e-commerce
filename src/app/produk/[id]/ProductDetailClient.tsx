/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductDetailClient({ product }: { product: any }) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1); // ✅ Tambah state quantity

  const handleCheckout = async () => {
    const data = {
      id: `ORDER-${product.id}-${Date.now()}`,
      productName: product.name,
      price: product.price,
      quantity: quantity, // ✅ sekarang terdefinisi
    };

    console.log("Data yang dikirim ke backend:", data);

    try {
      const response = await fetch("/api/payment/create-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const requestData = await response.json();

      if (response.ok) {
        if (window.snap) {
          window.snap.pay(requestData.token);
        } else {
          alert("Snap.js belum dimuat!");
        }
      } else {
        alert(requestData.error || "Gagal membuat transaksi");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat checkout");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-24 bg-gray-50">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 md:p-8 shadow-lg">
        <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        <p className="mt-2 mb-6 text-gray-600">{product.description}</p>
        <div className="mb-8 text-4xl font-extrabold text-gray-900">
          Rp {product.price.toLocaleString("id-ID")}
        </div>

        {/* ✅ Input jumlah produk */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1 border rounded"
          >
            -
          </button>
          <span className="text-lg font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-1 border rounded"
          >
            +
          </button>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Memproses..." : "Beli Sekarang"}
        </button>
      </div>
    </main>
  );
}
