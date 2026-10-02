import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { addVertical, getVerticals } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const verticals = await getVerticals();
  return NextResponse.json({ verticals });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Vertical name required." }, { status: 400 });
  }
  const verticals = await addVertical(name.trim());
  revalidatePath("/offers");
  revalidatePath("/");
  return NextResponse.json({ verticals });
}
