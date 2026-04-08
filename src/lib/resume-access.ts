import { prisma } from "@/lib/prisma";

export async function assertResumeOwner(resumeId: string, userId: string) {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });
  if (!resume) {
    return { error: "Resume not found" as const, resume: null };
  }
  return { error: null, resume };
}
