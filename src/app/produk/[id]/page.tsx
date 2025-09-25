/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import ProductDetailClient from "./ProductDetailClient";

export default function ProductDetailPage({ params }: any) {
  const product = products.find((p) => p.id.toString() === params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
