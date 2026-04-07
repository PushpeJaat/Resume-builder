/**
 * Auth.js requires a stable secret for JWT/session.
 * - Use AUTH_SECRET (or NEXTAUTH_SECRET) when set.
 * - In development, or during `next build` (no secret in env), use a fixed
 *   fallback so the app compiles and local dev works without `.env`.
 * - Production runtime must set AUTH_SECRET (deploy will fail closed for
 *   real sessions if unset — set it in hosting env).
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (secret) return secret;

  const isDev = process.env.NODE_ENV !== "production";
  const isProdBuild = process.env.NEXT_PHASE === "phase-production-build";

  if (isDev || isProdBuild) {
    return "resume-studio-dev-only-secret-min-32-chars!";
  }

  throw new Error(
    "AUTH_SECRET is required in production. Add it to your environment (see env.example).",
  );
}