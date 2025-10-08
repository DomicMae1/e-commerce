// src/app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID produk tidak valid" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");
    const product = await db
      .collection("items")
      .findOne({ _id: new ObjectId(id) });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID produk tidak valid" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    const result = await db
      .collection("items")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan untuk dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Produk berhasil dihapus" },
      { status: 200 }
    );
  } catch (e) {
    console.error("Gagal menghapus produk:", e);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID produk tidak valid" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, price, image } = body;

    // Validasi sederhana
    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: "Nama dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    const result = await db.collection("items").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          price: Number(price),
          image: image || "",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan untuk diupdate" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diperbarui",
    });
  } catch (e) {
    console.error("Gagal mengupdate produk:", e);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate produk" },
      { status: 500 }
    );
  }
}
