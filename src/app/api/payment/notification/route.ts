// src/app/api/payment/notification/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

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

export async function POST(req: Request) {
  try {
    const serverKey = process.env.NEXT_PUBLIC_SECRET;
    if (!serverKey) {
      return NextResponse.json(
        { message: "MIDTRANS_SERVER_KEY tidak ditemukan" },
        { status: 500 }
      );
    }

    const notificationJson: MidtransNotification = await req.json();

    const isSignatureValid = verifySignature(notificationJson, serverKey);
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

    if (
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus === "accept")
    ) {
      console.log(`Pembayaran untuk order ${orderId} berhasil/selesai.`);
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      console.log(`Pembayaran untuk order ${orderId} gagal/dibatalkan.`);
    } else if (transactionStatus === "pending") {
      console.log(`Menunggu pembayaran untuk order ${orderId}.`);
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

function verifySignature(
  notification: MidtransNotification,
  serverKey: string
): boolean {
  const { order_id, status_code, gross_amount, signature_key } = notification;

  const hash = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  return signature_key === hash;
}
