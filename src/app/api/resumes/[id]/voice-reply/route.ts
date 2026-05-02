import OpenAI from "openai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertResumeOwner } from "@/lib/resume-access";
import { persistLatencySnapshot } from "@/lib/server/latency-snapshot-store";
import { apiError, notFoundError, unauthorizedError, validationError } from "@/lib/api-response";
import { elapsedMs, nowMs, recordLatencyMetric } from "@/lib/latency-metrics";

export const runtime = "nodejs";

type SpeechCreateRequest = Parameters<OpenAI["audio"]["speech"]["create"]>[0];
type SpeechModel = SpeechCreateRequest["model"];
type SpeechVoice = SpeechCreateRequest["voice"];
type SpeechFormat = NonNullable<SpeechCreateRequest["response_format"]>;

const PREMIUM_TTS_ENABLED = parseBoolean(process.env.VOICE_PREMIUM_TTS_ENABLED, false);
const OPENAI_TTS_TIMEOUT_MS = parsePositiveInt(process.env.OPENAI_VOICE_TTS_TIMEOUT_MS, 9_000);
const VOICE_LATENCY_LOGS_ENABLED = parseBoolean(process.env.VOICE_LATENCY_LOGS, true);
const VOICE_LATENCY_LOG_EVERY = parsePositiveInt(process.env.VOICE_LATENCY_LOG_EVERY, 8);
const VOICE_LATENCY_DB_ENABLED = parseBoolean(process.env.VOICE_LATENCY_DB_ENABLED, true);

const ttsRequestSchema = z.object({
  text: z.string().trim().min(1).max(420),
  locale: z.string().trim().max(40).optional(),
});

const supportedVoices = ["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse"] as SpeechVoice[];
const supportedFormats = ["mp3", "opus", "aac", "flac", "wav", "pcm"] as SpeechFormat[];

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const startedAt = nowMs();
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedError();
  }

  const { id } = await ctx.params;
  const { error, resume } = await assertResumeOwner(id, session.user.id);
  if (error || !resume) {
    return notFoundError();
  }

  if (!PREMIUM_TTS_ENABLED) {
    return apiError({
      status: 503,
      code: "VOICE_PREMIUM_TTS_DISABLED",
      error: "Premium voice synthesis is disabled.",
    });
  }

  const apiKey = (process.env.OPENAI_API_KEY ?? "").trim();
  if (!apiKey) {
    return apiError({
      status: 503,
      code: "VOICE_PREMIUM_TTS_MISCONFIGURED",
      error: "OPENAI_API_KEY is missing for premium voice synthesis.",
    });
  }

  const rawBody = await req.json().catch(() => null);
  const parsedBody = ttsRequestSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return validationError(parsedBody.error.flatten(), "Invalid premium voice payload.");
  }

  const model = resolveTtsModel();
  const voice = resolveTtsVoice(parsedBody.data.locale);
  const format = resolveTtsFormat();
  const speed = resolveTtsSpeed();

  const client = new OpenAI({ apiKey });

  try {
    const openAiStartedAt = nowMs();
    const requestPayload: SpeechCreateRequest = {
      model,
      voice,
      input: parsedBody.data.text,
      response_format: format,
      speed,
    };

    const response = await withTimeout(
      client.audio.speech.create(requestPayload),
      OPENAI_TTS_TIMEOUT_MS,
      "Premium voice synthesis timed out.",
    );

    const buffer = Buffer.from(await response.arrayBuffer());
    const openAiMs = elapsedMs(openAiStartedAt);
    const totalMs = elapsedMs(startedAt);

    recordVoiceLatency("voice.tts.api.openai_ms", openAiMs, {
      model,
      voice,
      format,
    });
    recordVoiceLatency("voice.tts.api.total_ms", totalMs, {
      model,
      voice,
      format,
    });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentTypeForFormat(format),
        "Cache-Control": "no-store",
        "X-Voice-TTS-Provider": "openai",
        "X-Voice-TTS-Model": String(model),
        "X-Voice-TTS-Latency-Ms": String(Math.round(totalMs)),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Premium voice synthesis failed.";

    recordVoiceLatency("voice.tts.api.error_ms", elapsedMs(startedAt), {
      message,
      model,
      voice,
      format,
    });

    return apiError({
      status: 502,
      code: "UPSTREAM_ERROR",
      error: message,
    });
  }
}

function resolveTtsModel() {
  const configured = (process.env.OPENAI_VOICE_TTS_MODEL ?? "gpt-4o-mini-tts").trim();
  return (configured || "gpt-4o-mini-tts") as SpeechModel;
}

function resolveTtsVoice(locale?: string) {
  const configured = (process.env.OPENAI_VOICE_TTS_VOICE ?? "").trim().toLowerCase();
  if (configured && supportedVoices.includes(configured as SpeechVoice)) {
    return configured as SpeechVoice;
  }

  if ((locale ?? "").toLowerCase().startsWith("hi")) {
    return "coral" as SpeechVoice;
  }

  return "alloy" as SpeechVoice;
}

function resolveTtsFormat() {
  const configured = (process.env.OPENAI_VOICE_TTS_FORMAT ?? "mp3").trim().toLowerCase();
  if (supportedFormats.includes(configured as SpeechFormat)) {
    return configured as SpeechFormat;
  }

  return "mp3" as SpeechFormat;
}

function resolveTtsSpeed() {
  const parsed = Number.parseFloat((process.env.OPENAI_VOICE_TTS_SPEED ?? "1").trim());
  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.max(0.7, Math.min(1.2, parsed));
}

function contentTypeForFormat(format: SpeechFormat) {
  switch (format) {
    case "aac":
      return "audio/aac";
    case "flac":
      return "audio/flac";
    case "wav":
      return "audio/wav";
    case "pcm":
      return "audio/L16";
    case "opus":
      return "audio/ogg";
    case "mp3":
    default:
      return "audio/mpeg";
  }
}

function recordVoiceLatency(metric: string, durationMs: number, meta?: Record<string, unknown>) {
  const snapshot = recordLatencyMetric(metric, durationMs, {
    enabled: VOICE_LATENCY_LOGS_ENABLED,
    logEvery: VOICE_LATENCY_LOG_EVERY,
    windowSize: 240,
    meta,
  });

  if (VOICE_LATENCY_DB_ENABLED && snapshot.count % VOICE_LATENCY_LOG_EVERY === 0) {
    void persistLatencySnapshot({
      metric,
      source: "voice-reply",
      route: "/api/resumes/[id]/voice-reply",
      snapshot,
      meta,
    });
  }

  return snapshot;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}
