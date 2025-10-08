/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/cart/remove/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: "userId dan productId wajib diisi" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");
    const cartsCollection = db.collection("carts");

    // Gunakan any agar TypeScript tidak error
    const result = await cartsCollection.updateOne(
      { userId: new ObjectId(userId) },
      { $pull: { items: { productId: new ObjectId(productId) } } } as any
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({
        success: false,
        error: "Item tidak ditemukan di cart",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove Cart Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal hapus item dari cart" },
      { status: 500 }
    );
  }
}
