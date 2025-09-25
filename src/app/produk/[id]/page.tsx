"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { products } from "@/data/products";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1); // Tambahkan state untuk kuantitas

  const product = products.find((p) => p.id.toString() === params.id);

  if (!product) {
    notFound();
  }

  // Fungsi untuk mengubah kuantitas
  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleCheckout = async () => {
    const data = {
      id: `ORDER-${product.id}-${Date.now()}`,
      productName: product.name,
      price: product.price,
      quantity: quantity,
    };

    // PERBAIKAN: Sesuaikan endpoint dengan lokasi file backend Anda
    const response = await fetch("/api/payment/create-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const requestData = await response.json();

    if (response.ok) {
      window.snap.pay(requestData.token);
    } else {
      alert(requestData.error || "Gagal membuat transaksi");
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

        {/* Tambahkan pengatur kuantitas */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-3xl font-extrabold text-gray-900">
            Rp {(product.price * quantity).toLocaleString("id-ID")}
          </p>
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="px-3 py-1 text-lg"
            >
              -
            </button>
            <span className="px-3 text-lg font-semibold">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="px-3 py-1 text-lg"
            >
              +
            </button>
          </div>
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
