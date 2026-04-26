import { auth } from "@/auth";
import { apiSuccess, forbiddenError, unauthorizedError } from "@/lib/api-response";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

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

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await ensureAdmin();
  if (gate.error) {
    return gate.error;
  }

  const { id } = await context.params;

  await prisma.blogPost.delete({ where: { id } });
  return apiSuccess({}, { code: "ADMIN_BLOG_DELETED" });
}
