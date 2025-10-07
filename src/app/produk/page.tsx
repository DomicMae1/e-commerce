// src/app/produk/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
};

export default function ProdukPage() {
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const endpoint = search
          ? `/api/products?search=${encodeURIComponent(search)}`
          : `/api/products`; // tampilkan semua produk jika search kosong

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
    <div className="w-full min-h-screen px-4 py-6 bg-white">
      <h1 className="text-2xl font-bold mb-4">
        {search ? (
          <>
            Hasil pencarian untuk:{" "}
            <span className="text-blue-600">{search}</span>
          </>
        ) : (
          "Semua Produk"
        )}
      </h1>

      {loading ? (
        <p>Memuat produk...</p>
      ) : products.length === 0 ? (
        <p>Tidak ada produk ditemukan.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/produk/${product._id}`}
              className="border rounded-lg p-4 shadow hover:shadow-md transition"
            >
              <Image
                src={product.image || "/no-image.png"}
                alt={product.name}
                width={300}
                height={300}
                className="w-full h-32 object-cover mb-2 rounded"
              />
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-gray-600 text-sm">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
