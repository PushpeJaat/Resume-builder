"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ResumePreview } from "@/components/ResumePreview";
import type { ResumeLayout } from "@/shared/layoutSchema";

interface TemplatePreviewClientProps {
  templateId: string;
  html?: string;
  layout?: ResumeLayout | null;
}

/** Pixel-perfect A4 iframe scaled to fill its container via ResizeObserver. */
function ScaledIframe({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.75);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 794);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden" style={{ aspectRatio: "210 / 297" }}>
      <div
        className="pointer-events-none absolute left-0 top-0"
        style={{ width: 794, height: 1122, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <iframe
          title="Resume preview"
          srcDoc={html}
          style={{ width: 794, height: 1122, border: "none", display: "block" }}
          sandbox="allow-same-origin"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

function ScaledLayoutPreview({ layout }: { layout: ResumeLayout }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.75);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / layout.page.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout.page.width]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${layout.page.width} / ${layout.page.height}` }}
    >
      <div className="pointer-events-none absolute left-0 top-0">
        <ResumePreview layout={layout} scale={scale} maxPages={1} />
      </div>
    </div>
  );
}

export function TemplatePreviewClient({
  templateId,
  html,
  layout,
}: TemplatePreviewClientProps) {
  return (
    <>
      {/* Live preview iframe */}
      {layout ? <ScaledLayoutPreview layout={layout} /> : <ScaledIframe html={html ?? ""} />}

      {/* CTA button */}
      <div className="mt-4">
        <Link
          href={`/editor?template=${templateId}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-600/25 transition-all duration-300 hover:brightness-105 sm:py-2.5"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit &amp; Create Resume
        </Link>
      </div>
    </>
  );
}

