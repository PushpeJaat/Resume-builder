import { prisma } from "@/lib/prisma";
import { isPremiumTemplate } from "@/lib/templates/registry";

export async function assertResumeOwner(resumeId: string, userId: string) {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });
  if (!resume) {
    return { error: "Resume not found" as const, resume: null };
  }
  return { error: null, resume };
}

export function canUseTemplate(plan: "FREE" | "PREMIUM", templateId: string): boolean {
  if (!isPremiumTemplate(templateId)) return true;
  return plan === "PREMIUM";
}
