/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/produk/[id]/page.tsx

import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import type { Product } from "@/data/products";

// Fungsi untuk mengambil data satu produk dari API
async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) return null;
    const jsonResponse = await res.json();
    return jsonResponse.data;
  } catch (error) {
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Ambil data produk berdasarkan ID dari URL
  const product = await getProductById(params.id);

  // Jika produk tidak ada di database, tampilkan halaman 404
  if (!product) {
    notFound();
  }

  // Kirim data produk ke komponen client untuk ditampilkan
  return <ProductDetailClient product={product} />;
}
