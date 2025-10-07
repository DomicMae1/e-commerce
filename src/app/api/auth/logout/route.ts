import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Buat response JSON
    const response = NextResponse.json({
      success: true,
      message: "Logout berhasil.",
    });

    // Hapus cookie token secara aman
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // harus sama dengan path saat login
      expires: new Date(0), // langsung kadaluarsa
    });

    // (Opsional) jika kamu juga menyimpan _id di cookie biasa, hapus juga:
    response.cookies.set("_id", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal logout, terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
