export type ApiEnvelope = {
  ok?: boolean;
  code?: unknown;
  error?: unknown;
  [key: string]: unknown;
};

export function readApiCode(payload: ApiEnvelope | null | undefined) {
  return typeof payload?.code === "string" ? payload.code : "";
}

export function resolveApiMessage(
  payload: ApiEnvelope | null | undefined,
  fallback: string,
  codeMessages: Record<string, string> = {},
) {
  const code = readApiCode(payload);

  if (code && codeMessages[code]) {
    return codeMessages[code];
  }

  if (typeof payload?.error === "string" && payload.error.trim().length > 0) {
    return payload.error;
  }

  return fallback;
}
