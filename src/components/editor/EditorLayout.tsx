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
        <section className="group/editor-panel flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/80 bg-slate-50/85 shadow-[0_22px_70px_-50px_rgba(15,23,42,0.7)] backdrop-blur transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_30px_90px_-60px_rgba(15,23,42,0.8)]">
          <div className="flex items-center gap-2 border-b border-slate-200/80 px-3.5 py-2.5">
            <FilePenLine className="size-4 text-slate-500 transition-all duration-300 group-hover/editor-panel:scale-110 group-hover/editor-panel:text-slate-700" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Editor</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scroll-smooth">{editor}</div>
        </section>

        <aside className="min-h-0">
          <div className="h-full lg:sticky lg:top-1">{preview}</div>
        </aside>
      </div>

      <div className="flex h-full min-h-0 lg:hidden">
        {mobileView === "editor" ? (
          <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-sky-200/80 bg-[linear-gradient(145deg,rgba(248,252,255,0.94)_0%,rgba(255,255,255,0.98)_58%,rgba(236,254,255,0.82)_100%)] shadow-[0_22px_52px_-38px_rgba(14,116,144,0.56)]">
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
          <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-sky-200/80 bg-[linear-gradient(150deg,rgba(239,246,255,0.88)_0%,rgba(255,255,255,0.98)_54%,rgba(236,254,255,0.82)_100%)] shadow-[0_22px_52px_-38px_rgba(14,116,144,0.56)]">
            <div className="flex items-center gap-2 border-b border-sky-100/90 px-3.5 py-2.5">
              <Eye className="size-4 text-sky-700" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Live Preview</p>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">{preview}</div>

            <div className="border-t border-sky-100/90 bg-white/92 p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMobileView("editor")}
                className="h-11 w-full rounded-xl border-sky-300 bg-sky-50 text-sky-900"
              >
                <ArrowLeft className="size-4" />
                Return to Editor
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
