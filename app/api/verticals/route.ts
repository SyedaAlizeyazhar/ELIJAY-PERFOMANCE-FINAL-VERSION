import { NextResponse } from "next/server";
import { getVerticals } from "@/lib/kv";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const verticals = await getVerticals();
    return NextResponse.json({ verticals });
  } catch (err) {
    console.error("Failed to load verticals:", err);
    return NextResponse.json({ verticals: [] }, { status: 200 });
  }
}
