import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "lms_session";

function getSecretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

// Peta prefix path -> role yang diizinkan mengaksesnya.
const ROLE_PROTECTED_PREFIXES: { prefix: string; role: string }[] = [
  { prefix: "/guru", role: "GURU" },
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/siswa", role: "SISWA" },
  { prefix: "/kepsek", role: "KEPSEK" },
  { prefix: "/kurikulum", role: "KURIKULUM" },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const matched = ROLE_PROTECTED_PREFIXES.find((r) =>
    pathname.startsWith(r.prefix)
  );
  if (!matched) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== matched.role) {
      // Login, tapi role-nya bukan pemilik area ini -> lempar balik ke halaman login.
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/guru/:path*", "/admin/:path*", "/siswa/:path*", "/kepsek/:path*", "/kurikulum/:path*"],
};
