// src/app/api/payment/create-transaction/route.ts

import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

if (!serverKey) {
  throw new Error("MIDTRANS_SERVER_KEY tidak ditemukan di environment variables");
}
if (!clientKey) {
  throw new Error("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY tidak ditemukan di environment variables");
}

// PERBAIKAN 1: Gunakan 'const' karena 'snap' tidak pernah diubah nilainya.
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: serverKey, // <-- Gunakan variabel yang sudah divalidasi
  clientKey: clientKey, // <-- Gunakan variabel yang sudah divalidasi
});

export async function POST(req: Request) {
  try {
    const { order_id, gross_amount, customer_details } = await req.json();

    if (!order_id || !gross_amount || !customer_details) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: gross_amount,
      },
      customer_details: {
        first_name: customer_details.first_name,
        last_name: customer_details.last_name,
        email: customer_details.email,
        phone: customer_details.phone,
      },
      credit_card: {
        secure: true,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      message: "Transaksi berhasil dibuat",
      token: transaction.token,
    });
  } catch (error) {
    // PERBAIKAN 2: Hindari penggunaan 'any' secara eksplisit.
    console.error("Error creating transaction:", error);

    // PERBAIKAN 3: Tangani error secara type-safe.
    let errorMessage = "Terjadi kesalahan pada server";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server", error: errorMessage },
      { status: 500 }
    );
  }
}
