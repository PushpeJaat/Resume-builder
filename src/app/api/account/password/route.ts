import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { currentPassword, newPassword } = parsed.data;

    if (user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }

      const validCurrent = await compare(currentPassword, user.passwordHash);
      if (!validCurrent) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    }

    const passwordHash = await hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true, hadPassword: Boolean(user.passwordHash) });
  } catch {
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
