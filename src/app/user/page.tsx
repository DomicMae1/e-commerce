"use client";

import { useEffect, useState } from "react";

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

  // 🔹 Fetch profil user yang sedang login
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/profile", {
        method: "GET",
        credentials: "include", // penting agar cookie token dikirim
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
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

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <p className="text-gray-600 p-6">Memuat profil...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;

  if (!user)
    return (
      <p className="text-gray-500 p-6">
        Tidak ada data pengguna. Pastikan Anda sudah login.
      </p>
    );

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Profil Pengguna</h1>

      <div className="bg-white rounded-xl shadow p-6 border">
        <p className="mb-2">
          <span className="font-semibold">Nama:</span> {user.name}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Akun dibuat:{" "}
          {user.createdAt
            ? new Date(user.createdAt).toLocaleString("id-ID")
            : "-"}
        </p>
      </div>
    </div>
  );
}
