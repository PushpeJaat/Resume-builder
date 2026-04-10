"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Intermediate page used after OAuth sign-in when a guest had a pending resume.
 * Reads pendingResume from sessionStorage, creates it via the API, then
 * redirects to the editor with ?autoDownload=1.
 */
export default function ResumeRestorePage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    async function restore() {
      try {
        const pendingStr = sessionStorage.getItem("pendingResume");
        if (pendingStr) {
          const pending = JSON.parse(pendingStr) as {
            templateId: string;
            data: unknown;
            title: string;
          };
          const res = await fetch("/api/resumes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pending),
          });
          if (res.ok) {
            const json = (await res.json()) as { id: string };
            sessionStorage.removeItem("pendingResume");
            router.replace(`/editor/${json.id}?autoDownload=1`);
            return;
          }
        }
      } catch {
        // fall through to dashboard
      }
      router.replace("/dashboard");
    }

    void restore();
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        <p className="text-sm font-medium text-slate-400">Preparing your resume&hellip;</p>
      </div>
    </div>
  );
}
