"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import { Trash, ShoppingCart, Heart } from "lucide-react";
import { getCookie } from "@/utils/cookies";
import { useCart } from "@/context/CartContext";
import { useLikes } from "@/context/LikesContext";

type ProductCardProps = {
  product: Product;
  onDelete?: (id: string) => void;
  onEdit?: () => void;
  isInitiallyLiked?: boolean;
};

export default function ProductCard({
  product,
  onDelete,
  onEdit,
  isInitiallyLiked = false,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [isLiking, setIsLiking] = useState(false);
  const { incrementCart, decrementCart } = useCart();
  const { mutateLikes } = useLikes();
  const userId = getCookie("_id");

  useEffect(() => {
    setIsLiked(isInitiallyLiked);
  }, [isInitiallyLiked]);

  const handleAddToCart = async () => {
    if (!userId) {
      alert("Silakan login terlebih dahulu untuk menambahkan ke keranjang");
      return;
    }

    incrementCart(quantity);
    try {
      const res = await fetch("/api/carts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId: product._id, quantity }),
      });

      if (!res.ok) throw new Error("Gagal menambahkan ke keranjang");
      alert("Produk berhasil ditambahkan ke keranjang");
    } catch (err) {
      console.error(err);
      decrementCart(quantity);
    }
  };

  const handleLike = async () => {
    if (!userId) {
      alert("Silakan login terlebih dahulu untuk menyukai produk");
      return;
    }

    setIsLiking(true);
    const newLiked = !isLiked;
    setIsLiked(newLiked);

    try {
      const res = await fetch("/api/likes/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses permintaan");

      mutateLikes();
    } catch (err) {
      console.error(err);
      setIsLiked((prev) => !prev);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white flex flex-col justify-between relative">
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm(`Hapus ${product.name}?`)) {
              onDelete(product._id.toString());
            }
          }}
          className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-2 hover:bg-red-700 transition"
        >
          <Trash size={16} />
        </button>
      )}

      <Link
        href={`/produk/${product._id}`}
        className="group block overflow-hidden"
      >
        <div className="relative h-64 w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4 text-center">
          <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">
            {product.name}
          </h3>
          <p className="text-gray-900 text-base font-bold">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
        </div>
      </Link>

      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Jumlah:</span>
          <div className="flex items-center gap-2 border rounded-md">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 text-lg"
            >
              -
            </button>
            <span className="px-2 text-lg font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 text-lg"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex-1 flex justify-center items-center rounded-md border border-gray-300 bg-white p-2 transition hover:bg-gray-50 disabled:bg-gray-200 mr-2"
          >
            <Heart
              size={20}
              strokeWidth={2}
              className={
                isLiked ? "stroke-red-500 fill-red-500" : "stroke-gray-700"
              }
            />
          </button>

          <button
            onClick={handleAddToCart}
            className="flex-1 flex justify-center items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className="mt-3 w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
