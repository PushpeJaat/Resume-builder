"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    // Restore a pending guest resume if one was saved before auth
    try {
      const pendingStr = sessionStorage.getItem("pendingResume");
      if (pendingStr) {
        const pending = JSON.parse(pendingStr) as { templateId: string; data: unknown; title: string };
        const createRes = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pending),
        });
        if (createRes.ok) {
          const json = (await createRes.json()) as { id: string };
          sessionStorage.removeItem("pendingResume");
          router.push(`/editor/${json.id}?autoDownload=1`);
          router.refresh();
          return;
        }
      }
    } catch {
      // fall through to normal redirect
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <SiteHeader theme="dark" />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(45,212,191,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(30,41,59,0.85),transparent_42%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.15),rgba(2,6,23,0.85))]" />
        <div className="absolute left-[8%] top-28 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute right-[10%] top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-8">
          <section className="hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(15,23,42,0.94)_0%,rgba(17,24,39,0.94)_48%,rgba(8,47,73,0.94)_100%)] p-8 text-white shadow-2xl shadow-black/25 lg:block">
            <p className="inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-100">
              Welcome back
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight">Sign in and keep building resumes that get interviews.</h1>
            <p className="mt-4 max-w-lg text-base leading-8 text-slate-300">
              Jump back into your workspace, refine your resume with AI help, and export polished PDFs without losing momentum.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">Aarav Mehta</p>
                  <p className="mt-1 text-sm text-sky-200">Senior Software Engineer</p>
                </div>
                <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Ready to export
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xl font-semibold">10K+</p>
                  <p className="mt-1 text-xs text-slate-300">Resumes built</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xl font-semibold">4.9/5</p>
                  <p className="mt-1 text-xs text-slate-300">User rating</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xl font-semibold">99.9%</p>
                  <p className="mt-1 text-xs text-slate-300">Export success</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                Resume history synced across sessions
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                One-click PDF export and template switching
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                AI suggestions for summaries and bullet points
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-semibold tracking-tight text-white">Sign in</h2>
              <p className="mt-1 text-sm text-slate-400">Access your dashboard, saved resumes, and export history.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  let target = callbackUrl;
                  try {
                    if (sessionStorage.getItem("pendingResume")) target = "/editor/resume-restore";
                  } catch { /* ignore */ }
                  void signIn("google", { callbackUrl: target }, { prompt: "select_account" });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/8"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/8"
              >
                Create account
              </Link>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-wider text-slate-500">or email</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-400">
              New to CVpilot?{" "}
              <Link href="/signup" className="font-semibold text-sky-300 hover:text-sky-200">
                Create your account
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
