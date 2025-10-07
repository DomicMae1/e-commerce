// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  try {
    // 🔐 Ambil token dari cookie
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    // 🔑 Verifikasi token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // 🧩 Validasi payload wajib memiliki field user yang dibutuhkan
    if (!payload || !payload.email || !payload.role) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 }
      );
    }

    // ✅ Kembalikan data user
    return NextResponse.json(
      {
        user: {
          name: payload.name,
          email: payload.email,
          role: payload.role,
          id: payload.id, // opsional jika kamu menyimpan _id di JWT
        },
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("JWT verify error:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
