import { NextResponse } from "next/server";
import { PUBLISHER_COOKIE } from "@/lib/publisher-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PUBLISHER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
