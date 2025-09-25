// src/app/api/payment/create-transaction/route.ts
import { NextResponse } from "next/server";
import { snap } from "@/app/lib/midtrans";

export async function POST(req: Request) {
  try {
    const { id, productName, price, quantity } = await req.json();

    if (!id || !productName || !price || !quantity) {
      return NextResponse.json(
        { message: "Data produk tidak lengkap." },
        { status: 400 }
      );
    }

    // PERBAIKAN: Tambahkan 'customer_details' di sini
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
      // Menambahkan customer_details adalah praktik yang baik dan seringkali wajib
      customer_details: {
        first_name: "Pelanggan",
        last_name: "TokoAnda",
        email: "pelanggan@example.com",
        phone: "081234567890",
      },
      credit_card: {
        secure: true,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    const token = transaction.token;

    return NextResponse.json({ token });
  } catch (error) {
    // Periksa terminal Anda untuk melihat log error ini
    console.error("Error di sisi server:", error);
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
