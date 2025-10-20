/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  // 🔹 Fetch profil user
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/profile", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
        });
      } else {
        setError(data.message || "Gagal mengambil profil user.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memuat profil.");
    } finally {
      setLoading(false);
    }
  };

  console.log(user);

  // 🔹 Update profil user
  const handleUpdate = async () => {
    if (!user?._id) return;
    setSaving(true);
    setError("");

    // Kirim hanya field yang berubah
    const payload: Record<string, any> = {};

    if (formData.name.trim() !== user.name) {
      payload.name = formData.name.trim();
    }
    if (formData.email.trim() !== user.email) {
      payload.email = formData.email.trim();
    }
    if (user.role) {
      payload.role = user.role; // hanya kirim jika role ada
    }

    // Jika tidak ada perubahan, batalkan request
    if (Object.keys(payload).length === 0) {
      alert("Tidak ada perubahan data untuk disimpan.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/user/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any;
      try {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          throw new Error(
            "Respons bukan JSON. Mungkin endpoint tidak ditemukan (404)."
          );
        }
      } catch {
        setError(
          "Endpoint API tidak ditemukan. Pastikan backend menyediakan route PUT /api/users/:id"
        );
        setSaving(false);
        return;
      }
      if (data.success) {
        setUser({
          ...user,
          name: payload.name || user.name,
          email: payload.email || user.email,
        });
        setEditing(false);
      } else {
        setError(data.message || "Gagal memperbarui data.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Profil Pengguna</h1>

      {loading ? (
        <div className="bg-white rounded-xl shadow p-6 border">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <p>{error}</p>
        </div>
      ) : user ? (
        <div className="bg-white rounded-xl shadow p-6 border">
          {editing ? (
            <div className="space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  placeholder={user.name || "Nama belum diisi"}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nama sebelumnya:{" "}
                  <span className="font-medium">{user.name}</span>
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder={user.email || "Email belum diisi"}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email sebelumnya:{" "}
                  <span className="font-medium">{user.email}</span>
                </p>
              </div>

              {/* Tombol */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600">Nama</p>
                <p className="text-lg">{user.name}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600">Email</p>
                <p className="text-lg">{user.email}</p>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Akun dibuat:{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString("id-ID", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })
                  : "-"}
              </p>

              <button
                onClick={() => setEditing(true)}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit Profil
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-yellow-200">
          <p>Tidak ada data pengguna. Pastikan Anda sudah login.</p>
        </div>
      )}
    </div>
  );
}
