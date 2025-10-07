/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/cart/add/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { userId, productId, quantity } = await req.json();

    const client = await clientPromise;
    const db = client.db("e-commerce");

    const cart = await db.collection("carts").findOne({
      userId: new ObjectId(userId),
    });

    if (cart) {
      const existing = cart.items.find(
        (item: any) => item.productId.toString() === productId
      );

      if (existing) {
        await db.collection("carts").updateOne(
          {
            userId: new ObjectId(userId),
            "items.productId": new ObjectId(productId),
          },
          { $inc: { "items.$.quantity": quantity } }
        );
      } else {
        await db.collection("carts").updateOne(
          { userId: new ObjectId(userId) },
          {
            $push: {
              items: { productId: new ObjectId(productId), quantity },
            },
          }
        );
      }
    } else {
      await db.collection("carts").insertOne({
        userId: new ObjectId(userId),
        items: [{ productId: new ObjectId(productId), quantity }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add Cart Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah produk ke cart" },
      { status: 500 }
    );
  }
}
