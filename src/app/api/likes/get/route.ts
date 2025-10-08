// src/app/api/likes/get/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get("_id")?.value;

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ items: [] });
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    // Agregasi: gabungkan likes + items
    const likedItems = await db
      .collection("likes")
      .aggregate([
        { $match: { userId: new ObjectId(userId) } }, // filter berdasarkan user
        { $unwind: "$productIds" }, // expand array productIds
        {
          $lookup: {
            from: "items",
            localField: "productIds",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" }, // flatten hasil lookup
        { $replaceRoot: { newRoot: "$productDetails" } }, // replace root
      ])
      .toArray();

    return NextResponse.json({ success: true, items: likedItems });
  } catch (error) {
    console.error("Get Likes Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil daftar suka" },
      { status: 500 }
    );
  }
}
