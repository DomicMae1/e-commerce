import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

export type Category = {
  _id: string;
  name: string;
  description?: string;
  image?: string;
};

export function useCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", image: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔹 Ambil daftar kategori
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

  // 🔹 Tambah / Update kategori
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
        resetForm();
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

  // 🔹 Reset form
  const resetForm = () => {
    setForm({ name: "", description: "", image: "" });
    setPreview(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    categories,
    loading,
    form,
    setForm,
    editingId,
    preview,
    fileInputRef,
    handleImageChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
  };
}
