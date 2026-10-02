import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteOffer, updateOffer } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const patch = await req.json();
  const offers = await updateOffer(params.id, patch);
  revalidatePath("/offers");
  revalidatePath("/");
  return NextResponse.json({ offers });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const offers = await deleteOffer(params.id);
  revalidatePath("/offers");
  revalidatePath("/");
  return NextResponse.json({ offers });
}
