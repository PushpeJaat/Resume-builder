"use client";

import type { ReactNode } from "react";
import { Eye, FilePenLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type EditorLayoutProps = {
  editor: ReactNode;
  preview: ReactNode;
  className?: string;
};

export function EditorLayout({ editor, preview, className }: EditorLayoutProps) {
  return (
    <div className={cn("min-h-0 flex-1", className)}>
      <div className="hidden h-full min-h-0 flex-1 gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(430px,46%)]">
        <section className="group/editor-panel min-h-0 rounded-2xl border border-slate-200/80 bg-white/85 shadow-[0_22px_70px_-50px_rgba(15,23,42,0.7)] backdrop-blur transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_30px_90px_-60px_rgba(15,23,42,0.8)]">
          <div className="flex items-center gap-2 border-b border-slate-200/80 px-4 py-3.5">
            <FilePenLine className="size-4 text-slate-500 transition-all duration-300 group-hover/editor-panel:scale-110 group-hover/editor-panel:text-slate-700" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Editor</p>
          </div>
          <div className="h-[calc(100%-53px)] overflow-y-auto p-4 scroll-smooth">{editor}</div>
        </section>

        <aside className="min-h-0">
          <div className="h-full lg:sticky lg:top-1">{preview}</div>
        </aside>
      </div>

      <div className="flex h-full min-h-0 lg:hidden">
        <Tabs defaultValue="editor" className="flex min-h-0 flex-1">
          <TabsList className="w-full justify-start rounded-xl border border-slate-200 bg-slate-100/85 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            <TabsTrigger value="editor" className="min-h-11 px-4 text-[13px] font-semibold text-slate-600 transition-all duration-200 data-[state=active]:-translate-y-[1px] data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <FilePenLine className="size-3.5" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="min-h-11 px-4 text-[13px] font-semibold text-slate-600 transition-all duration-200 data-[state=active]:-translate-y-[1px] data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <Eye className="size-3.5" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="editor"
            className="mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_50px_-40px_rgba(15,23,42,0.65)] data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
          >
            <div className="h-full overflow-y-auto p-4">{editor}</div>
          </TabsContent>

          <TabsContent value="preview" className="mt-3 min-h-0 flex-1 overflow-hidden data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1">
            {preview}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
