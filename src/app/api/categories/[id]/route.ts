/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/categories/[id]/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// ✅ GET /api/categories/[id] — ambil kategori berdasarkan ID
export async function GET(
  _req: Request,
  contextPromise: Promise<{ params: { id: string } }>
) {
  const { params } = await contextPromise;
  const { id } = params;

  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    const category = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(id) });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Gagal mengambil kategori:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
}

// ✅ PUT /api/categories/[id] — update kategori (termasuk gambar base64)
export async function PUT(
  req: Request,
  contextPromise: Promise<{ params: { id: string } }>
) {
  const { params } = await contextPromise;
  const { id } = params;

  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    // Ambil body JSON yang dikirim
    const { name, description, image } = await req.json();

    const client = await clientPromise;
    const db = client.db("e-commerce");

    // Ambil data kategori lama
    const existingCategory = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(id) });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan untuk diupdate" },
        { status: 404 }
      );
    }

    // Jika ada gambar baru dalam bentuk base64
    // dan berbeda dari gambar lama (atau belum ada sebelumnya)
    const updatedFields: any = {
      updatedAt: new Date(),
    };

    if (name) updatedFields.name = name;
    if (description) updatedFields.description = description;

    // ✅ Jika `image` dikirim dan bukan null, update
    if (image && image.startsWith("data:image/")) {
      updatedFields.image = image; // simpan base64 langsung ke database
    }

    const result = await db.collection("categories").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updatedFields,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan untuk diupdate" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diperbarui",
    });
  } catch (error) {
    console.error("Gagal memperbarui kategori:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui kategori" },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/categories/[id] — hapus kategori
export async function DELETE(
  _req: Request,
  contextPromise: Promise<{ params: { id: string } }>
) {
  const { params } = await contextPromise;
  const { id } = params;

  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    const result = await db
      .collection("categories")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan untuk dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("Gagal menghapus kategori:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
