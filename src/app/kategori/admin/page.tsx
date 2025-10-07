/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Edit, Trash, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";

type Category = {
  _id: string;
  name: string;
  description?: string;
  image?: string; // base64 string
};

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", image: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔹 Ambil daftar kategori saat halaman dimuat
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        toast.error(data.error || "Gagal memuat kategori");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat memuat kategori");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Konversi file ke base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setForm((prev) => ({ ...prev, image: base64String }));
      setPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Tambah atau Update kategori
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Nama kategori wajib diisi");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/categories/${editingId}`
        : "/api/categories";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          editingId
            ? "Kategori berhasil diperbarui"
            : "Kategori berhasil ditambahkan"
        );
        setForm({ name: "", description: "", image: "" });
        setPreview(null);
        setEditingId(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        fetchCategories();
      } else {
        toast.error(data.error || "Gagal menyimpan kategori");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan kategori");
    }
  };

  // 🔹 Edit kategori
  const handleEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
    });
    setPreview(cat.image || null);
    setEditingId(cat._id);
  };

  // 🔹 Hapus kategori
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Kategori berhasil dihapus");
        fetchCategories();
      } else {
        toast.error(data.error || "Gagal menghapus kategori");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menghapus kategori");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📂 Manajemen Kategori</h1>

      {/* Form Tambah / Edit */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 bg-white shadow p-4 rounded-lg border"
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nama kategori"
            className="border rounded px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            placeholder="Deskripsi (opsional)"
            className="border rounded px-3 py-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* 🔹 Upload Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar Kategori
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border rounded px-3 py-2 w-full"
            />

            {/* 🔹 Preview gambar */}
            {preview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Preview:</p>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            {editingId ? "Perbarui Kategori" : "Tambah Kategori"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", description: "", image: "" });
                setPreview(null);
              }}
              className="text-sm text-gray-600 underline"
            >
              Batal edit
            </button>
          )}
        </div>
      </form>

      {/* Daftar Kategori */}
      {loading ? (
        <p>Memuat kategori...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-600">Belum ada kategori.</p>
      ) : (
        <div className="grid gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* 🔹 Gambar kategori */}
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded">
                    <ImageIcon className="text-gray-400" size={28} />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-gray-600 text-sm">{cat.description}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
