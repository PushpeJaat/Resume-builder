import { prisma } from "@/lib/prisma";
import { PLAN_DOWNLOAD_LIMIT, PLAN_VALIDITY_MS } from "@/lib/plan-config";

export type PlanDownloadAccess = {
  status: "ACTIVE" | "NO_ACTIVE_PLAN" | "LIMIT_REACHED";
  planStartedAt: Date | null;
  planExpiresAt: Date | null;
  downloadsUsed: number;
  downloadsRemaining: number;
  downloadLimit: number;
};

export async function getPlanDownloadAccess(userId: string): Promise<PlanDownloadAccess> {
  const latestPaidOrder = await prisma.paymentOrder.findFirst({
    where: {
      userId,
      status: "PAID",
    },
    orderBy: [{ paymentConfirmedAt: "desc" }, { createdAt: "desc" }],
    select: {
      paymentConfirmedAt: true,
      createdAt: true,
    },
  });

  if (!latestPaidOrder) {
    return {
      status: "NO_ACTIVE_PLAN",
      planStartedAt: null,
      planExpiresAt: null,
      downloadsUsed: 0,
      downloadsRemaining: 0,
      downloadLimit: PLAN_DOWNLOAD_LIMIT,
    };
  }

  const planStartedAt = latestPaidOrder.paymentConfirmedAt ?? latestPaidOrder.createdAt;
  const planExpiresAt = new Date(planStartedAt.getTime() + PLAN_VALIDITY_MS);
  const now = new Date();

  if (now >= planExpiresAt) {
    return {
      status: "NO_ACTIVE_PLAN",
      planStartedAt,
      planExpiresAt,
      downloadsUsed: 0,
      downloadsRemaining: 0,
      downloadLimit: PLAN_DOWNLOAD_LIMIT,
    };
  }

  const downloadsUsed = await prisma.downloadHistory.count({
    where: {
      userId,
      createdAt: {
        gte: planStartedAt,
        lt: planExpiresAt,
      },
    },
  });

  const downloadsRemaining = Math.max(PLAN_DOWNLOAD_LIMIT - downloadsUsed, 0);
  const status = downloadsRemaining > 0 ? "ACTIVE" : "LIMIT_REACHED";

  return {
    status,
    planStartedAt,
    planExpiresAt,
    downloadsUsed,
    downloadsRemaining,
    downloadLimit: PLAN_DOWNLOAD_LIMIT,
  };
}
