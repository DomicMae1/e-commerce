// src/app/api/likes/toggle/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

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
    const likesCollection = db.collection("likes");

    // Cari dokumen "likes" milik pengguna, sama seperti Anda mencari "carts"
    const userLikes = await likesCollection.findOne({
      userId: new ObjectId(userId),
    });

    // --- ALUR JIKA PENGGUNA SUDAH PERNAH "LIKE" SEBELUMNYA ---
    if (userLikes) {
      // Cari apakah produk ini sudah ada di dalam array productIds
      // Kita gunakan .find() agar mirip dengan logika cart Anda
      const isAlreadyLiked = userLikes.productIds.find(
        (id: ObjectId) => id.toString() === productId
      );

      if (isAlreadyLiked) {
        // Jika SUDAH ADA, maka kita hapus (UNLIKE)
        await likesCollection.updateOne(
          { _id: userLikes._id }, // Lebih efisien update berdasarkan _id dokumen
          { $pull: { productIds: new ObjectId(productId) } }
        );
        return NextResponse.json({
          success: true,
          message: "Suka pada produk berhasil dihapus.",
        });
      } else {
        // Jika BELUM ADA, maka kita tambahkan (LIKE)
        // Kita gunakan $push agar mirip dengan logika cart Anda
        await likesCollection.updateOne(
          { _id: userLikes._id },
          { $push: { productIds: new ObjectId(productId) } }
        );
        return NextResponse.json({
          success: true,
          message: "Produk berhasil disukai.",
        });
      }
    } else {
      // --- ALUR JIKA INI ADALAH "LIKE" PERTAMA KALI OLEH PENGGUNA ---
      // Buat dokumen baru dengan produk pertama yang disukai
      await likesCollection.insertOne({
        userId: new ObjectId(userId),
        productIds: [new ObjectId(productId)], // Array dimulai dengan 1 item
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
