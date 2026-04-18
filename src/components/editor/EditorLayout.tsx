"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft, Eye, FilePenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditorLayoutProps = {
  editor: ReactNode;
  preview: ReactNode;
  className?: string;
};

export function EditorLayout({ editor, preview, className }: EditorLayoutProps) {
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");

  return (
    <div className={cn("min-h-0 flex-1", className)}>
      <div className="hidden h-full min-h-0 flex-1 gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(430px,46%)]">
        <section className="group/editor-panel flex h-full min-h-0 flex-col rounded-2xl border border-sky-200/80 bg-slate-50/85 shadow-[0_22px_70px_-50px_rgba(15,23,42,0.7)] backdrop-blur transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-[1px] hover:border-sky-300 hover:shadow-[0_30px_90px_-60px_rgba(15,23,42,0.8)]">
          <div className="flex items-center gap-2 border-b border-sky-100/90 px-3.5 py-2.5">
            <FilePenLine className="size-4 text-sky-700 transition-all duration-300 group-hover/editor-panel:scale-110" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Editor</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scroll-smooth">{editor}</div>
        </section>

        <aside className="min-h-0">
          <section className="group/preview-panel flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-emerald-200/85 bg-[linear-gradient(150deg,rgba(236,253,245,0.55)_0%,rgba(255,255,255,0.96)_45%,rgba(240,253,250,0.75)_100%)] shadow-[0_22px_70px_-54px_rgba(5,150,105,0.42)] lg:sticky lg:top-1">
            <div className="flex items-center gap-2 border-b border-emerald-100/90 px-3.5 py-2.5">
              <Eye className="size-4 text-emerald-700 transition-all duration-300 group-hover/preview-panel:scale-110" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Live Preview</p>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden p-2.5">{preview}</div>
          </section>
        </aside>
      </div>

      <div className="flex h-full min-h-0 lg:hidden">
        {mobileView === "editor" ? (
          <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-sky-300/85 bg-[linear-gradient(145deg,rgba(248,252,255,0.94)_0%,rgba(255,255,255,0.98)_58%,rgba(236,254,255,0.82)_100%)] shadow-[0_22px_52px_-38px_rgba(14,116,144,0.56)]">
            <div className="flex items-center gap-2 border-b border-sky-100/90 px-3.5 py-2.5">
              <FilePenLine className="size-4 text-sky-700" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Editor</p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">{editor}</div>

            <div className="border-t border-sky-100/90 bg-white/92 p-3">
              <Button
                type="button"
                onClick={() => setMobileView("preview")}
                className="h-11 w-full rounded-xl bg-slate-900 text-white shadow-[0_18px_36px_-26px_rgba(15,23,42,0.8)]"
              >
                <Eye className="size-4" />
                Live Preview
              </Button>
            </div>
          </section>
        ) : (
          <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-emerald-200/85 bg-[linear-gradient(150deg,rgba(236,253,245,0.8)_0%,rgba(255,255,255,0.98)_54%,rgba(236,254,255,0.82)_100%)] shadow-[0_22px_52px_-38px_rgba(5,150,105,0.48)]">
            <div className="flex items-center gap-2 border-b border-emerald-100/90 px-3.5 py-2.5">
              <Eye className="size-4 text-emerald-700" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Live Preview</p>
            </div>

            <div className="border-b border-emerald-100/90 bg-white/92 p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMobileView("editor")}
                className="h-11 w-full rounded-xl border-emerald-300 bg-emerald-50 text-emerald-900"
              >
                <ArrowLeft className="size-4" />
                Return to Editor
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">{preview}</div>
          </section>
        )}
      </div>
    </div>
  );
}
