type LatencyMetricBucket = {
  count: number;
  samples: number[];
};

type LatencyMeta = Record<string, unknown>;

type LatencyRecordOptions = {
  windowSize?: number;
  logEvery?: number;
  enabled?: boolean;
  logger?: (message: string, payload: Record<string, unknown>) => void;
  meta?: LatencyMeta;
};

export type LatencySnapshot = {
  metric: string;
  count: number;
  sampleSize: number;
  lastMs: number;
  minMs: number;
  maxMs: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
};

type GlobalWithLatencyStore = typeof globalThis & {
  __resumeBuilderLatencyStore?: Map<string, LatencyMetricBucket>;
};

function getLatencyStore() {
  const globalStore = globalThis as GlobalWithLatencyStore;
  if (!globalStore.__resumeBuilderLatencyStore) {
    globalStore.__resumeBuilderLatencyStore = new Map<string, LatencyMetricBucket>();
  }

  return globalStore.__resumeBuilderLatencyStore;
}

function clampPositiveInt(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  const parsed = Math.floor(value);
  return parsed > 0 ? parsed : fallback;
}

function roundMs(value: number) {
  return Math.round(value * 10) / 10;
}

function percentile(sortedValues: number[], percentileValue: number) {
  if (sortedValues.length === 0) {
    return 0;
  }

  if (sortedValues.length === 1) {
    return sortedValues[0];
  }

  const rank = (sortedValues.length - 1) * percentileValue;
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);

  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex] ?? 0;
  }

  const lower = sortedValues[lowerIndex] ?? 0;
  const upper = sortedValues[upperIndex] ?? lower;
  const weight = rank - lowerIndex;
  return lower + (upper - lower) * weight;
}

export function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function elapsedMs(startedAtMs: number) {
  return Math.max(0, nowMs() - startedAtMs);
}

export function recordLatencyMetric(metric: string, durationMs: number, options: LatencyRecordOptions = {}) {
  const store = getLatencyStore();
  const bucket = store.get(metric) ?? { count: 0, samples: [] };

  const windowSize = clampPositiveInt(options.windowSize ?? 200, 200);
  const logEvery = clampPositiveInt(options.logEvery ?? 10, 10);
  const enabled = options.enabled ?? true;

  const normalizedDuration = roundMs(Math.max(0, durationMs));
  bucket.count += 1;
  bucket.samples.push(normalizedDuration);

  if (bucket.samples.length > windowSize) {
    bucket.samples.splice(0, bucket.samples.length - windowSize);
  }

  store.set(metric, bucket);

  const sorted = [...bucket.samples].sort((a, b) => a - b);
  const total = sorted.reduce((sum, value) => sum + value, 0);

  const snapshot: LatencySnapshot = {
    metric,
    count: bucket.count,
    sampleSize: sorted.length,
    lastMs: normalizedDuration,
    minMs: sorted[0] ?? normalizedDuration,
    maxMs: sorted[sorted.length - 1] ?? normalizedDuration,
    avgMs: roundMs(total / Math.max(1, sorted.length)),
    p50Ms: roundMs(percentile(sorted, 0.5)),
    p95Ms: roundMs(percentile(sorted, 0.95)),
  };

  if (enabled && bucket.count % logEvery === 0) {
    const logger = options.logger ?? ((message, payload) => console.info(message, payload));
    logger(`[latency] ${metric}`, {
      ...snapshot,
      ...(options.meta ? { meta: options.meta } : {}),
    });
  }

  return snapshot;
}
