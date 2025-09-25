// src/app/api/payment/create-transaction/route.ts
import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function POST(req: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;

    if (!serverKey || !clientKey) {
      return NextResponse.json(
        { message: "MIDTRANS_SERVER_KEY atau CLIENT_KEY belum diatur!" },
        { status: 500 }
      );
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey,
      clientKey,
    });

    const body = await req.json();

    const parameter = {
      transaction_details: {
        order_id: body.order_id || `ORDER-${Date.now()}`,
        gross_amount: body.gross_amount,
      },
      item_details: body.item_details,
      customer_details: body.customer_details,
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    console.error("Create Transaction Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
