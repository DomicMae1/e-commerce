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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Category = {
  _id: string;
  name: string;
  description?: string;
  image?: string; // base64
};

export default function HomePage() {
  const { products: fetchedProducts, loading } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUserRole(data?.user?.role || null);
      } catch (error) {
        console.error("Gagal ambil data user:", error);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Ambil kategori
  useEffect(() => {
    const localData = localStorage.getItem("categories");
    if (localData) {
      setCategories(JSON.parse(localData));
      setLoadingCategories(false);
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
          localStorage.setItem("categories", JSON.stringify(data.data)); // simpan ke localStorage
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
    const localData = localStorage.getItem("products");
    if (localData) {
      setProducts(JSON.parse(localData));
    }

    // Jika data produk baru sudah di-fetch dari useProducts, update local storage
    if (fetchedProducts.length > 0) {
      setProducts(fetchedProducts);
      localStorage.setItem("products", JSON.stringify(fetchedProducts));
    }
  }, [fetchedProducts]);

  useEffect(() => {
    const localData = localStorage.getItem("promos");
    if (localData) {
      const parsed = JSON.parse(localData).filter((p: any) => p && p.title);
      setPromos(parsed);
    }

    const fetchPromos = async () => {
      try {
        const res = await fetch("/api/promo", { cache: "no-store" });
        const data = await res.json();

        if (data.success) {
          const promoList = Array.isArray(data.data) ? data.data : [data.data];

          const validPromos = promoList.filter(
            (p: { title: any }) => p && p.title
          );

          setPromos(validPromos);
          localStorage.setItem("promos", JSON.stringify(validPromos));
        }
      } catch (err) {
        console.error("Gagal fetch promo:", err);
      }
    };

    fetchPromos();
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

        {/* Promo Section */}
        <Carousel
          className="w-full max-w-6xl mx-auto"
          opts={{ loop: true }}
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: false,
            }),
          ]}
        >
          <CarouselContent>
            {promos
              .filter((promo) => promo && promo.title) // pastikan tidak null
              .map((promo: any, index: number) => (
                <CarouselItem key={promo._id?.$oid || promo._id || index}>
                  <PromoCard
                    title={promo.title}
                    subtitle={promo.subtitle}
                    image={promo.image}
                  />
                </CarouselItem>
              ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        {/* 👇 Tombol hanya muncul jika user role = admin */}
        {userRole === "admin" && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push("/promo/admin")}
            >
              ✏️ Edit Promo
            </Button>
          </div>
        )}
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
