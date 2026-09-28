import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyToken } from "@/lib/admin-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin-elite-elijah-2024/dashboard")) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!(await verifyToken(token))) {
      const loginUrl = new URL("/admin-elite-elijah-2024", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-elite-elijah-2024/dashboard/:path*"],
};
