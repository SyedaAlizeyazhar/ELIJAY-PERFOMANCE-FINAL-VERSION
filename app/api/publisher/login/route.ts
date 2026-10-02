import { NextRequest, NextResponse } from "next/server";
import { checkPublisherLogin } from "@/lib/publishers";
import {
  PUBLISHER_COOKIE,
  PUBLISHER_SESSION_DAYS,
  signPublisherToken,
} from "@/lib/publisher-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const account = await checkPublisherLogin(String(username ?? ""), String(password ?? ""));
    if (!account) {
      return NextResponse.json(
        { error: "Incorrect username or password, or your account isn't approved yet." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(PUBLISHER_COOKIE, await signPublisherToken(account.username), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * PUBLISHER_SESSION_DAYS,
    });
    return res;
  } catch (err) {
    console.error("Publisher login failed:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
