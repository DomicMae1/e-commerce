/* eslint-disable @typescript-eslint/no-unused-vars */
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
  const [imageLoading, setImageLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert file to base64
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate if it's an image file (optional but recommended)
    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar.");
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
      return;
    }

    setImageLoading(true); // Start loading indicator

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        // --- Image Resizing Logic ---
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          console.error("Could not get canvas context");
          setImageLoading(false);
          return; // Handle error appropriately
        }

        // Define maximum dimensions (e.g., 800x800 pixels)
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;

        // Draw the resized image onto the canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Get the base64 string from the canvas (JPEG format with quality 0.8)
        // Adjust 'image/jpeg' and quality (0.0 - 1.0) as needed
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

        setImage(dataUrl); // Set the resized base64 string to state
        setImageLoading(false); // Stop loading indicator
        URL.revokeObjectURL(img.src); // Clean up blob URL
      };

      img.onerror = () => {
        console.error("Failed to load image for resizing.");
        alert("Gagal memproses gambar.");
        setImageLoading(false);
        URL.revokeObjectURL(img.src);
      };

      // Load image data into the img element using Object URL
      img.src = URL.createObjectURL(file);
    };

    reader.onerror = (error) => {
      console.error("File reading error:", error);
      alert("Gagal membaca file gambar.");
      setImageLoading(false);
    };

    // Read the file initially (only needed to trigger onload with image data)
    // We don't use reader.result directly anymore for the final base64.
    reader.readAsDataURL(file); // This helps load the image dimensions correctly sometimes
    // but the final base64 comes from canvas.toDataURL
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (imageLoading) {
      alert("Gambar sedang diproses, mohon tunggu sebentar.");
      return;
    }

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
          disabled={imageLoading}
        />

        {/* Optional: Loading indicator */}
        {imageLoading && (
          <p className="text-sm text-blue-600 mt-2">Memproses gambar...</p>
        )}

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
      {image && !imageLoading && (
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
        disabled={loading || imageLoading}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Menambahkan..." : "Tambah Produk"}
      </button>
    </form>
  );
}
