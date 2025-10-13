import clientPromise from "@/lib/mongodb";
import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";

// 📌 Konfigurasi
const DB_NAME = "e-commerce";
const COLLECTION = "promos";

/* =========================================================
   📍 GET — Ambil semua promo (atau promo tunggal jika pakai ?id=)
========================================================= */
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // ambil promo berdasarkan id
      const promo = await db
        .collection(COLLECTION)
        .findOne({ _id: new ObjectId(id) });
      if (!promo) {
        return NextResponse.json(
          { success: false, error: "Promo tidak ditemukan" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: promo });
    }

    // ambil semua promo
    const promos = await db
      .collection(COLLECTION)
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();
    return NextResponse.json({ success: true, data: promos });
  } catch (error) {
    console.error("❌ Gagal mengambil data promo:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data promo" },
      { status: 500 }
    );
  }
}

/* =========================================================
   📍 POST — Tambah promo baru
========================================================= */
export async function POST(req: NextRequest) {
  try {
    const { title, subtitle, image } = await req.json();

    if (!title || !subtitle || !image) {
      return NextResponse.json(
        {
          success: false,
          error: "Field title, subtitle, dan image wajib diisi",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const newPromo = {
      title,
      subtitle,
      image,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTION).insertOne(newPromo);

    return NextResponse.json({
      success: true,
      message: "Promo berhasil ditambahkan",
      data: { _id: result.insertedId, ...newPromo },
    });
  } catch (error) {
    console.error("❌ Gagal menambahkan promo:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan promo" },
      { status: 500 }
    );
  }
}

/* =========================================================
   📍 PUT — Update promo berdasarkan ID (?id=)
========================================================= */
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { title, subtitle, image } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Parameter id wajib diisi" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const updateData = {
      ...(title && { title }),
      ...(subtitle && { subtitle }),
      ...(image && { image }),
      updatedAt: new Date(),
    };

    const result = await db
      .collection(COLLECTION)
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Promo tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Promo berhasil diperbarui",
    });
  } catch (error) {
    console.error("❌ Gagal update promo:", error);
    return NextResponse.json(
      { success: false, error: "Gagal update promo" },
      { status: 500 }
    );
  }
}

/* =========================================================
   📍 DELETE — Hapus promo berdasarkan ID (?id=)
========================================================= */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Parameter id wajib diisi" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Promo tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Promo berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ Gagal menghapus promo:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus promo" },
      { status: 500 }
    );
  }
}
