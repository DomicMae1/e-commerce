// src/components/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";

// Mendefinisikan tipe data untuk sebuah produk
type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string;
};

// Mendefinisikan tipe props untuk komponen ProductCard
type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    // Seluruh kartu adalah link ke halaman detail produk (contoh: /produk/1)
    <Link
      href={`/produk/${product.id}`}
      className="group block overflow-hidden"
    >
      <div className="border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-64 w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill // Mengisi seluruh area div
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }} // Membuat gambar menutupi area tanpa distorsi
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-6 bg-white">
          <h3 className="font-semibold text-xl text-gray-800 mb-2 truncate">
            {product.name}
          </h3>
          <p className="text-gray-900 text-lg font-bold">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </Link>
  );
}
