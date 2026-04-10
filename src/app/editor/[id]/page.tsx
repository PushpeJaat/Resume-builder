import { Suspense } from "react";
import { EditorClient } from "./EditorClient";

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <EditorClient resumeId={id} />
    </Suspense>
  );
}
