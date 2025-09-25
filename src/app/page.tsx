// src/app/produk/page.tsx
import ProductCard from "@/components/ProductCard"; // Impor komponen kartu produk

// Definisikan daftar semua produk yang tersedia di toko
// (sama seperti di homepage untuk konsistensi)
const allProducts = [
  {
    id: 1,
    name: "Exclusive Next.js Hoodie",
    price: 250000,
    image: "/hoodie.jpg",
  },
  {
    id: 2,
    name: "React Developer Sticker",
    price: 25000,
    image: "/sticker.jpg",
  },
  {
    id: 3,
    name: "Mug Kopi Koding",
    price: 85000,
    image: "/mug.jpg",
  },
  // Anda bisa menambahkan lebih banyak produk di sini di masa depan
];

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900">Semua Produk</h1>
        <p className="mt-2 text-lg text-gray-600">
          Temukan semua perlengkapan favoritmu di sini.
        </p>
      </div>

      {/* Gunakan grid untuk menampilkan semua produk menggunakan ProductCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
