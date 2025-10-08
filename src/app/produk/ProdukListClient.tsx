// src/app/produk/ProdukListClient.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
};

export default function ProdukListClient() {
  const searchParams = useSearchParams();
  const search = searchParams?.get("search") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const endpoint = search
          ? `/api/products?search=${encodeURIComponent(search)}`
          : `/api/products`;

        const res = await fetch(endpoint);
        const data = await res.json();
        setProducts(data?.data || []);
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search]);

  return (
    <Suspense>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? "Memuat produk..."
          : products.map((product) => (
              <Link key={product._id} href={`/produk/${product._id}`}>
                <Image
                  src={product.image || "/no-image.png"}
                  alt={product.name}
                  width={300}
                  height={300}
                />
                <h2>{product.name}</h2>
                <p>Rp {product.price.toLocaleString("id-ID")}</p>
              </Link>
            ))}
      </div>
    </Suspense>
  );
}
