// src/lib/midtrans.ts

import midtransClient from "midtrans-client";

// 1. Ambil dan validasi environment variables terlebih dahulu
const serverKey = process.env.NEXT_PUBLIC_SECRET;
const clientKey = process.env.NEXT_PUBLIC_CLIENT;

if (!serverKey) {
  throw new Error("Variabel lingkungan MIDTRANS_SERVER_KEY belum diatur!");
}
if (!clientKey) {
  throw new Error(
    "Variabel lingkungan NEXT_PUBLIC_MIDTRANS_CLIENT_KEY belum diatur!"
  );
}

// 2. Buat instance client dengan variabel yang sudah divalidasi
const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: serverKey,
  clientKey: clientKey,
});

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: serverKey,
  clientKey: clientKey,
});

// 3. Ekspor instance yang sudah siap pakai
export { snap, coreApi };
