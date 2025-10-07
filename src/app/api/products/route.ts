/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/products/route.ts

import clientPromise from "@/lib/mongodb";
import { NextResponse, NextRequest } from "next/server";

// Fungsi GET untuk mengambil data (tetap sama)
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("e-commerce");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const filter: any = {};

    if (search) {
      // ✅ hanya filter berdasarkan name (case-insensitive)
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await db
      .collection("items")
      .find(filter, { projection: { _id: 1, name: 1, price: 1, image: 1 } }) // pakai filter
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection("items").countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: products,
      page,
      limit,
      total,
      search,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

// --- FUNGSI BARU UNTUK MENAMBAH PRODUK ---
export async function POST(request: NextRequest) {
  try {
    const newProduct = await request.json();

    // Validasi sederhana
    if (!newProduct.name || !newProduct.price) {
      return NextResponse.json(
        { success: false, error: "Nama dan harga produk wajib diisi." },
        { status: 400 } // Bad Request
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    // Masukkan data produk baru ke collection 'items'
    const result = await db.collection("items").insertOne(newProduct);

    return NextResponse.json(
      { success: true, message: "Produk berhasil ditambahkan", data: result },
      { status: 201 } // 201 Created
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan produk" },
      { status: 500 }
    );
  }
}
