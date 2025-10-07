// src/app/api/cart/remove/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { userId, productId } = await req.json();

    const client = await clientPromise;
    const db = client.db("e-commerce");

    await db
      .collection("carts")
      .updateOne(
        { userId: new ObjectId(userId) },
        { $pull: { items: { productId: new ObjectId(productId) } } }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove Cart Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal hapus item dari cart" },
      { status: 500 }
    );
  }
}
