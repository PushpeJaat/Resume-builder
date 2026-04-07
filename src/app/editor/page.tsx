"use client";

import { Suspense } from "react";
import EditorLandingClient from "./EditorLandingClient";

export default function EditorLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="mx-auto max-w-7xl px-4 py-20 text-center text-white">Loading editor…</div>
        </div>
      }
    >
      <EditorLandingClient />
    </Suspense>
  );
}
