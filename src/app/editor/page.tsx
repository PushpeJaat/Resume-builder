import { Suspense } from "react";
import EditorLandingClient from "./EditorLandingClient";

export default function EditorLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 text-slate-700">
          <div className="mx-auto max-w-7xl px-4 py-20 text-center">Loading editor...</div>
        </div>
      }
    >
      <EditorLandingClient />
    </Suspense>
  );
}
