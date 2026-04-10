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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f8fafc_100%)] text-slate-950">
      <SiteHeader theme="light" />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[-6rem] top-12 h-64 w-64 rounded-full bg-indigo-300/70 blur-3xl" />
        <div className="absolute right-[-4rem] top-20 h-80 w-80 rounded-full bg-violet-300/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-200/70 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-8">
          <section className="hidden rounded-[2rem] border border-indigo-100 bg-[linear-gradient(160deg,rgba(238,242,255,0.97)_0%,rgba(224,231,255,0.97)_48%,rgba(219,234,254,0.97)_100%)] p-8 text-slate-900 shadow-xl shadow-indigo-100/60 lg:block">
            <p className="inline-flex rounded-full border border-sky-300/40 bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Welcome back
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-slate-900">Sign in and keep building resumes that get interviews.</h1>
            <p className="mt-4 max-w-lg text-base leading-8 text-slate-600">
              Jump back into your workspace, refine your resume with AI help, and export polished PDFs without losing momentum.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-indigo-100 bg-white/80 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">Aarav Mehta</p>
                  <p className="mt-1 text-sm text-indigo-600">Senior Software Engineer</p>
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Ready to export
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                  <p className="text-xl font-semibold text-slate-900">10K+</p>
                  <p className="mt-1 text-xs text-slate-600">Resumes built</p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                  <p className="text-xl font-semibold text-slate-900">4.9/5</p>
                  <p className="mt-1 text-xs text-slate-600">User rating</p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                  <p className="text-xl font-semibold text-slate-900">99.9%</p>
                  <p className="mt-1 text-xs text-slate-600">Export success</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/60 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Resume history synced across sessions
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/60 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                One-click PDF export and template switching
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/60 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                AI suggestions for summaries and bullet points
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-indigo-100/50 backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">Access your dashboard, saved resumes, and export history.</p>
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
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
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Create account
              </Link>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs uppercase tracking-wider text-slate-400">or email</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {error ? <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-500">
              New to CVpilot?{" "}
              <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Create your account
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
