"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms of service.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(typeof json.error === "string" ? json.error : "Could not create account.");
      return;
    }

    const sign = await signIn("credentials", { email, password, redirect: false });
    if (sign?.error) {
      setError("Account created but sign-in failed. Try logging in.");
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

    router.push("/dashboard");
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
            <p className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Get started free
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-slate-900">Create your account and start building resumes that stand out.</h1>
            <p className="mt-4 max-w-lg text-base leading-8 text-slate-600">
              Save your work, access your resume library anywhere, and ship polished applications with less friction.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-indigo-100 bg-white/80 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">Your workspace</p>
                  <p className="mt-1 text-sm text-indigo-600">Ready in under 2 minutes</p>
                </div>
                <div className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  No credit card
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                  <p className="text-xl font-semibold text-slate-900">Unlimited</p>
                  <p className="mt-1 text-xs text-slate-600">Resume drafts</p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                  <p className="text-xl font-semibold text-slate-900">Live</p>
                  <p className="mt-1 text-xs text-slate-600">Preview editing</p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                  <p className="text-xl font-semibold text-slate-900">PDF</p>
                  <p className="mt-1 text-xs text-slate-600">Export ready</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/60 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Create unlimited resumes and iterate quickly
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/60 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Save progress and access your work from any device
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/60 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Use modern templates with export-ready formatting
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-indigo-100/50 backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Create account</h2>
              <p className="mt-1 text-sm text-slate-500">Save your resumes and continue from any device.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  let target = "/dashboard/templates";
                  try {
                    if (sessionStorage.getItem("pendingResume")) target = "/editor/resume-restore";
                  } catch { /* ignore */ }
                  void signIn("google", { callbackUrl: target }, { prompt: "select_account" });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Sign in instead
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
                <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                />
              </div>

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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Confirm</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  />
                </div>
              </div>

              <label htmlFor="terms" className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 bg-white text-indigo-600"
                />
                <span>
                  I agree to the terms and privacy policy. By creating an account, I can access resume history and account settings.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !agreeToTerms}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-500">
              Already registered?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
