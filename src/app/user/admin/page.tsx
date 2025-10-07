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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", role: "user" });
  const [editId, setEditId] = useState<string | null>(null);

  // 🔹 Fetch data user saat halaman dibuka
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || "Gagal mengambil data user.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Handle form submit untuk tambah user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Nama dan email wajib diisi!");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/user/${editId}` : `/api/user`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        fetchUsers(); // Refresh data setelah tambah/edit
        setForm({ name: "", email: "", role: "user" });
        setEditId(null);
      } else {
        alert(data.message || "Gagal menyimpan data user.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan user.");
    }
  };

  // 🔹 Edit user (prefill form)
  const handleEdit = (user: User) => {
    setForm({ name: user.name, email: user.email, role: user.role });
    setEditId(user._id);
  };

  // 🔹 Batal edit
  const cancelEdit = () => {
    setForm({ name: "", email: "", role: "user" });
    setEditId(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Daftar User</h1>

      {/* Form tambah user */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 bg-gray-50 p-6 rounded-xl shadow-sm border"
      >
        <h2 className="text-lg font-semibold mb-4">
          {editId ? "Edit User" : "Tambah User Baru"}
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nama"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-200 outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-200 outline-none"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-200 outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="mt-4 flex items-center space-x-3">
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {editId ? "Update" : "Simpan"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-5 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Data user */}
      {loading ? (
        <p className="text-gray-600">Memuat data user...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">Belum ada user terdaftar.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 font-semibold">Nama</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Role</th>
                <th className="p-3 font-semibold">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleString("id-ID")
                      : "-"}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleEdit(u)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
