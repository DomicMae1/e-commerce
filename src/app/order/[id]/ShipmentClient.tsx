/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  productName: string;
  price: number;
  quantity: number;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image: string;
    description?: string;
  }[];
  status: string;
  created_at: string;
}

interface Penerima {
  nama: string;
  email: string;
  telepon: string;
  perusahaan: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  alamat: string;
  kodePos: string;
}

export default function ShipmentClient({ order }: { order: Order }) {
  const router = useRouter();

  const [penerimaData, setPenerimaData] = useState<Penerima>({
    nama: "",
    email: "",
    telepon: "",
    perusahaan: "",
    provinsi: "",
    kota: "",
    kecamatan: "",
    alamat: "",
    kodePos: "",
  });

  const handlePenerimaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPenerimaData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPengiriman = async () => {
    if (!penerimaData.nama || !penerimaData.telepon || !penerimaData.alamat) {
      alert("Harap lengkapi nama, telepon, dan alamat penerima.");
      return;
    }

    try {
      // 🔹 Update data order di backend
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          penerima: penerimaData,
          status: "confirmed",
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memperbarui pesanan.");
      }

      // 🔹 Buat query string untuk data customer
      const queryParams = new URLSearchParams({
        namaPenerima: penerimaData.nama,
        email: penerimaData.email || "-", // opsional
        telepon: penerimaData.telepon,
        perusahaan: penerimaData.perusahaan || "-",
        alamat: penerimaData.alamat,
        namaProduk: order?.productName || "Produk Tidak Dikenal",
        kuantitas: order?.quantity?.toString() || "1",
        totalHarga: order?.price?.toString() || "0",
        tanggalPesanan: order?.created_at || new Date().toISOString(),
        status: order?.status || "pending",
      });

      // 🔹 Redirect ke halaman konfirmasi dengan data penerima di query params
      router.push(`/order/${order._id}/konfirmasi?${queryParams.toString()}`);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data penerima.");
    }
  };

  const totalHarga = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-white p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Detail Pesanan #{order._id}
      </h2>

      {/* Produk */}
      <div className="border border-gray-200 rounded-lg shadow mb-6 p-6 bg-white">
        <h3 className="font-semibold text-lg mb-4">Daftar Barang</h3>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-3"
            >
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-20 h-20 rounded object-cover border"
                />
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} x Rp{" "}
                    {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-cyan-600">
                Rp {(item.price * item.quantity).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right font-bold text-lg text-cyan-700">
          Total: Rp {totalHarga.toLocaleString("id-ID")}
        </div>
      </div>

      {/* Form Penerima */}
      <div className="border border-gray-200 rounded-lg shadow p-6 bg-white">
        <h3 className="font-semibold text-lg mb-4">Informasi Penerima</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(penerimaData).map((key) => (
            <div key={key}>
              <label className="block text-sm mb-1 capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                name={key}
                value={(penerimaData as any)[key]}
                onChange={handlePenerimaChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
                placeholder={`Masukkan ${key}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmitPengiriman}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Kirim Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
