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

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />

      {/* Background gradient */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-slate-300">
              Join thousands of professionals building polished resumes with confidence.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/95 border border-slate-800 shadow-2xl shadow-slate-950/40 rounded-3xl p-8 sm:p-10 backdrop-blur-xl">
            {/* Social Sign Up Options */}
            <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void signIn(
                  "google",
                  { callbackUrl: "/dashboard" },
                  { prompt: "select_account" },
                )}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => void router.push("/login")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition-colors duration-200"
              >
                Sign in instead
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-slate-950 text-slate-400">or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="rounded-2xl bg-rose-950/70 border border-rose-700 p-4">
                  <p className="text-sm font-medium text-rose-300">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                />
                <p className="mt-1.5 text-xs text-slate-500">At least 8 characters. Use uppercase, numbers, and symbols for security.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-slate-300 cursor-pointer">
                  I agree to the{" "}
                  <a href="#" className="font-semibold text-cyan-300 hover:text-cyan-200">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="font-semibold text-cyan-300 hover:text-cyan-200">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !agreeToTerms}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-sky-700 disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2 text-slate-950">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-slate-300">
            <div>
              <p className="text-lg font-semibold text-white">10K+</p>
              <p className="text-xs text-slate-400">Resumes Created</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">4.9★</p>
              <p className="text-xs text-slate-400">User Rating</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">99.9%</p>
              <p className="text-xs text-slate-400">Uptime</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
