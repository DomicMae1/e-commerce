/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import useProducts from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";
import PromoCard from "@/components/PromoCard";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Category = {
  _id: string;
  name: string;
  description?: string;
  image?: string; // base64
};

export default function HomePage() {
  const { products, loading } = useProducts();
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { isLoggedIn } = useAuth();

  // 🔹 Ambil kategori
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error("Gagal fetch kategori:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch("/api/likes/get", { cache: "no-store" });
        const likesData = await res.json();
        if (likesData.success) {
          setLikedIds(likesData.items.map((item: any) => item._id.toString()));
        }
      } catch (err) {
        console.error("Gagal fetch likes:", err);
      }
    };

    if (isLoggedIn && products.length > 0) {
      fetchLikes(); // ✅ hanya jalan jika sudah login
    }
  }, [isLoggedIn, products]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Loading produk...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-6">
      {/* 🔹 Daftar Kategori */}
      <div className="pb-6">
        {loadingCategories ? (
          <p className="text-center text-gray-500">Memuat kategori...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada kategori.</p>
        ) : (
          <div className="flex flex-wrap gap-3 justify-left">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center gap-2 bg-white rounded-2xl px-3 py-1 border transition hover:shadow-sm"
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
                <p className="font-medium text-gray-800 text-base whitespace-nowrap">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900">
          Selamat Datang di Toko Koding
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Dapatkan merchandise developer favoritmu di sini 🎉
        </p>
      </div>

      {/* Promo Carousel */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">
          Promo Spesial
        </h2>
        <Carousel
          className="w-full max-w-6xl mx-auto "
          opts={{ loop: true }} // supaya infinite scroll
          plugins={[
            Autoplay({
              delay: 3000, // ganti delay sesuai kebutuhan (ms)
              stopOnInteraction: false,
            }),
          ]}
        >
          <CarouselContent>
            <CarouselItem>
              <PromoCard
                title="Diskon 50% untuk Kaos Coding"
                subtitle="Promo berlaku sampai 10 Oktober"
                image="/promo1.svg"
              />
            </CarouselItem>
            <CarouselItem>
              <PromoCard
                title="Beli 1 Gratis 1 Stiker Dev"
                subtitle="Khusus pembelian hoodie"
                image="/promo2.svg"
              />
            </CarouselItem>
            <CarouselItem>
              <PromoCard
                title="Gratis Ongkir"
                subtitle="Minimal belanja Rp 200.000"
                image="/promo3.svg"
              />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Produk Unggulan */}
      <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">
        Produk Unggulan
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product: Product) => (
          <ProductCard
            key={product._id}
            product={{ ...product, _id: product._id.toString() }} // pastikan _id string
            isInitiallyLiked={likedIds.includes(product._id.toString())}
          />
        ))}
      </div>

      {/* Link ke semua produk */}
      <div className="text-center mt-12">
        <Link
          href="/produk"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Lihat Semua Produk
        </Link>
      </div>
    </div>
  );
}
