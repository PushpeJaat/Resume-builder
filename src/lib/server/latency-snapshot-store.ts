import type { LatencySnapshot } from "@/lib/latency-metrics";
import { prisma } from "@/lib/prisma";

type PersistLatencySnapshotArgs = {
  metric: string;
  source: string;
  route?: string;
  snapshot: LatencySnapshot;
  meta?: Record<string, unknown>;
};

export async function persistLatencySnapshot(args: PersistLatencySnapshotArgs) {
  const meta = toSerializableJson(args.meta);

  try {
    await prisma.latencyMetricSnapshot.create({
      data: {
        metric: args.metric,
        source: args.source,
        route: args.route ?? null,
        count: args.snapshot.count,
        sampleSize: args.snapshot.sampleSize,
        lastMs: args.snapshot.lastMs,
        minMs: args.snapshot.minMs,
        maxMs: args.snapshot.maxMs,
        avgMs: args.snapshot.avgMs,
        p50Ms: args.snapshot.p50Ms,
        p95Ms: args.snapshot.p95Ms,
        meta,
      },
    });
  } catch (error) {
    console.error("Failed to persist latency snapshot", {
      metric: args.metric,
      source: args.source,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function toSerializableJson(value: unknown): object | null {
  if (value === null || value === undefined) {
    return null;
  }

  try {
    const normalized = JSON.parse(
      JSON.stringify(value, (_, current) => {
        if (typeof current === "bigint") {
          return Number(current);
        }

        if (current instanceof Date) {
          return current.toISOString();
        }

        if (typeof current === "undefined") {
          return null;
        }

        return current;
      }),
    ) as object | null;

    if (!normalized || (typeof normalized === "object" && Object.keys(normalized).length === 0)) {
      return null;
    }

    return normalized;
  } catch {
    return null;
  }
}
