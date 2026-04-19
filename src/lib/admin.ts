export function getAdminEmails(env: NodeJS.ProcessEnv = process.env): Set<string> {
  const raw = `${env.ADMIN_EMAILS ?? ""},${env.ADMIN_EMAIL ?? ""}`;

  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0),
  );
}

export function isAdminEmail(email?: string | null, env: NodeJS.ProcessEnv = process.env): boolean {
  if (!email) {
    return false;
  }

  const adminEmails = getAdminEmails(env);
  return adminEmails.size > 0 && adminEmails.has(email.trim().toLowerCase());
}
