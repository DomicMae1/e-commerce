import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const body = await req.json();
    const db = client.db("e-commerce");

    const result = await db.collection("orders").insertOne(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Gagal menyimpan order:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan order" },
      { status: 500 }
    );
  }
}
