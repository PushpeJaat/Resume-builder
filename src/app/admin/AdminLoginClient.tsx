"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { Loader2, ShieldCheck } from "lucide-react";

type Props = {
  callbackUrl: string;
  showForbiddenMessage: boolean;
  signedInAsNonAdmin: boolean;
};

export function AdminLoginClient({
  callbackUrl,
  showForbiddenMessage,
  signedInAsNonAdmin,
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (response?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl || "/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_0%_0%,rgba(8,145,178,0.22),transparent_58%),radial-gradient(1200px_circle_at_100%_0%,rgba(56,189,248,0.2),transparent_60%),linear-gradient(180deg,#020617_0%,#0f172a_42%,#0b1120_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <div className="grid w-full gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-cyan-200/20 bg-gradient-to-br from-cyan-500/10 via-sky-500/8 to-transparent p-8 shadow-2xl shadow-cyan-900/20 sm:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Console
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">CVpilot Control Center</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
              Manage users, subscriptions, payment orders, extracted resumes, and blog publishing from one secure admin workspace.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Access Scope</p>
                <p className="mt-2 text-sm font-semibold text-white">Users, resumes, payments, blogs</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Security</p>
                <p className="mt-2 text-sm font-semibold text-white">Email allowlist via ADMIN_EMAILS</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Admin sign in</h2>
            <p className="mt-2 text-sm text-slate-300">Use an account listed in ADMIN_EMAILS or ADMIN_EMAIL.</p>

            {showForbiddenMessage ? (
              <p className="mt-4 rounded-xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                This account is signed in but is not allowed to access admin routes.
              </p>
            ) : null}

            {signedInAsNonAdmin ? (
              <div className="mt-4 rounded-xl border border-white/15 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-300">Signed in with a non-admin account.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void signOut({ callbackUrl: "/admin" })}
                    className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
                  >
                    Sign out and retry
                  </button>
                  <Link
                    href="/account"
                    className="rounded-lg border border-cyan-300/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                  >
                    Go to user profile
                  </Link>
                </div>
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {error ? <p className="rounded-xl border border-red-300/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p> : null}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@cvpilot.info"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in as admin"
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => void signIn("google", { callbackUrl: callbackUrl || "/admin/dashboard" }, { prompt: "select_account" })}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Continue with Google
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
