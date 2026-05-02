import OpenAI from "openai";
import { z } from "zod";
import { auth } from "@/auth";
import { ensureResumeIds } from "@/lib/normalize-resume";
import { assertResumeOwner } from "@/lib/resume-access";
import { getVoiceTokenAccess, recordVoiceTokenUsage } from "@/lib/server/voice-token-access";
import { apiError, apiSuccess, internalServerError, notFoundError, unauthorizedError, validationError } from "@/lib/api-response";
import { resumeDataSchema, type ResumeData } from "@/types/resume";

export const runtime = "nodejs";
export const maxDuration = 30;

const DEFAULT_MODEL = "gpt-4o-mini";
const OPENAI_TIMEOUT_MS = parsePositiveInt(process.env.OPENAI_VOICE_TIMEOUT_MS, 25_000);
const MAX_OPENAI_COMPLETION_TOKENS = parsePositiveInt(process.env.OPENAI_VOICE_MAX_TOKENS, 3_500);
const AI_TOKENS_PER_VOICE_CREDIT = parsePositiveInt(process.env.VOICE_CREDIT_TOKEN_BLOCK, 100);

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

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
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
  const tokenAccess = await getVoiceTokenAccess(session.user.id);

  if (tokenAccess.status === "EXHAUSTED") {
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
    const aiResult = await applyVoiceCommand({
      transcript: parsedBody.data.transcript,
      locale: parsedBody.data.locale,
      currentData,
      remainingCredits: tokenAccess.tokensRemaining,
    });

    const rawCredits = toVoiceCredits(aiResult.totalAiTokens, parsedBody.data.transcript);
    const creditsUsed = Math.max(1, Math.min(tokenAccess.tokensRemaining, rawCredits));
    await recordVoiceTokenUsage({
      userId: session.user.id,
      creditsUsed,
      aiTokens: aiResult.totalAiTokens,
      planTier: tokenAccess.planTier,
      source: "voice-command",
    });

    const tokensRemainingAfter = Math.max(tokenAccess.tokensRemaining - creditsUsed, 0);

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
      },
      { code: "VOICE_COMMAND_APPLIED" },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not process voice command.";
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

  const client = new OpenAI({ apiKey });

  const systemPrompt = [
    "You are an AI resume editing engine for voice commands.",
    "You can understand Hindi, English, and mixed Hinglish even when grammar is broken, words are misspelled, and Hindi is written in Roman script.",
    "You must update resume JSON based on the user's intent.",
    "Return JSON only. Do not return markdown.",
    "Required output JSON shape:",
    "{",
    '  "status": "applied" | "clarification",',
    '  "assistantReply": string,',
    '  "changeSummary": string,',
    '  "nextData": ResumeData | null',
    "}",
    "Rules:",
    "- If instruction is clear, set status='applied' and provide a complete nextData object.",
    "- Keep untouched fields unchanged.",
    "- Do not invent personal facts that user did not ask for.",
    "- If important details are missing, set status='clarification', nextData=null, and ask one concise follow-up question.",
    "- assistantReply should match user's language style (Hindi/English/Hinglish) and be max two short sentences.",
    "- When status='applied', assistantReply should confirm what changed and invite next instruction.",
    "- nextData must strictly follow this structure:",
    "  personal: { fullName, email, phone, location, photoUrl, links: [{label,url}] },",
    "  summary: string,",
    "  experience: [{ company, role, start, end, bullets: string[] }],",
    "  education: [{ school, degree, start, end }],",
    "  skills: [{ category, items: string[] }]",
  ].join("\n");

  const userPrompt = JSON.stringify(
    {
      locale: args.locale ?? "unknown",
      transcript: args.transcript,
      currentData: args.currentData,
    },
    null,
    2,
  );

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
    temperature: 0.2,
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

  try {
    const response = await withTimeout(
      args.client.chat.completions.create({
        ...request,
        response_format: { type: "json_object" },
      }),
      OPENAI_TIMEOUT_MS,
      "Voice command processing timed out.",
    );

    return {
      content: response.choices[0]?.message?.content ?? "",
      totalAiTokens: response.usage?.total_tokens ?? 0,
    };
  } catch (error) {
    if (!isResponseFormatCompatibilityError(error)) {
      throw error;
    }

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
