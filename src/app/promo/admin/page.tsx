/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Promo {
  _id?: string;
  title: string;
  subtitle: string;
  image: string;
}

export default function ManagePromoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [form, setForm] = useState<Promo>({
    title: "",
    subtitle: "",
    image: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch("/api/promo");
        const data = await res.json();
        if (data?.data) setPromos(data.data);
      } catch (error) {
        console.error("Gagal ambil promo:", error);
      }
    };
    fetchPromos();
  }, []);

  // Handler form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Batasi ukuran file maksimal sebelum resize (opsional)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar terlalu besar (maksimal 5MB).");
      return;
    }

    try {
      const resizedBase64 = await resizeAndCompressImage(file, 800, 0.7);
      setForm({ ...form, image: resizedBase64 });
    } catch (error) {
      console.error("Gagal kompres gambar:", error);
      toast.error("Gagal memproses gambar");
    }
  };

  // 🔧 Fungsi utilitas resize & kompres
  function resizeAndCompressImage(
    file: File,
    maxWidth: number,
    quality: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas tidak didukung");

          // Hitung proporsi ukuran baru
          const scale = Math.min(maxWidth / img.width, 1);
          const width = img.width * scale;
          const height = img.height * scale;

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          // Kompres jadi JPEG (lebih kecil daripada PNG)
          const base64 = canvas.toDataURL("image/jpeg", quality); // quality = 0.7 = 70%
          resolve(base64);
        };

        img.onerror = reject;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Simpan / update promo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/promo?id=${editingId}` : "/api/promo";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Gagal menyimpan promo");
      const result = await res.json();

      toast.success(
        editingId ? "Promo berhasil diperbarui!" : "Promo baru ditambahkan!"
      );
      setForm({ title: "", subtitle: "", image: "" });
      setEditingId(null);

      // Refresh list
      const refresh = await fetch("/api/promo");
      const newData = await refresh.json();
      setPromos(newData?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("❌ Terjadi kesalahan saat menyimpan promo");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promo: Promo) => {
    setForm(promo);
    setEditingId(promo._id || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔹 Klik tombol hapus
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus promo ini?")) return;
    try {
      const res = await fetch(`/api/promo?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal hapus promo");
      toast.success("Promo dihapus!");
      setPromos(promos.filter((p) => p._id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus promo");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {editingId ? "✏️ Edit Promo" : "➕ Tambah Promo Baru"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Judul Promo</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Masukkan judul promo"
                required
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subjudul</Label>
              <Input
                id="subtitle"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                placeholder="Masukkan subjudul promo"
                required
              />
            </div>

            <div>
              <Label htmlFor="image">Upload Gambar Promo</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="px-3 py-2 border rounded-md w-full"
              />
            </div>

            {form.image && (
              <div className="flex justify-center">
                <img
                  src={form.image}
                  alt="Preview Promo"
                  className="w-64 h-40 object-contain rounded-md border mt-2"
                />
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/")}
              >
                Kembali
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Menyimpan..."
                  : editingId
                  ? "💾 Simpan Perubahan"
                  : "➕ Tambah Promo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 🔹 Daftar Promo */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Daftar Promo</h2>
        <div className="space-y-4">
          {promos.map((promo) => (
            <Card key={promo._id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-24 h-16 object-contain border rounded-md"
                  />
                  <div>
                    <h3 className="font-bold">{promo.title}</h3>
                    <p className="text-sm text-gray-500">{promo.subtitle}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEdit(promo)}>
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(promo._id!)}
                  >
                    🗑️ Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {promos.length === 0 && (
            <p className="text-center text-gray-500">
              Belum ada promo terdaftar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
