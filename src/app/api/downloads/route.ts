import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, unauthorizedError } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedError();
  }
  const items = await prisma.downloadHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      resume: { select: { title: true } },
    },
  });
  return apiSuccess(
    {
      downloads: items.map((d) => ({
        id: d.id,
        createdAt: d.createdAt,
        templateId: d.templateId,
        resumeTitle: d.resume.title,
        resumeId: d.resumeId,
      })),
    },
    { code: "DOWNLOADS_LISTED" },
  );
}
