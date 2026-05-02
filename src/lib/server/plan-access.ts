import { prisma } from "@/lib/prisma";
import {
  getDownloadLimitForTier,
  PLAN_VALIDITY_MS,
  type PaidPlanTier,
} from "@/lib/plan-config";

export type PlanDownloadAccess = {
  status: "ACTIVE" | "NO_ACTIVE_PLAN" | "LIMIT_REACHED";
  planTier: PaidPlanTier | null;
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
      planTier: true,
    },
  });

  if (!latestPaidOrder) {
    return {
      status: "NO_ACTIVE_PLAN",
      planTier: null,
      planStartedAt: null,
      planExpiresAt: null,
      downloadsUsed: 0,
      downloadsRemaining: 0,
      downloadLimit: getDownloadLimitForTier("BASIC"),
    };
  }

  const planTier = latestPaidOrder.planTier;
  const downloadLimit = getDownloadLimitForTier(planTier);
  const planStartedAt = latestPaidOrder.paymentConfirmedAt ?? latestPaidOrder.createdAt;
  const planExpiresAt = new Date(planStartedAt.getTime() + PLAN_VALIDITY_MS);
  const now = new Date();

  if (now >= planExpiresAt) {
    return {
      status: "NO_ACTIVE_PLAN",
      planTier,
      planStartedAt,
      planExpiresAt,
      downloadsUsed: 0,
      downloadsRemaining: 0,
      downloadLimit,
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

  const downloadsRemaining = Math.max(downloadLimit - downloadsUsed, 0);
  const status = downloadsRemaining > 0 ? "ACTIVE" : "LIMIT_REACHED";

  return {
    status,
    planTier,
    planStartedAt,
    planExpiresAt,
    downloadsUsed,
    downloadsRemaining,
    downloadLimit,
  };
}
