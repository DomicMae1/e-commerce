// src/app/api/likes/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

type Like = {
  userId: ObjectId;
  productIds: ObjectId[];
};

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get("_id")?.value;

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ items: [] });
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");
    const likesColl = db.collection<Like>("likes");

    const likedItems = await likesColl
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        { $unwind: "$productIds" },
        {
          $lookup: {
            from: "items",
            localField: "productIds",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        { $replaceRoot: { newRoot: "$productDetails" } },
        { $project: { _id: 1, name: 1 } },
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

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();
    const cookieStore = cookies();
    const userId = (await cookieStore).get("_id")?.value;

    if (!userId || !ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, error: "User atau Product tidak valid" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");
    const likesColl = db.collection<Like>("likes");

    const userLikes = await likesColl.findOne({ userId: new ObjectId(userId) });

    if (userLikes) {
      const alreadyLiked = userLikes.productIds.some(
        (id) => id.toString() === productId
      );

      if (alreadyLiked) {
        // Hapus productId dari array
        await likesColl.updateOne(
          { userId: new ObjectId(userId) },
          { $pull: { productIds: new ObjectId(productId) } }
        );
        return NextResponse.json({ success: true, liked: false });
      } else {
        // Tambahkan productId ke array
        await likesColl.updateOne(
          { userId: new ObjectId(userId) },
          { $addToSet: { productIds: new ObjectId(productId) } }
        );
        return NextResponse.json({ success: true, liked: true });
      }
    } else {
      // Buat dokumen baru jika belum ada
      await likesColl.insertOne({
        userId: new ObjectId(userId),
        productIds: [new ObjectId(productId)],
      });
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error("Toggle Like Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal toggle like" },
      { status: 500 }
    );
  }
}
