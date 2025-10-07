/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/produk/[id]/ProductDetailClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const payload = {
        id: `ORDER-${product._id}-${Date.now()}`,
        productName: product.name,
        price: product.price,
        quantity: quantity,
      };

      const response = await fetch("/api/payment/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Gagal membuat transaksi");

      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: (result: any) =>
            alert(`Pembayaran berhasil! ID: ${result.order_id}`),
          onPending: (result: any) =>
            alert(`Menunggu pembayaran. ID: ${result.order_id}`),
          onError: (result: any) =>
            alert(`Pembayaran gagal. ID: ${result.order_id}`),
        });
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
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
        <p className="mt-2 mb-4 text-gray-600">{product.description}</p>
        <div className="flex items-center justify-between mb-6">
          <p className="text-3xl font-extrabold text-gray-900">
            Rp {(product.price * quantity).toLocaleString("id-ID")}
          </p>
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 text-lg"
            >
              -
            </button>
            <span className="px-3 text-lg font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 text-lg"
            >
              +
            </button>
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Memproses..." : "Beli Sekarang"}
        </button>
      </div>
    </main>
  );
}
