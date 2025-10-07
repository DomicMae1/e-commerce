"use client";

import { useAuth } from "@/context/AuthContext"; // pakai context untuk update state

export default function LogoutButton() {
  const { logout } = useAuth(); // ambil fungsi logout dari context

  const handleLogout = async () => {
    try {
      // panggil API logout (hapus cookie di server)
      await fetch("/api/auth/logout", { method: "POST" });

      // hapus data di context & localStorage
      logout();

      // reload penuh supaya semua state ikut reset
      window.location.href = "/";
    } catch (err) {
      console.error("Logout gagal:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}
