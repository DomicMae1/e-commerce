// src/app/api/carts/route.ts
import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { jwtVerify } from "jose"; // Untuk memverifikasi token JWT dari cookie

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

interface CartItem {
  productId: ObjectId;
  quantity: number;
}

// Definisikan tipe struktur dokumen keranjang di MongoDB
interface Cart {
  _id: ObjectId;
  userId: ObjectId;
  items: CartItem[];
}

export async function GET(request: NextRequest) {
  try {
    // 1. Ambil token dari cookie
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Verifikasi token dan dapatkan payload (termasuk user ID)
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub; // Asumsi 'sub' (subject) di JWT adalah user ID

    if (!userId || typeof userId !== "string" || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID in token" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");

    // 3. Cari keranjang berdasarkan userId
    const cart = await db
      .collection<Cart>("carts")
      .findOne({ userId: new ObjectId(userId) });

    if (!cart) {
      // Jika tidak ada keranjang, kembalikan total 0
      return NextResponse.json({ success: true, data: { totalQuantity: 0 } });
    }

    // 4. Hitung total kuantitas dari semua item di keranjang
    const totalQuantity = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    return NextResponse.json({ success: true, data: { totalQuantity } });
  } catch (e) {
    console.error("Gagal mengambil data keranjang:", e);
    if (e instanceof Error && e.name === "JWTExpired") {
      return NextResponse.json(
        { success: false, error: "Token expired" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data keranjang" },
      { status: 500 }
    );
  }
}
