/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          // ✅ tampilkan semua kategori tanpa dibatasi
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="w-full min-h-screen px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center py-10">
        Kategori Produk
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Memuat kategori...</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-500">Belum ada kategori.</p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="flex items-center gap-2 bg-white border rounded-2xl px-4 py-2 shadow-sm hover:shadow-md transition"
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-6 h-6 object-cover rounded"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 rounded">
                  🖼️
                </div>
              )}
              <span className="text-gray-800 font-medium whitespace-nowrap">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
