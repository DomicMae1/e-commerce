// src/app/api/payment/notification/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";

// Buat interface untuk tipe data notifikasi
interface MidtransNotification {
  order_id: string;
  transaction_status:
    | "capture"
    | "settlement"
    | "pending"
    | "deny"
    | "cancel"
    | "expire";
  fraud_status: "accept" | "deny" | "challenge";
  status_code: string;
  gross_amount: string;
  signature_key: string;
}

// PERBAIKAN 1: Validasi Server Key di awal dan simpan dalam konstanta
const serverKey = process.env.MIDTRANS_SERVER_KEY;
if (!serverKey) {
  throw new Error(
    "MIDTRANS_SERVER_KEY tidak ditemukan di environment variables"
  );
}

// PERBAIKAN 2: Hapus inisialisasi 'core' yang tidak terpakai
// const core = new midtransClient.CoreApi({ ... });

export async function POST(req: Request) {
  try {
    const notificationJson: MidtransNotification = await req.json();

    const isSignatureValid = verifySignature(notificationJson);
    if (!isSignatureValid) {
      return NextResponse.json(
        { message: "Signature tidak valid!" },
        { status: 403 }
      );
    }

    const {
      order_id: orderId,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
    } = notificationJson;

    console.log(`Transaksi ${orderId}: ${transactionStatus}`);

    // Logika untuk update database Anda...
    if (
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus === "accept")
    ) {
      console.log(`Pembayaran untuk order ${orderId} berhasil/selesai.`);
      // TODO: Update status di database Anda menjadi 'SUCCESS'
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      console.log(`Pembayaran untuk order ${orderId} gagal/dibatalkan.`);
      // TODO: Update status di database Anda menjadi 'FAILED'
    } else if (transactionStatus === "pending") {
      console.log(`Menunggu pembayaran untuk order ${orderId}.`);
      // TODO: Update status di database Anda menjadi 'PENDING'
    }

    return NextResponse.json({ message: "Notifikasi berhasil diterima." });
  } catch (error) {
    console.error("Webhook Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { message: "Internal Server Error", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Fungsi helper untuk verifikasi signature.
 * Sekarang lebih sederhana karena 'serverKey' sudah divalidasi di atas.
 */
function verifySignature(notification: MidtransNotification): boolean {
  const { order_id, status_code, gross_amount, signature_key } = notification;

  const hash = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  return signature_key === hash;
}
