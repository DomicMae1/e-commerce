"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import AddProductForm from "@/components/AddProductForm";
import EditProductForm from "@/components/EditProductForm";
import type { Product } from "@/data/products";
import { getCookie } from "@/utils/cookies";

type Category = {
  _id: string;
  name: string;
  description?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // ✅ Ambil role dari cookie
  useEffect(() => {
    const role = getCookie("role");
    setUserRole(role || null);
  }, []);

  // ✅ Fetch data produk
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products");
      const jsonResponse = await res.json();
      if (jsonResponse.success) {
        setProducts(jsonResponse.data);
      }
    } catch (error) {
      console.error("Gagal memuat produk:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Fetch kategori dari API
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Gagal memuat kategori:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ✅ Hapus produk (khusus admin/manager)
  const handleDeleteProduct = async (id: string) => {
    if (!userRole || !["admin", "manager"].includes(userRole)) {
      alert("Anda tidak memiliki izin untuk menghapus produk");
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus produk");
      alert("Produk berhasil dihapus!");
      setProducts((prev) => prev.filter((p) => p._id.toString() !== id));
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus produk.");
    }
  };

  // ✅ Update produk
  const handleUpdateProduct = async (updated: Product) => {
    if (!userRole || !["admin", "manager"].includes(userRole)) {
      alert("Anda tidak memiliki izin untuk memperbarui produk");
      return;
    }

    try {
      const res = await fetch(`/api/products/${updated._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Gagal memperbarui produk");

      alert("Produk berhasil diperbarui!");
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memperbarui produk.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Manajemen Produk
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Tambah atau lihat produk yang ada di database Anda.
        </p>
      </div>

      {/* ✅ Form tambah hanya muncul untuk admin / manager */}
      {userRole && ["admin", "manager"].includes(userRole) && (
        <AddProductForm
          onProductAdded={fetchProducts}
          categories={categories} // ⬅️ kirim daftar kategori ke form
        />
      )}

      <h2 className="text-3xl font-bold text-center mb-10 border-t pt-10">
        Daftar Produk
      </h2>

      {isLoading ? (
        <p className="text-center">Memuat produk...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">
          Tidak ada produk yang ditemukan.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={{ ...product, id: product._id.toString() }}
              onDelete={
                userRole && ["admin", "manager"].includes(userRole)
                  ? () => handleDeleteProduct(product._id.toString())
                  : undefined
              }
              onEdit={
                userRole && ["admin", "manager"].includes(userRole)
                  ? () => setEditingProduct(product)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* ✅ Modal edit produk */}
      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          categories={categories} // ⬅️ kirim juga ke form edit
          onCancel={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
        />
      )}
    </div>
  );
}
