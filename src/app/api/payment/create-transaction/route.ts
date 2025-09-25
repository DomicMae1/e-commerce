// src/app/api/payment/create-transaction/route.ts

import { snap } from "@/app/lib/midtrans";
import { NextResponse } from "next/server";
// Gunakan instance snap terpusat dari lib/midtrans.ts

export async function POST(req: Request) {
  try {
    // PERBAIKAN 1: Mengambil data sesuai contoh lama { id, productName, price, quantity }
    const { id, productName, price, quantity } = await req.json();

    // Validasi untuk data yang baru
    if (!id || !productName || !price || !quantity) {
      return NextResponse.json(
        {
          message:
            "Data produk tidak lengkap: id, productName, price, quantity dibutuhkan.",
        },
        { status: 400 }
      );
    }

    // PERBAIKAN 2: Membuat parameter Midtrans sesuai logika contoh lama
    const parameter = {
      transaction_details: {
        order_id: id,
        gross_amount: price * quantity,
      },
      item_details: [
        {
          id: id,
          price: price,
          quantity: quantity,
          name: productName,
        },
      ],
      // Menambahkan customer_details tetap merupakan praktik yang baik
      customer_details: {
        first_name: "Pelanggan",
        last_name: "TokoNext",
      },
    };

    // Library modern menggunakan `createTransaction` yang mengembalikan objek { token: '...' }
    const transaction = await snap.createTransaction(parameter);
    const token = transaction.token;

    console.log("Midtrans Token:", token);

    // PERBAIKAN 3: Mengirim respons JSON yang simpel, hanya berisi token
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error creating transaction:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan tidak dikenal";
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server", error: errorMessage },
      { status: 500 }
    );
  }
}
