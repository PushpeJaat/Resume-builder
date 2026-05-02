import { prisma } from "@/lib/prisma";
import {
  getVoiceTokenLimitForTier,
  PLAN_VALIDITY_MS,
  type PlanTier,
} from "@/lib/plan-config";

export type VoiceTokenAccess = {
  status: "ACTIVE" | "EXHAUSTED";
  planTier: PlanTier;
  tokenLimit: number;
  tokensUsed: number;
  tokensRemaining: number;
  periodStart: Date | null;
  periodEnd: Date | null;
};

export async function getVoiceTokenAccess(userId: string): Promise<VoiceTokenAccess> {
  const [user, latestPaidOrder] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, plan: true },
    }),
    prisma.paymentOrder.findFirst({
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
    }),
  ]);

  if (!user) {
    return {
      status: "EXHAUSTED",
      planTier: "FREE",
      tokenLimit: 0,
      tokensUsed: 0,
      tokensRemaining: 0,
      periodStart: null,
      periodEnd: null,
    };
  }

  const activePaidWindow = resolveActivePaidWindow(latestPaidOrder);

  if (!activePaidWindow) {
    const tokenLimit = getVoiceTokenLimitForTier("FREE");
    const tokensUsed = await getLifetimeVoiceTokenUsage(userId);
    const tokensRemaining = Math.max(tokenLimit - tokensUsed, 0);

    return {
      status: tokensRemaining > 0 ? "ACTIVE" : "EXHAUSTED",
      planTier: "FREE",
      tokenLimit,
      tokensUsed,
      tokensRemaining,
      periodStart: null,
      periodEnd: null,
    };
  }

  const tokenLimit = getVoiceTokenLimitForTier(activePaidWindow.planTier);
  const tokensUsed = await getVoiceTokenUsageInWindow(userId, activePaidWindow.periodStart, activePaidWindow.periodEnd);
  const tokensRemaining = Math.max(tokenLimit - tokensUsed, 0);

  return {
    status: tokensRemaining > 0 ? "ACTIVE" : "EXHAUSTED",
    planTier: activePaidWindow.planTier,
    tokenLimit,
    tokensUsed,
    tokensRemaining,
    periodStart: activePaidWindow.periodStart,
    periodEnd: activePaidWindow.periodEnd,
  };
}

export async function recordVoiceTokenUsage(args: {
  userId: string;
  creditsUsed: number;
  aiTokens?: number;
  planTier: PlanTier;
  source?: string;
}) {
  const creditsUsed = Math.max(0, Math.floor(args.creditsUsed));
  if (creditsUsed <= 0) {
    return;
  }

  await prisma.voiceTokenUsage.create({
    data: {
      userId: args.userId,
      creditsUsed,
      aiTokens: Math.max(0, Math.floor(args.aiTokens ?? 0)),
      planTier: args.planTier,
      source: args.source ?? "voice-command",
    },
  });
}

async function getLifetimeVoiceTokenUsage(userId: string) {
  const aggregate = await prisma.voiceTokenUsage.aggregate({
    where: { userId },
    _sum: { creditsUsed: true },
  });

  return aggregate._sum.creditsUsed ?? 0;
}

async function getVoiceTokenUsageInWindow(userId: string, periodStart: Date, periodEnd: Date) {
  const aggregate = await prisma.voiceTokenUsage.aggregate({
    where: {
      userId,
      createdAt: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
    _sum: { creditsUsed: true },
  });

  return aggregate._sum.creditsUsed ?? 0;
}

function resolveActivePaidWindow(
  latestPaidOrder: { paymentConfirmedAt: Date | null; createdAt: Date; planTier: "BASIC" | "ADVANCE" } | null,
) {
  if (!latestPaidOrder) {
    return null;
  }

  const periodStart = latestPaidOrder.paymentConfirmedAt ?? latestPaidOrder.createdAt;
  const periodEnd = new Date(periodStart.getTime() + PLAN_VALIDITY_MS);

  if (new Date() >= periodEnd) {
    return null;
  }

  return {
    planTier: latestPaidOrder.planTier,
    periodStart,
    periodEnd,
  };
}
