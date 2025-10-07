// src/app/api/cart/update/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { userId, productId, quantity } = await req.json();

    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "Quantity harus lebih dari 0" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    await db.collection("carts").updateOne(
      {
        userId: new ObjectId(userId),
        "items.productId": new ObjectId(productId),
      },
      { $set: { "items.$.quantity": quantity } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Cart Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal update cart" },
      { status: 500 }
    );
  }
}
