// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { canAccess } from "@/lib/roleAccess";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // 🟢 Izinkan semua orang mengakses /produk dan turunannya
  // kecuali jika path mengandung "/produk/admin"
  if (
    (pathname.startsWith("/produk") && !pathname.startsWith("/produk/admin")) ||
    pathname.startsWith("/api/products")
  ) {
    return NextResponse.next();
  }

  // ⛔ Tidak ada token → redirect ke login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const role = payload.role as string;
    if (!role) {
      console.error("JWT tidak memiliki field 'role'");
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 🔍 Cek apakah role boleh mengakses path ini
    const isAllowed = canAccess(role, pathname);
    if (!isAllowed) {
      console.warn(`Role '${role}' tidak diizinkan ke: ${pathname}`);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Token invalid:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

// 🔒 Jalankan middleware untuk semua path penting
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/produk/:path*",
    "/keranjang/:path*",
    "/wishlist/:path*",
    "/user/:path*",
    "/settings/:path*",
  ],
};
