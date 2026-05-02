import { auth } from "@/auth";
import { apiSuccess, forbiddenError, unauthorizedError } from "@/lib/api-response";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const DEFAULT_LATENCY_WINDOW_HOURS = 24 * 7;
const MAX_LATENCY_WINDOW_HOURS = 24 * 30;
const MAX_POINTS_PER_METRIC = 96;
const TRACKED_LATENCY_METRICS = [
  "voice.api.total_ms",
  "voice.api.openai_ms",
  "voice.api.fast_router_ms",
  "voice.tts.api.total_ms",
] as const;

const LATENCY_METRIC_LABELS: Record<string, string> = {
  "voice.api.total_ms": "Voice Command End-to-End",
  "voice.api.openai_ms": "Voice Command LLM Only",
  "voice.api.fast_router_ms": "Voice Fast Router",
  "voice.tts.api.total_ms": "Voice Premium TTS",
};

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorizedError();
  }

  if (!isAdminEmail(session.user.email)) {
    return forbiddenError();
  }

  const url = new URL(req.url);
  const requestedLatencyHours = parsePositiveInt(url.searchParams.get("latencyHours"), DEFAULT_LATENCY_WINDOW_HOURS);
  const latencyWindowHours = Math.min(MAX_LATENCY_WINDOW_HOURS, Math.max(1, requestedLatencyHours));
  const latencyWindowStart = new Date(Date.now() - latencyWindowHours * 60 * 60 * 1000);

  const [
    usersCount,
    resumesCount,
    downloadsCount,
    paymentsCount,
    paidPaymentsCount,
    blogsCount,
    users,
    recentResumes,
    recentPayments,
    latencySnapshotCount,
    latencySnapshots,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.resume.count(),
    prisma.downloadHistory.count(),
    prisma.paymentOrder.count(),
    prisma.paymentOrder.count({ where: { status: "PAID" } }),
    prisma.blogPost.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 120,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            resumes: true,
            downloads: true,
            payments: true,
          },
        },
      },
    }),
    prisma.resume.findMany({
      orderBy: { updatedAt: "desc" },
      take: 80,
      select: {
        id: true,
        title: true,
        templateId: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.paymentOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 120,
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            templateId: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.latencyMetricSnapshot.count({
      where: {
        metric: {
          in: [...TRACKED_LATENCY_METRICS],
        },
        createdAt: {
          gte: latencyWindowStart,
        },
      },
    }),
    prisma.latencyMetricSnapshot.findMany({
      where: {
        metric: {
          in: [...TRACKED_LATENCY_METRICS],
        },
        createdAt: {
          gte: latencyWindowStart,
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 4_000,
    }),
  ]);

  const sortedLatencySnapshots = [...latencySnapshots].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  );

  const latencyByMetric = new Map<string, typeof latencySnapshots>();
  for (const snapshot of sortedLatencySnapshots) {
    const current = latencyByMetric.get(snapshot.metric);
    if (current) {
      current.push(snapshot);
      continue;
    }

    latencyByMetric.set(snapshot.metric, [snapshot]);
  }

  const latencySeries = TRACKED_LATENCY_METRICS.map((metric) => {
    const entries = latencyByMetric.get(metric) ?? [];
    const normalizedPoints = entries.map((entry) => ({
      at: entry.createdAt.toISOString(),
      p50Ms: roundMs(entry.p50Ms),
      p95Ms: roundMs(entry.p95Ms),
      avgMs: roundMs(entry.avgMs),
      sampleSize: entry.sampleSize,
      count: entry.count,
    }));
    const points = downsamplePoints(normalizedPoints, MAX_POINTS_PER_METRIC);
    const latest = points[points.length - 1] ?? null;

    return {
      metric,
      label: LATENCY_METRIC_LABELS[metric] ?? metric,
      points,
      latest,
    };
  });

  const latencySummary = latencySeries.map((series) => ({
    metric: series.metric,
    label: series.label,
    hasData: Boolean(series.latest),
    lastP50Ms: series.latest?.p50Ms ?? null,
    lastP95Ms: series.latest?.p95Ms ?? null,
    lastAvgMs: series.latest?.avgMs ?? null,
    points: series.points.length,
  }));

  return apiSuccess(
    {
      stats: {
        users: usersCount,
        resumes: resumesCount,
        downloads: downloadsCount,
        payments: paymentsCount,
        paidPayments: paidPaymentsCount,
        blogs: blogsCount,
      },
      latency: {
        windowHours: latencyWindowHours,
        windowStart: latencyWindowStart.toISOString(),
        generatedAt: new Date().toISOString(),
        totalSnapshots: latencySnapshotCount,
        metrics: latencySummary,
        series: latencySeries,
      },
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        createdAt: user.createdAt,
        resumeCount: user._count.resumes,
        downloadCount: user._count.downloads,
        paymentCount: user._count.payments,
      })),
      resumes: recentResumes.map((resume) => ({
        id: resume.id,
        title: resume.title,
        templateId: resume.templateId,
        updatedAt: resume.updatedAt,
        userId: resume.user.id,
        userEmail: resume.user.email,
        userName: resume.user.name,
      })),
      payments: recentPayments.map((order) => ({
        id: order.id,
        provider: order.provider,
        orderId: order.providerOrderId,
        status: order.status,
        providerStatus: order.cashfreeOrderStatus,
        amountInPaise: order.amountInPaise,
        currency: order.currency,
        createdAt: order.createdAt,
        paymentConfirmedAt: order.paymentConfirmedAt,
        resumeId: order.resume.id,
        resumeTitle: order.resume.title,
        resumeTemplateId: order.resume.templateId,
        userId: order.user.id,
        userEmail: order.user.email,
        userName: order.user.name,
      })),
    },
    { code: "ADMIN_DASHBOARD_LOADED" },
  );
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function roundMs(value: number) {
  return Math.round(value * 10) / 10;
}

function downsamplePoints<T>(points: T[], maxPoints: number) {
  if (points.length <= maxPoints) {
    return points;
  }

  const stride = Math.ceil(points.length / maxPoints);
  const sampled: T[] = [];

  for (let index = 0; index < points.length; index += stride) {
    sampled.push(points[index]);
  }

  const lastPoint = points[points.length - 1];
  if (sampled[sampled.length - 1] !== lastPoint && lastPoint) {
    sampled.push(lastPoint);
  }

  return sampled;
}
