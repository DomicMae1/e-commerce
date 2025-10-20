/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import OrderSteps from "@/components/OrderSteps";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const orderId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  // Ambil data dari query URL
  const data = {
    namaPenerima: searchParams.get("namaPenerima"),
    email: searchParams.get("email"),
    telepon: searchParams.get("telepon"),
    perusahaan: searchParams.get("perusahaan"),
    alamat: searchParams.get("alamat"),
    namaProduk: searchParams.get("namaProduk"),
    kuantitas: searchParams.get("kuantitas"),
    totalHarga: searchParams.get("totalHarga"),
  };

  const [form, setForm] = useState({
    first_name: data.namaPenerima || "",
    last_name: "",
    email: data.email, // email awalnya kosong
    phone: data.telepon || "",
  });

  const totalHargaFormatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(data.totalHarga) || 0);

  const handleSubmitPengiriman = () => {
    setLoading(true);

    try {
      // Gabungkan semua data untuk dikirim ke halaman payment
      const dataUntukPayment = {
        ...data,
        ...form,
      };

      // Buat query string dari data tersebut
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(dataUntukPayment)) {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      }

      // Redirect ke halaman payment dengan query lengkap
      router.push(`/order/${orderId}/payment?${queryParams.toString()}`);
    } catch (error) {
      console.error("Error saat mengarahkan ke halaman pembayaran:", error);
      alert("Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <OrderSteps orderId={orderId} />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-2xl border border-gray-400 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Konfirmasi Pesanan
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Harap periksa kembali detail pesanan Anda sebelum melanjutkan.
          </p>

          {/* Rincian Produk */}
          <div className="border rounded-lg p-4 flex items-center gap-6 mb-6">
            <div className="flex-grow">
              <h3 className="font-bold text-lg">{data.namaProduk}</h3>
              <p className="text-sm text-gray-600">
                Jumlah: {data.kuantitas} Unit
              </p>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {totalHargaFormatted}
            </p>
          </div>

          {/* Detail Pengiriman */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Detail Pengiriman
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <p className="text-gray-500">Nama Penerima</p>
                <p className="font-medium">{data.namaPenerima}</p>
              </div>
              <div>
                <p className="text-gray-500">Nomor Telepon</p>
                <p className="font-medium">{data.telepon}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-gray-500">Alamat Pengiriman</p>
                <p className="font-medium">{data.alamat}</p>
              </div>
              {data.perusahaan && data.perusahaan !== "-" && (
                <div>
                  <p className="text-gray-500">Perusahaan</p>
                  <p className="font-medium">{data.perusahaan}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              className="w-full md:w-auto bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-cyan-700 transition"
              onClick={() => {
                handleSubmitPengiriman();
              }}
            >
              Lanjutkan ke Pembayaran
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
