import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;

  // Jika token tidak ada, redirect ke halaman login
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Lanjutkan ke halaman yang diminta jika token ada
  return NextResponse.next();
}

// Tentukan halaman mana yang akan dilindungi oleh middleware
export const config = {
  matcher: ["/dashboard/:path*"], // Proteksi semua rute di bawah /dashboard
};