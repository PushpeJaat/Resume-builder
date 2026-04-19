import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!isAdminEmail(session.user.email)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session };
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await ensureAdmin();
  if (gate.error) {
    return gate.error;
  }

  const { id } = await context.params;

  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
