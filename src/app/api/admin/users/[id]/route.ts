import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  plan: z.enum(["FREE", "PREMIUM"]),
});

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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await ensureAdmin();
  if (gate.error) {
    return gate.error;
  }

  const json = (await request.json().catch(() => null)) as unknown;
  const parsed = updateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await context.params;

  const updated = await prisma.user.update({
    where: { id },
    data: { plan: parsed.data.plan },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
    },
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await ensureAdmin();
  if (gate.error || !gate.session) {
    return gate.error;
  }

  const { id } = await context.params;

  if (id === gate.session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
