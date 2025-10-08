/* eslint-disable @next/next/no-img-element */
"use client";

import { Plus, Edit, Trash, Image as ImageIcon } from "lucide-react";
import { useCategory } from "./useCategory";

export default function Page() {
  const {
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
  } = useCategory();

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

          {/* Upload Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar Kategori
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border rounded px-3 py-2 w-full"
              ref={fileInputRef}
            />

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
              onClick={resetForm}
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
