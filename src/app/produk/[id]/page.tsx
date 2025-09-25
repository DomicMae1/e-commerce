"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { products } from "@/data/products";

// Definisikan tipe props secara inline untuk menghindari konflik
export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [loading, setLoading] = useState(false);

  const product = products.find((p) => p.id.toString() === params.id);

  if (!product) {
    notFound();
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const orderDetails = {
        order_id: `ORDER-${product.id}-${Date.now()}`,
        gross_amount: product.price,
        customer_details: {
          first_name: "Budi",
          last_name: "Prasetyo",
          email: "budi.p@example.com",
          phone: "081234567890",
        },
        item_details: [
          {
            id: product.id.toString(),
            price: product.price,
            quantity: 1,
            name: product.name,
          },
        ],
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
          // Gunakan tipe MidtransPayResult dari file types/midtrans.d.ts
          onSuccess: (result: MidtransPayResult) =>
            alert(`Pembayaran berhasil! ID: ${result.order_id}`),
          onPending: (result: MidtransPayResult) =>
            alert(`Menunggu pembayaran. ID: ${result.order_id}`),
          onError: (result: MidtransPayResult) =>
            alert(`Pembayaran gagal. ID: ${result.order_id}`),
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
