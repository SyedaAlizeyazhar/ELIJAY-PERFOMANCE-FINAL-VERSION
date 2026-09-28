import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteVertical } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const verticals = await deleteVertical(params.id);
  revalidatePath("/offers");
  revalidatePath("/");
  return NextResponse.json({ verticals });
}
