import OpenAI from "openai";
import { z } from "zod";
import { auth } from "@/auth";
import { ensureResumeIds } from "@/lib/normalize-resume";
import { assertResumeOwner } from "@/lib/resume-access";
import { getVoiceTokenAccess, recordVoiceTokenUsage } from "@/lib/server/voice-token-access";
import { persistLatencySnapshot } from "@/lib/server/latency-snapshot-store";
import { apiError, apiSuccess, internalServerError, notFoundError, unauthorizedError, validationError } from "@/lib/api-response";
import { elapsedMs, nowMs, recordLatencyMetric } from "@/lib/latency-metrics";
import { resumeDataSchema, type ResumeData } from "@/types/resume";

export const runtime = "nodejs";
export const maxDuration = 30;

const DEFAULT_MODEL = "gpt-4o-mini";
const OPENAI_TIMEOUT_MS = parsePositiveInt(process.env.OPENAI_VOICE_TIMEOUT_MS, 14_000);
const MAX_OPENAI_COMPLETION_TOKENS = parsePositiveInt(process.env.OPENAI_VOICE_MAX_TOKENS, 1_200);
const AI_TOKENS_PER_VOICE_CREDIT = parsePositiveInt(process.env.VOICE_CREDIT_TOKEN_BLOCK, 100);
const VOICE_LATENCY_LOGS_ENABLED = parseBoolean(process.env.VOICE_LATENCY_LOGS, true);
const VOICE_LATENCY_LOG_EVERY = parsePositiveInt(process.env.VOICE_LATENCY_LOG_EVERY, 8);
const VOICE_LATENCY_DB_ENABLED = parseBoolean(process.env.VOICE_LATENCY_DB_ENABLED, true);
const FAST_SUMMARY_MAX_CHARS = parsePositiveInt(process.env.VOICE_FAST_SUMMARY_MAX_CHARS, 500);
const responseFormatCompatibilityByModel = new Map<string, boolean>();

const voiceCommandRequestSchema = z.object({
  transcript: z.string().trim().min(1).max(1_800),
  locale: z.string().trim().max(40).optional(),
  currentData: resumeDataSchema.optional(),
});

const voiceCommandAiSchema = z.object({
  status: z.enum(["applied", "clarification"]),
  assistantReply: z.string().trim().min(1).max(420),
  changeSummary: z.string().trim().max(420).optional().default(""),
  nextData: resumeDataSchema.nullable(),
});

type VoiceCommandAiResult = z.infer<typeof voiceCommandAiSchema>;
type VoiceProcessingPath = "fast-router" | "openai";

type FastVoiceCommandMatch = {
  rule: string;
  result: VoiceCommandAiResult;
};

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const requestStartedAt = nowMs();
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedError();
  }

  const { id } = await ctx.params;
  const { error, resume } = await assertResumeOwner(id, session.user.id);
  if (error || !resume) {
    return notFoundError();
  }

  const json = await req.json().catch(() => null);
  const parsedBody = voiceCommandRequestSchema.safeParse(json);
  if (!parsedBody.success) {
    return validationError(parsedBody.error.flatten(), "Invalid voice command payload.");
  }

  const persistedResumeData = resumeDataSchema.safeParse(resume.data);
  if (!persistedResumeData.success) {
    return internalServerError("Stored resume data is invalid. Please refresh and try again.");
  }

  const currentData = ensureResumeIds(parsedBody.data.currentData ?? persistedResumeData.data);
  const fastMatch = tryApplyFastVoiceCommand({
    transcript: parsedBody.data.transcript,
    currentData,
  });
  const tokenAccess = await getVoiceTokenAccess(session.user.id);

  if (tokenAccess.status === "EXHAUSTED" && !fastMatch) {
    return apiError({
      status: 402,
      code: "VOICE_TOKENS_EXHAUSTED",
      error: "Your AI voice tokens are finished. Please upgrade your plan to continue.",
      extra: {
        redirectTo: "/pricing",
        tokenLimit: tokenAccess.tokenLimit,
        tokensUsed: tokenAccess.tokensUsed,
        tokensRemaining: tokenAccess.tokensRemaining,
        planTier: tokenAccess.planTier,
      },
    });
  }

  try {
    let processingPath: VoiceProcessingPath = "openai";
    let modelMs: number | null = null;

    const fastMatchStartedAt = nowMs();

    const aiResult =
      fastMatch !== null
        ? {
            result: fastMatch.result,
            totalAiTokens: 0,
          }
        : await (async () => {
            const modelStartedAt = nowMs();
            const output = await applyVoiceCommand({
              transcript: parsedBody.data.transcript,
              locale: parsedBody.data.locale,
              currentData,
              remainingCredits: tokenAccess.tokensRemaining,
            });
            modelMs = elapsedMs(modelStartedAt);
            recordVoiceLatency("voice.api.openai_ms", modelMs, {
              mode: "openai",
            });
            return output;
          })();

    const usedFastRouter = fastMatch !== null;

    if (usedFastRouter) {
      processingPath = "fast-router";
      modelMs = 0;
      recordVoiceLatency("voice.api.fast_router_ms", elapsedMs(fastMatchStartedAt), {
        rule: fastMatch.rule,
      });
    }

    const rawCredits = usedFastRouter ? 0 : toVoiceCredits(aiResult.totalAiTokens, parsedBody.data.transcript);
    const creditsUsed = usedFastRouter ? 0 : Math.max(1, Math.min(tokenAccess.tokensRemaining, rawCredits));
    await recordVoiceTokenUsage({
      userId: session.user.id,
      creditsUsed,
      aiTokens: aiResult.totalAiTokens,
      planTier: tokenAccess.planTier,
      source: "voice-command",
    });

    const tokensRemainingAfter = Math.max(tokenAccess.tokensRemaining - creditsUsed, 0);
    const latency = {
      path: processingPath,
      totalMs: elapsedMs(requestStartedAt),
      modelMs,
    };

    recordVoiceLatency("voice.api.total_ms", latency.totalMs, {
      path: processingPath,
      status: aiResult.result.status,
      creditsUsed,
    });

    if (aiResult.result.status === "clarification") {
      return apiSuccess(
        {
          status: "clarification",
          assistantReply: aiResult.result.assistantReply,
          changeSummary: aiResult.result.changeSummary,
          nextData: null,
          tokensUsed: creditsUsed,
          tokensRemaining: tokensRemainingAfter,
          tokenLimit: tokenAccess.tokenLimit,
          planTier: tokenAccess.planTier,
          latency,
        },
        { code: "VOICE_COMMAND_CLARIFICATION" },
      );
    }

    if (!aiResult.result.nextData) {
      return apiError({
        status: 502,
        code: "UPSTREAM_ERROR",
        error: "AI response did not include updated resume data.",
      });
    }

    const nextData = ensureResumeIds(aiResult.result.nextData);

    return apiSuccess(
      {
        status: "applied",
        assistantReply: aiResult.result.assistantReply,
        changeSummary: aiResult.result.changeSummary,
        nextData,
        tokensUsed: creditsUsed,
        tokensRemaining: tokensRemainingAfter,
        tokenLimit: tokenAccess.tokenLimit,
        planTier: tokenAccess.planTier,
        latency,
      },
      { code: "VOICE_COMMAND_APPLIED" },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not process voice command.";
    recordVoiceLatency("voice.api.error_ms", elapsedMs(requestStartedAt), {
      message,
    });

    return apiError({
      status: 502,
      code: "UPSTREAM_ERROR",
      error: message,
    });
  }
}

async function applyVoiceCommand(args: {
  transcript: string;
  locale?: string;
  currentData: ResumeData;
  remainingCredits: number;
}): Promise<{ result: VoiceCommandAiResult; totalAiTokens: number }> {
  const apiKey = (process.env.OPENAI_API_KEY ?? "").trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing for voice command processing.");
  }

  const model =
    (process.env.OPENAI_VOICE_MODEL ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL).trim() ||
    DEFAULT_MODEL;
  const languageHint = detectUserLanguageHint(args.transcript, args.locale);

  const client = new OpenAI({ apiKey });

  const systemPrompt = [
    "You are a resume JSON editor for voice commands.",
    "Understand Hindi, English, and Hinglish (including imperfect grammar/spelling).",
    "Return JSON only with shape:",
    '{"status":"applied"|"clarification","assistantReply":string,"changeSummary":string,"nextData":ResumeData|null}',
    "If request is clear: status='applied' and return complete nextData.",
    "If critical info is missing: status='clarification', nextData=null, and ask one concise follow-up question.",
    "Keep untouched fields unchanged and do not invent personal facts.",
    "assistantReply: max two short sentences, in user's language style.",
    "Language policy: if transcript is clearly English, assistantReply MUST be English even when locale is hi-IN.",
    "Use Hindi/Hinglish only when transcript itself indicates Hindi/Hinglish.",
  ].join("\n");

  const userPrompt = JSON.stringify({
    locale: args.locale ?? "unknown",
    languageHint,
    transcript: args.transcript,
    currentData: args.currentData,
  });

  const raw = await requestJsonResponse({
    client,
    model,
    systemPrompt,
    userPrompt,
    remainingCredits: args.remainingCredits,
  });

  const parsed = parseJsonObject(raw.content);
  if (!parsed) {
    throw new Error(`${model} returned invalid JSON for voice command.`);
  }

  const validated = voiceCommandAiSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error("AI voice command response did not match the required schema.");
  }

  if (validated.data.status === "applied" && !validated.data.nextData) {
    throw new Error("AI marked command as applied but did not return nextData.");
  }

  if (validated.data.status === "clarification") {
    return {
      result: {
        ...validated.data,
        nextData: null,
      },
      totalAiTokens: raw.totalAiTokens,
    };
  }

  return {
    result: validated.data,
    totalAiTokens: raw.totalAiTokens,
  };
}

async function requestJsonResponse(args: {
  client: OpenAI;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  remainingCredits: number;
}) {
  const boundedMaxTokens = Math.max(
    120,
    Math.min(MAX_OPENAI_COMPLETION_TOKENS, args.remainingCredits * AI_TOKENS_PER_VOICE_CREDIT),
  );

  const request = {
    model: args.model,
    temperature: 0,
    max_tokens: boundedMaxTokens,
    messages: [
      {
        role: "system" as const,
        content: args.systemPrompt,
      },
      {
        role: "user" as const,
        content: args.userPrompt,
      },
    ],
  };

  const responseFormatSupported = responseFormatCompatibilityByModel.get(args.model);

  if (responseFormatSupported === false) {
    const response = await withTimeout(
      args.client.chat.completions.create(request),
      OPENAI_TIMEOUT_MS,
      "Voice command processing timed out.",
    );

    return {
      content: response.choices[0]?.message?.content ?? "",
      totalAiTokens: response.usage?.total_tokens ?? 0,
    };
  }

  try {
    const response = await withTimeout(
      args.client.chat.completions.create({
        ...request,
        response_format: { type: "json_object" },
      }),
      OPENAI_TIMEOUT_MS,
      "Voice command processing timed out.",
    );

    responseFormatCompatibilityByModel.set(args.model, true);

    return {
      content: response.choices[0]?.message?.content ?? "",
      totalAiTokens: response.usage?.total_tokens ?? 0,
    };
  } catch (error) {
    if (!isResponseFormatCompatibilityError(error)) {
      throw error;
    }

    responseFormatCompatibilityByModel.set(args.model, false);

    const fallbackResponse = await withTimeout(
      args.client.chat.completions.create(request),
      OPENAI_TIMEOUT_MS,
      "Voice command processing timed out.",
    );

    return {
      content: fallbackResponse.choices[0]?.message?.content ?? "",
      totalAiTokens: fallbackResponse.usage?.total_tokens ?? 0,
    };
  }
}

function toVoiceCredits(totalAiTokens: number, transcript: string) {
  if (totalAiTokens > 0) {
    return Math.max(1, Math.ceil(totalAiTokens / AI_TOKENS_PER_VOICE_CREDIT));
  }

  return Math.max(1, Math.ceil(Math.max(40, transcript.trim().length) / 80));
}

function tryApplyFastVoiceCommand(args: { transcript: string; currentData: ResumeData }): FastVoiceCommandMatch | null {
  const transcript = args.transcript.trim();
  if (!transcript) {
    return null;
  }

  const replyStyle = detectReplyStyle(transcript);

  const email = extractEmailValue(transcript);
  if (email && /\b(?:email|e-mail|mail)\b/i.test(transcript)) {
    const normalized = email.toLowerCase();
    const isUnchanged = normalized === args.currentData.personal.email.trim().toLowerCase();

    const nextData: ResumeData = {
      ...args.currentData,
      personal: {
        ...args.currentData.personal,
        email: normalized,
      },
    };

    return {
      rule: "email",
      result: {
        status: "applied",
        assistantReply: buildFastReply(
          replyStyle,
          isUnchanged
            ? "Your email already matches this value."
            : "Done. I updated your email.",
          isUnchanged
            ? "Email same hai, already updated value hai."
            : "Done, email update ho gaya.",
        ),
        changeSummary: isUnchanged ? "Email was already set to the same value." : "Updated personal email.",
        nextData,
      },
    };
  }

  const phone = extractPhoneValue(transcript);
  if (phone && /\b(?:phone|mobile|contact|number)\b/i.test(transcript)) {
    const isUnchanged = normalizeSpaces(phone) === normalizeSpaces(args.currentData.personal.phone);
    const nextData: ResumeData = {
      ...args.currentData,
      personal: {
        ...args.currentData.personal,
        phone,
      },
    };

    return {
      rule: "phone",
      result: {
        status: "applied",
        assistantReply: buildFastReply(
          replyStyle,
          isUnchanged
            ? "Your phone number is already the same."
            : "Done. I updated your phone number.",
          isUnchanged
            ? "Phone number already same hai."
            : "Done, phone number update ho gaya.",
        ),
        changeSummary: isUnchanged ? "Phone number was already the same." : "Updated personal phone number.",
        nextData,
      },
    };
  }

  const name = extractNameValue(transcript);
  if (name) {
    const isUnchanged = normalizeSpaces(name).toLowerCase() === normalizeSpaces(args.currentData.personal.fullName).toLowerCase();
    const nextData: ResumeData = {
      ...args.currentData,
      personal: {
        ...args.currentData.personal,
        fullName: name,
      },
    };

    return {
      rule: "name",
      result: {
        status: "applied",
        assistantReply: buildFastReply(
          replyStyle,
          isUnchanged ? "Your name is already set to that value." : "Done. I updated your full name.",
          isUnchanged ? "Name already same value pe set hai." : "Done, full name update ho gaya.",
        ),
        changeSummary: isUnchanged ? "Full name was already the same." : "Updated full name.",
        nextData,
      },
    };
  }

  const location = extractLocationValue(transcript);
  if (location) {
    const isUnchanged = normalizeSpaces(location).toLowerCase() === normalizeSpaces(args.currentData.personal.location).toLowerCase();
    const nextData: ResumeData = {
      ...args.currentData,
      personal: {
        ...args.currentData.personal,
        location,
      },
    };

    return {
      rule: "location",
      result: {
        status: "applied",
        assistantReply: buildFastReply(
          replyStyle,
          isUnchanged ? "Your location is already set to that value." : "Done. I updated your location.",
          isUnchanged ? "Location already same value pe set hai." : "Done, location update ho gaya.",
        ),
        changeSummary: isUnchanged ? "Location was already the same." : "Updated personal location.",
        nextData,
      },
    };
  }

  if (/\b(?:clear|remove|delete|erase)\s+(?:my\s+)?(?:professional\s+|profile\s+)?summary\b/i.test(transcript)) {
    const nextData: ResumeData = {
      ...args.currentData,
      summary: "",
    };

    return {
      rule: "summary-clear",
      result: {
        status: "applied",
        assistantReply: buildFastReply(
          replyStyle,
          "Done. I cleared your summary.",
          "Done, summary clear kar diya.",
        ),
        changeSummary: "Cleared resume summary.",
        nextData,
      },
    };
  }

  const summaryReplacement = extractSummaryReplacement(transcript);
  if (summaryReplacement) {
    const nextData: ResumeData = {
      ...args.currentData,
      summary: summaryReplacement.slice(0, FAST_SUMMARY_MAX_CHARS),
    };

    return {
      rule: "summary-replace",
      result: {
        status: "applied",
        assistantReply: buildFastReply(
          replyStyle,
          "Done. I updated your summary.",
          "Done, summary update ho gaya.",
        ),
        changeSummary: "Updated resume summary.",
        nextData,
      },
    };
  }

  const summaryAppend = extractSummaryAppend(transcript);
  if (summaryAppend) {
    const existing = args.currentData.summary.trim();
    const mergedSummary = mergeSummary(existing, summaryAppend).slice(0, FAST_SUMMARY_MAX_CHARS);

    const nextData: ResumeData = {
      ...args.currentData,
      summary: mergedSummary,
    };

    return {
      rule: "summary-append",
      result: {
        status: "applied",
        assistantReply: buildFastReply(
          replyStyle,
          "Done. I added that to your summary.",
          "Done, summary me add kar diya.",
        ),
        changeSummary: "Added details to resume summary.",
        nextData,
      },
    };
  }

  return null;
}

function extractNameValue(transcript: string) {
  const matched = extractByPatterns(transcript, [
    /\b(?:set|update|change|replace|edit)\s+(?:my\s+)?(?:full\s+)?name\s+(?:to|as)\s+(.+)$/i,
    /\b(?:my\s+name\s+is|name\s+is)\s+(.+)$/i,
    /\bmera\s+naam(?:\s+hai)?\s+(.+)$/i,
  ]);

  return sanitizeExtractedValue(matched, 120);
}

function extractEmailValue(transcript: string) {
  const match = transcript.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return sanitizeExtractedValue(match?.[1] ?? "", 180).toLowerCase();
}

function extractPhoneValue(transcript: string) {
  const match = transcript.match(/(\+?\d[\d\s().-]{7,}\d)/);
  return sanitizeExtractedValue(match?.[1] ?? "", 40);
}

function extractLocationValue(transcript: string) {
  const matched = extractByPatterns(transcript, [
    /\b(?:set|update|change|replace|edit)\s+(?:my\s+)?(?:location|city|address)\s+(?:to|as)\s+(.+)$/i,
    /\b(?:i\s+am\s+based\s+in|i\s+live\s+in|based\s+in|from)\s+(.+)$/i,
    /\bmain\s+(.+?)\s+se\s+h(?:u|oo)n\b/i,
  ]);

  return sanitizeExtractedValue(matched, 140);
}

function extractSummaryReplacement(transcript: string) {
  const matched = extractByPatterns(transcript, [
    /\b(?:set|update|change|replace|edit)\s+(?:my\s+)?(?:professional\s+|profile\s+)?summary\s+(?:to|as)\s+(.+)$/i,
    /\b(?:summary|professional\s+summary|profile\s+summary|objective)\s*(?:is|to|:)\s+(.+)$/i,
  ]);

  return sanitizeExtractedValue(matched, FAST_SUMMARY_MAX_CHARS);
}

function extractSummaryAppend(transcript: string) {
  const matched = extractByPatterns(transcript, [
    /\b(?:add|include|append)\s+(.+?)\s+(?:to|in)\s+(?:my\s+)?(?:professional\s+|profile\s+)?summary\b/i,
  ]);

  return sanitizeExtractedValue(matched, FAST_SUMMARY_MAX_CHARS);
}

function extractByPatterns(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match?.[1];
    if (value) {
      return value;
    }
  }

  return "";
}

function sanitizeExtractedValue(value: string, maxChars: number) {
  if (!value) {
    return "";
  }

  return value
    .replace(/^[:\-=\s]+/, "")
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:\s]+$/, "")
    .replace(/\b(?:please|pls)\b[.!\s]*$/i, "")
    .trim()
    .slice(0, maxChars);
}

function mergeSummary(existingSummary: string, addedText: string) {
  const base = sanitizeExtractedValue(existingSummary, FAST_SUMMARY_MAX_CHARS);
  const addition = sanitizeExtractedValue(addedText, FAST_SUMMARY_MAX_CHARS);

  if (!base) {
    return addition;
  }

  if (!addition) {
    return base;
  }

  const separator = /[.!?]$/.test(base) ? " " : ". ";
  return `${base}${separator}${addition}`;
}

function detectReplyStyle(transcript: string) {
  const lower = transcript.toLowerCase();
  if (/[\u0900-\u097F]/.test(transcript)) {
    return "hinglish" as const;
  }

  if (countRomanHindiSignals(lower) >= 2) {
    return "hinglish" as const;
  }

  return "english" as const;
}

function detectUserLanguageHint(transcript: string, locale?: string) {
  if (/[\u0900-\u097F]/.test(transcript)) {
    return "hindi" as const;
  }

  const lower = transcript.toLowerCase();
  const romanHindiSignals = countRomanHindiSignals(lower);
  if (romanHindiSignals >= 2) {
    return "hinglish" as const;
  }

  const latinChars = (lower.match(/[a-z]/g) ?? []).length;
  if (latinChars > 0) {
    return "english" as const;
  }

  if ((locale ?? "").toLowerCase().startsWith("hi")) {
    return "hindi" as const;
  }

  return "english" as const;
}

function countRomanHindiSignals(lower: string) {
  const matches = lower.match(
    /\b(?:mera|meri|mere|mujhe|naam|karo|kardo|krdo|badal|hai|nahi|bolo|likho|hatao|jodo|karna|karni|banao|karo)\b/g,
  );

  return matches?.length ?? 0;
}

function buildFastReply(style: "english" | "hinglish", englishReply: string, hinglishReply: string) {
  return style === "hinglish" ? `${hinglishReply} Koi aur change?` : `${englishReply} Any other change?`;
}

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
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
      source: "voice-command",
      route: "/api/resumes/[id]/voice-command",
      snapshot,
      meta,
    });
  }

  return snapshot;
}

function isResponseFormatCompatibilityError(error: unknown) {
  const normalized = getErrorMessage(error, "").toLowerCase();
  return (
    normalized.includes("response_format") &&
    (normalized.includes("unsupported") ||
      normalized.includes("not supported") ||
      normalized.includes("unknown") ||
      normalized.includes("invalid"))
  );
}

function parseJsonObject(value: string): unknown | null {
  const cleaned = stripCodeFences(value);
  const candidates = [
    cleaned,
    extractJsonCandidate(cleaned, "{", "}"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const parsed = safeJsonParse(candidate);
    if (parsed !== null) {
      return parsed;
    }

    const sanitized = stripTrailingCommas(candidate);
    if (sanitized !== candidate) {
      const parsedSanitized = safeJsonParse(sanitized);
      if (parsedSanitized !== null) {
        return parsedSanitized;
      }
    }
  }

  return null;
}

function stripCodeFences(value: string) {
  return value
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function extractJsonCandidate(value: string, openChar: "{" | "[", closeChar: "}" | "]") {
  const start = value.indexOf(openChar);
  const end = value.lastIndexOf(closeChar);
  if (start < 0 || end <= start) {
    return "";
  }

  return value.slice(start, end + 1).trim();
}

function stripTrailingCommas(value: string) {
  return value.replace(/,\s*([}\]])/g, "$1");
}

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    const parts = [record.message, record.details, record.hint]
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean);

    if (parts.length > 0) {
      return parts.join(" ");
    }
  }

  return fallback;
}
