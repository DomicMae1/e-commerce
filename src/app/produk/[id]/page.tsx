/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({ params }: any) {
  const { id } = await params; // ⬅️ params harus di-await
  const product = products.find((p) => p.id.toString() === id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
