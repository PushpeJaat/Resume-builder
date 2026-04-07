"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { TemplatesSection } from "@/components/TemplatesSection";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="pt-14">
        <TemplatesSection />
      </main>
    </div>
  );
}