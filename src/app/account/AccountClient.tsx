"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type DownloadItem = {
  id: string;
  createdAt: string;
  templateId: string;
  resumeTitle: string;
  resumeId: string;
};

type Props = {
  email: string;
  name: string | null;
  plan: "FREE" | "PREMIUM";
  hasPassword: boolean;
  createdAt: string;
  downloads: DownloadItem[];
};

export function AccountClient({ email, name, plan, hasPassword, createdAt, downloads }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmitPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: currentPassword || undefined,
        newPassword,
      }),
    });

    const json = (await res.json().catch(() => null)) as { error?: string } | null;

    if (!res.ok) {
      setError(json?.error ?? "Could not update password.");
      setSubmitting(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSubmitting(false);
    setSuccess(hasPassword ? "Password changed successfully." : "Password set successfully.");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Profile</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Account settings</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your sign-in options, plan, and resume activity.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
            <p className="text-xs text-slate-500">Current plan</p>
            <p className="text-sm font-semibold text-slate-900">{plan === "PREMIUM" ? "Premium" : "Free"}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Email</p>
            <p className="mt-1 text-sm font-medium text-slate-900 break-all">{email}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Display name</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{name || "Not set"}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Member since</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{new Date(createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Open dashboard
          </Link>
          <Link
            href="/dashboard/templates"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse templates
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">{hasPassword ? "Change password" : "Set password"}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {hasPassword
              ? "Use your current password to choose a new one."
              : "Your account was created with OAuth. Set a password to enable email login as well."}
          </p>
        </div>

        <form onSubmit={onSubmitPassword} className="grid gap-4 sm:grid-cols-2">
          {hasPassword ? (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {error ? <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {success ? <p className="sm:col-span-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Saving..." : hasPassword ? "Change password" : "Set password"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Resume download history</h2>
          <p className="mt-1 text-sm text-slate-600">See your most recent PDF exports.</p>
        </div>

        {downloads.length === 0 ? (
          <p className="px-6 py-6 text-sm text-slate-500">No downloads yet. Export a resume to see history here.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {downloads.map((download) => (
              <li key={download.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">{download.resumeTitle}</p>
                  <p className="text-xs text-slate-500">
                    {download.templateId} | {new Date(download.createdAt).toLocaleString()}
                  </p>
                </div>
                <Link href={`/editor/${download.resumeId}`} className="text-sm font-semibold text-sky-700 hover:text-sky-900">
                  Open resume
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
