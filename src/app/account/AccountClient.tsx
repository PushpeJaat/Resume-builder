"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { getTemplateMeta } from "@/lib/templates/registry";
import { resolveApiMessage, type ApiEnvelope } from "@/lib/api-client";

type DownloadItem = {
  id: string;
  createdAt: string;
  templateId: string;
  resumeTitle: string;
  resumeId: string;
};

type ResumeItem = {
  id: string;
  title: string;
  templateId: string;
  updatedAt: string;
};

type Props = {
  email: string;
  name: string | null;
  plan: "FREE" | "PREMIUM";
  hasPassword: boolean;
  createdAt: string;
  downloads: DownloadItem[];
  resumes: ResumeItem[];
};

export function AccountClient({
  email,
  name,
  plan,
  hasPassword,
  createdAt,
  downloads,
  resumes,
}: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [resumeItems, setResumeItems] = useState<ResumeItem[]>(resumes);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>(downloads);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [creatingResume, setCreatingResume] = useState(false);
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);

  const refreshWorkspace = useCallback(async () => {
    setWorkspaceLoading(true);
    try {
      const [resumesRes, downloadsRes] = await Promise.all([
        fetch("/api/resumes", { cache: "no-store" }),
        fetch("/api/downloads", { cache: "no-store" }),
      ]);

      if (resumesRes.ok) {
        const json = (await resumesRes.json()) as { resumes: ResumeItem[] };
        setResumeItems(json.resumes ?? []);
      }

      if (downloadsRes.ok) {
        const json = (await downloadsRes.json()) as { downloads: DownloadItem[] };
        setDownloadItems(json.downloads ?? []);
      }
    } finally {
      setWorkspaceLoading(false);
    }
  }, []);

  async function createResume() {
    setCreatingResume(true);
    try {
      const res = await fetch("/api/resumes", { method: "POST" });
      if (!res.ok) return;
      const { id } = (await res.json()) as { id: string };
      window.location.href = `/editor/${id}`;
    } finally {
      setCreatingResume(false);
    }
  }

  async function deleteResume(id: string) {
    if (!confirm("Delete this resume?")) return;
    setDeletingResumeId(id);
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        await refreshWorkspace();
      }
    } finally {
      setDeletingResumeId(null);
    }
  }

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

    const json = (await res.json().catch(() => null)) as ApiEnvelope | null;

    if (!res.ok) {
      setError(
        resolveApiMessage(json, "Could not update password.", {
          UNAUTHORIZED: "Your session expired. Please sign in again.",
          VALIDATION_ERROR: "Please enter a password with at least 8 characters.",
          NOT_FOUND: "Account not found. Sign out and sign in again.",
          INTERNAL_ERROR: "Password update is temporarily unavailable. Please try again.",
        }),
      );
      setSubmitting(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSubmitting(false);
    setSuccess(hasPassword ? "Password changed successfully." : "Password set successfully.");
  }

  const recentActivityLabel = useMemo(() => {
    if (resumeItems.length === 0) return "No edits yet";
    const latest = resumeItems
      .map((resume) => new Date(resume.updatedAt).getTime())
      .sort((a, b) => b - a)[0];
    return new Date(latest).toLocaleDateString();
  }, [resumeItems]);

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Profile</p>
            <h1 className="mt-2 text-2xl font-bold text-white">Account settings</h1>
            <p className="mt-1 text-sm text-slate-300">Manage your sign-in options, documents, and resume activity.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-right">
            <p className="text-xs text-slate-400">Workspace access</p>
            <p className="text-sm font-semibold text-white">{plan === "PREMIUM" ? "Full access" : "Free access"}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-slate-400">Email</p>
            <p className="mt-1 break-all text-sm font-medium text-white">{email}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-slate-400">Display name</p>
            <p className="mt-1 text-sm font-medium text-white">{name || "Not set"}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-slate-400">Member since</p>
            <p className="mt-1 text-sm font-medium text-white">{new Date(createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Total resumes</p>
            <p className="mt-1 text-2xl font-bold text-white">{resumeItems.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">PDF downloads</p>
            <p className="mt-1 text-2xl font-bold text-white">{downloadItems.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Recent activity</p>
            <p className="mt-1 text-2xl font-bold text-white">{recentActivityLabel}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void createResume()}
            disabled={creatingResume}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {creatingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {creatingResume ? "Creating..." : "Create new resume"}
          </button>
          <Link
            href="/dashboard/templates"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
          >
            Browse templates
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Log out
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Your documents</h2>
          <p className="mt-1 text-sm text-slate-300">Open, edit, or delete resumes from your profile workspace.</p>
        </div>

        {workspaceLoading && resumeItems.length === 0 ? (
          <div className="space-y-3 p-6">
            <div className="h-14 animate-pulse rounded-xl bg-white/10" />
            <div className="h-14 animate-pulse rounded-xl bg-white/10" />
            <div className="h-14 animate-pulse rounded-xl bg-white/10" />
          </div>
        ) : resumeItems.length === 0 ? (
          <div className="p-6">
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
              <h3 className="text-lg font-semibold text-white">No resumes yet</h3>
              <p className="mt-2 text-sm text-slate-400">Start with a blank resume or pick a template to create your first document.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => void createResume()}
                  disabled={creatingResume}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creatingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {creatingResume ? "Creating..." : "Create your first resume"}
                </button>
                <Link
                  href="/dashboard/templates"
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                >
                  Browse templates
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {resumeItems.map((resume) => (
              <li key={resume.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link href={`/editor/${resume.id}`} className="text-base font-semibold text-white transition hover:text-sky-300">
                      {resume.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-400">
                      {getTemplateMeta(resume.templateId)?.name ?? resume.templateId} | Updated {new Date(resume.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/editor/${resume.id}`}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => void deleteResume(resume.id)}
                      disabled={deletingResumeId === resume.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingResumeId === resume.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      {deletingResumeId === resume.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">{hasPassword ? "Change password" : "Set password"}</h2>
          <p className="mt-1 text-sm text-slate-300">
            {hasPassword
              ? "Use your current password to choose a new one."
              : "Your account was created with OAuth. Set a password to enable email login as well."}
          </p>
        </div>

        <form onSubmit={onSubmitPassword} className="grid gap-4 sm:grid-cols-2">
          {hasPassword ? (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-200">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                required
              />
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>

          {error ? <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {success ? <p className="sm:col-span-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : hasPassword ? (
                "Change password"
              ) : (
                "Set password"
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Resume download history</h2>
              <p className="mt-1 text-sm text-slate-300">See your most recent PDF exports.</p>
            </div>
            <button
              type="button"
              onClick={() => void refreshWorkspace()}
              disabled={workspaceLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {workspaceLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {workspaceLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {downloadItems.length === 0 ? (
          <p className="px-6 py-6 text-sm text-slate-400">No downloads yet. Export a resume to see history here.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {downloadItems.map((download) => (
              <li key={download.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-white">{download.resumeTitle}</p>
                  <p className="text-xs text-slate-400">
                    {download.templateId} | {new Date(download.createdAt).toLocaleString()}
                  </p>
                </div>
                <Link href={`/editor/${download.resumeId}`} className="text-sm font-semibold text-sky-300 transition hover:text-sky-200">
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
