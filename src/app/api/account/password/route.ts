import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  badRequestError,
  internalServerError,
  notFoundError,
  unauthorizedError,
  validationError,
} from "@/lib/api-response";

const bodySchema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedError();
  }

  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return validationError(parsed.error.flatten(), "Invalid password update payload.");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return notFoundError("User not found");
    }

    const { currentPassword, newPassword } = parsed.data;

    if (user.passwordHash) {
      if (!currentPassword) {
        return badRequestError("Current password is required");
      }

      const validCurrent = await compare(currentPassword, user.passwordHash);
      if (!validCurrent) {
        return badRequestError("Current password is incorrect");
      }
    }

    const passwordHash = await hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return apiSuccess(
      { hadPassword: Boolean(user.passwordHash) },
      { code: "PASSWORD_UPDATED" },
    );
  } catch {
    return internalServerError("Failed to update password");
  }
}
