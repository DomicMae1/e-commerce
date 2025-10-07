/* eslint-disable @next/next/no-img-element */
// src/components/AddProductForm.tsx
"use client";

import { useState, FormEvent, ChangeEvent, useRef } from "react";

type AddProductFormProps = {
  onProductAdded: () => void;
  categories: { _id: string; name: string }[];
};

export default function AddProductForm({
  onProductAdded,
  categories,
}: AddProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(""); // base64 string
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert file to base64
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string); // simpan base64
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newProduct = {
      name,
      price: Number(price),
      image, // ini sudah dalam bentuk base64
      description,
      categoryId,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) {
        throw new Error("Gagal menambahkan produk");
      }

      alert("Produk berhasil ditambahkan!");
      // Reset form
      setName("");
      setPrice("");
      setImage("");
      setDescription("");
      setCategoryId("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onProductAdded();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-12 p-6 border rounded-lg bg-white shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Tambah Produk Baru</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Produk"
          required
          className="px-3 py-2 border rounded-md"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Harga"
          type="number"
          required
          className="px-3 py-2 border rounded-md"
        />

        {/* Ganti input URL menjadi file input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          ref={fileInputRef}
          className="px-3 py-2 border rounded-md"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi"
          required
          className="px-3 py-2 border rounded-md md:col-span-2"
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border rounded px-3 py-2"
          required
        >
          <option value="">Pilih Kategori</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Preview jika ada gambar */}
      {image && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Preview:</p>
          <img
            src={image}
            alt="Preview"
            className="mt-2 max-h-40 object-contain border rounded-md"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Menambahkan..." : "Tambah Produk"}
      </button>
    </form>
  );
}
