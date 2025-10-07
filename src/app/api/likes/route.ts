import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("_id")?.value;

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ items: [] });
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    // Agregasi: hanya ambil _id dan name
    const likedItems = await db
      .collection("likes")
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
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
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
    const userId = cookieStore.get("_id")?.value;

    if (!userId || !ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, error: "User atau Product tidak valid" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    const likesColl = db.collection("likes");
    const userLikes = await likesColl.findOne({ userId: new ObjectId(userId) });

    if (userLikes) {
      const alreadyLiked = userLikes.productIds.some(
        (id: ObjectId) => id.toString() === productId
      );

      if (alreadyLiked) {
        // 🔴 Hapus productId dari daftar
        await likesColl.findOneAndUpdate(
          { userId: new ObjectId(userId) },
          { $pull: { productIds: new ObjectId(productId) } },
          { returnDocument: "after" }
        );
        return NextResponse.json({ success: true, liked: false });
      } else {
        // 🟢 Tambahkan productId ke daftar
        await likesColl.findOneAndUpdate(
          { userId: new ObjectId(userId) },
          { $addToSet: { productIds: new ObjectId(productId) } },
          { returnDocument: "after", upsert: true }
        );
        return NextResponse.json({ success: true, liked: true });
      }
    } else {
      // 🆕 Buat dokumen baru untuk user
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
