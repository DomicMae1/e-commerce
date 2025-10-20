/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import OrderSteps from "@/components/OrderSteps";

const paymentCategories = [
  {
    title: "Virtual Account",
    options: [
      { code: "bca", name: "BCA", logo: "/bca.png" },
      { code: "bni", name: "BNI", logo: "/bni.png" },
      { code: "bri", name: "BRI", logo: "/bri.png" },
      { code: "mandiri", name: "Mandiri", logo: "/mandiri.png" },
      { code: "bsi", name: "BSI", logo: "/bsi.png" },
      { code: "cimb", name: "CIMB Niaga", logo: "/cimb_niaga.png" },
    ],
  },
  {
    title: "E-Wallet & QRIS",
    options: [
      { code: "gopay", name: "GoPay", logo: "/gopay.png" },
      { code: "qris", name: "QRIS", logo: "/qris.png" },
      { code: "spay", name: "ShopeePay", logo: "/spay.png" },
      { code: "dana", name: "Dana", logo: "/dana.png" },
      { code: "ovo", name: "OVO", logo: "/ovo.png" },
    ],
  },
  {
    title: "Kartu Kredit/Debit",
    options: [
      { code: "visa", name: "Visa", logo: "/visa.png" },
      { code: "mastercard", name: "MasterCard", logo: "/mastercard.png" },
    ],
  },
  {
    title: "Gerai Ritel",
    options: [
      { code: "indomaret", name: "Indomaret", logo: "/indomaret.png" },
      { code: "alfamart", name: "Alfamart", logo: "/alfamart.png" },
    ],
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  const [selectedBank, setSelectedBank] = useState("");
  const [loading, setLoading] = useState(false);

  const data = {
    namaProduk: searchParams.get("namaProduk"),
    totalHarga: searchParams.get("totalHarga"),
    namaPenerima: searchParams.get("namaPenerima"),
    telepon: searchParams.get("telepon"),
    email: searchParams.get("email"),
  };

  const totalHargaFormatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(data.totalHarga) || 0);

  const handlePayment = async () => {
    if (!selectedBank) {
      alert("Silakan pilih bank terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: `ORDER-${Date.now()}`,
        productName: data.namaProduk,
        price: Number(data.totalHarga),
        quantity: 1,
        customer: {
          first_name: data.namaPenerima,
          email: data.email,
          phone: data.telepon,
        },
        bank: selectedBank,
      };

      const response = await fetch("/api/payment/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const transactionData = await response.json();
      if (!response.ok)
        throw new Error(transactionData.error || "Gagal membuat transaksi");

      // 👇 user tetap pilih bank di popup Midtrans
      window.snap.pay(transactionData.token, {
      onSuccess: async (result: any) => {
        console.log("✅ Pembayaran berhasil:", result);
        alert(`Pembayaran berhasil di bank ${result.va_numbers?.[0]?.bank}`);

        try {
          // 🔹 Update status order menjadi "done" di MongoDB
          const updateRes = await fetch(`/api/orders/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "done",
              updated_at: new Date().toISOString(),
            }),
          });

          if (!updateRes.ok) {
            const errData = await updateRes.json();
            console.error("Gagal update status:", errData);
            alert("Gagal memperbarui status pesanan di database.");
          }
        } catch (err) {
          console.error("Error saat update status:", err);
        }

        // 🔹 Redirect ke halaman success
        window.location.href = "/success";
      },

      onPending: (result: any) => {
        console.log("⏳ Pending:", result);
        alert(`Menunggu pembayaran di bank ${result.va_numbers?.[0]?.bank}`);
      },

      onError: (result: any) => {
        console.error("❌ Pembayaran gagal:", result);
        alert("Pembayaran gagal.");
      },
    });
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat pembayaran"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <OrderSteps orderId={orderId} />
      <div className="flex justify-center p-4">
        <div className="w-full max-w-4xl border border-gray-300 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-left text-gray-800 mb-4">
            Pilih Metode Pembayaran
          </h1>

          {/* Rincian Produk */}
          <div className="border rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="font-semibold text-lg text-gray-700 mb-2">
              {data.namaProduk}
            </h3>
            <p className="text-gray-600 mb-1">Pemesan: {data.namaPenerima}</p>
            <p className="text-gray-600 mb-1">Telepon: {data.telepon}</p>
            <p className="text-gray-800 font-bold text-xl mt-2">
              Total: {totalHargaFormatted}
            </p>
          </div>

          {/* Pilihan Bank */}
          <div className="space-y-3 mb-6">
            <h2 className="text-gray-700 font-semibold mb-2">Pilih Bank:</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-16">
              {paymentCategories.map((category) => (
                <div key={category.title}>
                  <h2 className="text-gray-700 font-semibold mb-6">
                    {category.title}
                  </h2>
                  <div className="grid grid-rows-2 sm:grid-rows-2 gap-4">
                    {category.options.map((option) => (
                      <button
                        key={option.code}
                        onClick={() => setSelectedBank(option.code)}
                        className={`flex flex-col sm:flex-row items-center justify-start text-left sm:items-center sm:justify-center gap-2 border rounded-lg py-3 px-3 transition ${
                          selectedBank === option.code
                            ? "border-cyan-600 bg-cyan-50 ring-2 ring-cyan-500"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <Image
                          src={option.logo}
                          alt={option.name}
                          width={50}
                          height={25}
                          className="h-6 w-auto object-contain"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700 mt-1 sm:mt-0">
                          {option.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tombol Bayar */}
          <div className="flex justify-center pt-8">
            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full md:w-auto bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-cyan-700"
              }`}
            >
              {loading ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
