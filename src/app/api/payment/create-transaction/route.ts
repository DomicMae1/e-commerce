/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/payment/create-transaction/route.ts
import { NextResponse } from "next/server";
import { snap } from "@/lib/midtrans";

export async function POST(req: Request) {
  try {
    // 1. Ambil 'bank' dari request body
    const {
      id,
      productName,
      price,
      quantity,
      customer,
      bank: payment_method,
    } = await req.json();

    // Validasi data (tetap sama)
    if (!id || !productName || !price || !quantity || !customer) {
      return NextResponse.json(
        { message: "Data permintaan tidak lengkap." },
        { status: 400 }
      );
    }
    if (!customer.first_name || !customer.email || !customer.phone) {
      return NextResponse.json(
        { message: "Data customer tidak lengkap." },
        { status: 400 }
      );
    }

    // 3. Siapkan parameter dasar untuk Midtrans
    const parameter: any = {
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
      customer_details: {
        first_name: customer.first_name,
        last_name: customer.last_name || "",
        email: customer.email,
        phone: customer.phone,
      },
    };

    let paymentType: string;

    switch (payment_method) {
      // Virtual Accounts
      case "bca":
      case "bni":
      case "bri":
      case "bsi":
      case "cimb":
      case "danamon":
        paymentType = `${payment_method}_va`;
        parameter.enabled_payments = [paymentType];
        break;

      // Mandiri Bill Payment
      case "mandiri":
        paymentType = "echannel";
        parameter.enabled_payments = [paymentType];
        parameter.echannel = {
          bill_info1: "Pembayaran untuk:",
          bill_info2: productName,
        };
        break;

      // E-Wallets & QRIS
      case "gopay":
      case "qris":
        paymentType = "gopay";
        parameter.enabled_payments = [paymentType];
        break;
      case "dana":
      case "ovo":
        paymentType = "gopay";
        parameter.enabled_payments = [paymentType];
        break;

      // ShopeePay (termasuk PayLater seringkali ditangani di halaman Shopee)
      case "spay":
      case "spaylater":
        paymentType = "shopeepay";
        parameter.enabled_payments = [paymentType];
        break;

      // Kartu Kredit/Debit
      case "visa":
      case "mastercard":
        paymentType = "credit_card";
        parameter.enabled_payments = [paymentType];
        parameter.credit_card = { secure: true };
        break;

      // Gerai Ritel
      case "indomaret":
      case "alfamart":
        paymentType = "cstore";
        parameter.enabled_payments = [paymentType];
        parameter.cstore = {
          store: payment_method,
          message: "Terima kasih atas pesanan Anda.",
        };
        break;

      // Google Pay
      case "gpay":
        paymentType = "credit_card";
        parameter.enabled_payments = [paymentType];
        parameter.credit_card = { secure: true };
        break;

      default:
        // Jika tidak ada yang cocok (atau jika Anda ingin opsi "Semua Metode")
        // Biarkan `enabled_payments` kosong agar Midtrans menampilkan semua.
        break;
    }

    // 5. Buat transaksi dengan parameter yang sudah benar
    const transaction = await snap.createTransaction(parameter);
    const token = transaction.token;

    return NextResponse.json({ token });
  } catch (error) {
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
