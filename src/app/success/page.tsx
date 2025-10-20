"use client";

import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border-2"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <CheckCircle className="text-green-500 w-20 h-20" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Pembayaran Berhasil 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          Terima kasih! Pembayaran kamu sudah kami terima dan sedang kami
          proses.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/order/history")}
            className="w-full bg-green-500 text-white py-2.5 rounded-xl hover:bg-green-600 transition"
          >
            Lihat Riwayat Pesanan
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </motion.div>

      <p className="text-gray-400 text-sm mt-8">
        © {new Date().getFullYear()} TokoNext — Semua hak dilindungi.
      </p>
    </div>
  );
}
