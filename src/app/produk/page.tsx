import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products"; // Impor data dari file terpusat

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900">Semua Produk</h1>
        <p className="mt-2 text-lg text-gray-600">
          Temukan semua perlengkapan favoritmu di sini.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
