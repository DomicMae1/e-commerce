// src/app/api/likes/toggle/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

type Like = {
  userId: ObjectId;
  productIds: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
};

export async function POST(req: Request) {
  try {
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: "userId dan productId dibutuhkan." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");
    const likesCollection = db.collection<Like>("likes");

    const userLikes = await likesCollection.findOne({
      userId: new ObjectId(userId),
    });

    if (userLikes) {
      const isAlreadyLiked = userLikes.productIds.some(
        (id) => id.toString() === productId
      );

      if (isAlreadyLiked) {
        // Hapus productId dari array secara type-safe
        await likesCollection.updateOne(
          { _id: userLikes._id },
          { $pull: { productIds: new ObjectId(productId) } }
        );
        return NextResponse.json({
          success: true,
          message: "Suka pada produk berhasil dihapus.",
        });
      } else {
        // Tambahkan productId ke array
        await likesCollection.updateOne(
          { _id: userLikes._id },
          { $addToSet: { productIds: new ObjectId(productId) } }
        );
        return NextResponse.json({
          success: true,
          message: "Produk berhasil disukai.",
        });
      }
    } else {
      // Buat dokumen baru jika user belum pernah like
      await likesCollection.insertOne({
        userId: new ObjectId(userId),
        productIds: [new ObjectId(productId)],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return NextResponse.json({
        success: true,
        message: "Produk berhasil disukai.",
      });
    }
  } catch (error) {
    console.error("Like Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses permintaan suka" },
      { status: 500 }
    );
  }
}
