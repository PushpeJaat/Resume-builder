"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ResumeEditor } from "@/components/editor/ResumeEditor";
import { ResumePreviewFrame } from "@/components/editor/ResumePreviewFrame";
import { TEMPLATES, getTemplateMeta, DEFAULT_TEMPLATE_ID } from "@/lib/templates/registry";
import { emptyResumeData, type ResumeData } from "@/types/resume";

export default function EditorLandingClient() {
  const searchParams = useSearchParams();
  const rawTemplate = searchParams.get("template") ?? DEFAULT_TEMPLATE_ID;
  const initialTemplate = getTemplateMeta(rawTemplate) ? rawTemplate : DEFAULT_TEMPLATE_ID;
  const [templateId, setTemplateId] = useState(initialTemplate);
  const [data, setData] = useState<ResumeData>(emptyResumeData());
  const { data: session } = useSession();
  const plan = session?.user?.plan ?? "FREE";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />
      <main className="relative isolate overflow-hidden py-8 sm:py-10 lg:py-12">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-slate-900 via-slate-950 to-transparent opacity-90" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center">
              <div className="max-w-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400/90">Live editor preview</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Open the resume editor instantly.
                </h1>
                <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
                  Try any template in a live editor without being forced to sign up first. Edit content, preview formatting and then sign in to save and export your resume.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() =>
                      void signIn(
                        "google",
                        { callbackUrl: "/dashboard" },
                        { prompt: "select_account" },
                      )
                    }
                    className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
                  >
                    Sign in with Google
                  </button>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
                  >
                    Create an account
                  </Link>
                </div>
                <div className="mt-6 space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 text-sm leading-6 text-slate-400">
                  <p>
                    Use the editor now and explore resume sections live. When you sign in, your work can be saved, downloaded as PDF, and accessed from your dashboard.
                  </p>
                  <p className="text-slate-300">
                    Selected template: <span className="font-semibold text-white">{getTemplateMeta(templateId)?.name ?? "Resume"}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/40">
                <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Preview tip</p>
                    <p className="mt-1 text-sm text-slate-300">The layout updates instantly as you edit the fields.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-800 px-3 py-2 text-xs text-slate-400">Live demo</div>
                </div>
                <div className="mt-6 grid gap-3 text-sm text-slate-400">
                  <p>Free access to template previews and editor flow.</p>
                  <p>When you’re ready, sign in to keep your work and export to PDF.</p>
                  <p>{session ? "Signed in — you can save your resume after login." : "Not signed in yet — sign in to save and export."}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
            <aside className="space-y-6 rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/90">Template starter</p>
                <h2 className="text-2xl font-semibold text-white">Template selection</h2>
                <p className="text-sm leading-6 text-slate-400">
                  Switch templates while you edit. Premium designs are available for preview and are gated only for PDF export.
                </p>
              </div>

              <div className="grid gap-3">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setTemplateId(template.id)}
                    className={`rounded-3xl border px-4 py-4 text-left transition ${
                      templateId === template.id
                        ? "border-cyan-400 bg-slate-900/90 text-white shadow-inner shadow-cyan-500/10"
                        : "border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{template.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{template.description}</p>
                      </div>
                      {template.premium ? (
                        <span className="rounded-full bg-violet-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white">
                          Pro
                        </span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <section className="space-y-6">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Live editor</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Edit resume fields instantly</h2>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-400">
                    {session ? "Signed in as " : "Preview mode"}
                    <span className="font-semibold text-white">{session?.user?.email ? ` ${session.user.email}` : " guest"}</span>
                  </div>
                </div>

                <ResumeEditor
                  data={data}
                  onChange={setData}
                  templateId={templateId}
                  onTemplateId={setTemplateId}
                  userPlan={plan}
                  onPremiumIntent={() => {}}
                />
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/40">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Live preview</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Resume output</h2>
                  </div>
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                  >
                    Dashboard
                  </Link>
                </div>
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-white text-slate-950">
                  <ResumePreviewFrame templateId={templateId} data={data} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
