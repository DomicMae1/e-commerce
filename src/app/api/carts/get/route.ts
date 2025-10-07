/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/carts/get/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("_id")?.value;

    if (!userId) {
      return NextResponse.json({ items: [] });
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    // Cari cart berdasarkan user
    const cart = await db.collection("carts").findOne({
      userId: new ObjectId(userId),
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Ambil semua productId dari cart
    const productIds = cart.items.map((i: any) => new ObjectId(i.productId));

    // Ambil detail produk dari collection products
    const products = await db
      .collection("items")
      .find({ _id: { $in: productIds } })
      .toArray();

    // Gabungkan data cart.items + products
    const itemsWithDetails = cart.items.map((i: any) => {
      const product = products.find(
        (p) => p._id.toString() === i.productId.toString()
      );

      return {
        productId: i.productId.toString(), // dari carts
        quantity: i.quantity, // dari carts
        productName: product?.name ?? "Unknown", // dari products
        price:
          typeof product?.price === "number"
            ? product.price
            : Number(product?.price) || 0,
        image: product?.image
          ? product.image.startsWith("data:image")
            ? product.image // sudah ada prefix, jangan ditambah lagi
            : `data:image/jpeg;base64,${product.image}`
          : "/no-image.png",

        description: product?.description ?? "",
      };
    });

    return NextResponse.json({ items: itemsWithDetails });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil cart" },
      { status: 500 }
    );
  }
}
