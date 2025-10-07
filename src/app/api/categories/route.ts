/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/categories/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// ✅ GET /api/categories — ambil semua kategori
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("e-commerce");

    const categories = await db.collection("categories").find().toArray();

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Gagal mengambil kategori:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
}

// ✅ POST /api/categories — tambah kategori baru (dengan gambar base64 opsional)
export async function POST(req: Request) {
  try {
    const { name, description, image } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    // 🧩 Siapkan data baru
    const newCategory: any = {
      name,
      description: description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 🖼️ Jika ada gambar base64 dikirim dari frontend, simpan
    if (image && image.startsWith("data:image/")) {
      newCategory.image = image;
    }

    // Simpan ke MongoDB
    const result = await db.collection("categories").insertOne(newCategory);

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: { _id: result.insertedId, ...newCategory },
    });
  } catch (error) {
    console.error("Gagal menambahkan kategori:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan kategori" },
      { status: 500 }
    );
  }
}
