import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");
    const usersCollection = db.collection("users");

    // 🔍 Cek apakah user ada
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email tidak ditemukan." },
        { status: 404 }
      );
    }

    // 🔑 Cek password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Password salah." },
        { status: 401 }
      );
    }

    // 🧩 Buat payload JWT
    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "user", // default ke 'user'
    };

    // 🔐 Generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    // ✅ Response tanpa password
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: payload,
    });

    // 🍪 Simpan token di cookie (httpOnly → tidak bisa diakses dari JS)
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    response.cookies.set("_id", user._id.toString(), {
      httpOnly: false, // ⚠️ bisa diakses dari client-side JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // (Opsional) Simpan role dan nama agar bisa diakses client-side tanpa decode JWT
    response.cookies.set("role", payload.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    response.cookies.set("name", payload.name || "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
