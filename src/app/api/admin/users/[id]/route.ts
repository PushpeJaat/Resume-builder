import { z } from "zod";
import { auth } from "@/auth";
import {
  apiSuccess,
  badRequestError,
  forbiddenError,
  unauthorizedError,
  validationError,
} from "@/lib/api-response";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  plan: z.enum(["FREE", "PREMIUM"]),
});

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: unauthorizedError() };
  }

  if (!isAdminEmail(session.user.email)) {
    return { error: forbiddenError() };
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
    return validationError(parsed.error.flatten(), "Invalid user update payload.");
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

  return apiSuccess({ user: updated }, { code: "ADMIN_USER_UPDATED" });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await ensureAdmin();
  if (gate.error || !gate.session) {
    return gate.error;
  }

  const { id } = await context.params;

  if (id === gate.session.user.id) {
    return badRequestError("You cannot delete your own admin account.");
  }

  await prisma.user.delete({ where: { id } });
  return apiSuccess({}, { code: "ADMIN_USER_DELETED" });
}
