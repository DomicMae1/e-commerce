// src/app/api/carts/add/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

type CartItem = {
  productId: ObjectId;
  quantity: number;
};

type Cart = {
  userId: ObjectId;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
};

export async function POST(req: Request) {
  try {
    const { userId, productId, quantity } = await req.json();

    if (!userId || !productId || !quantity) {
      return NextResponse.json(
        { success: false, error: "userId, productId, dan quantity wajib diisi" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    const cartsCollection = db.collection<Cart>("carts");

    const cart = await cartsCollection.findOne({
      userId: new ObjectId(userId),
    });

    const newItem: CartItem = {
      productId: new ObjectId(productId),
      quantity,
    };

    if (cart) {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        // update quantity
        await cartsCollection.updateOne(
          { userId: new ObjectId(userId), "items.productId": new ObjectId(productId) },
          { $inc: { "items.$.quantity": quantity } }
        );
      } else {
        // push item baru
        await cartsCollection.updateOne(
          { userId: new ObjectId(userId) },
          { $push: { items: newItem } }
        );
      }
    } else {
      // buat cart baru
      await cartsCollection.insertOne({
        userId: new ObjectId(userId),
        items: [newItem],
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
