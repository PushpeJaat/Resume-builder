import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function ResumeScorePage() {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setScore(null);
    setFeedback("");
    const formData = new FormData();
    formData.append("resume", file);
    const res = await fetch("/api/resume-score", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setScore(data.score);
    setFeedback(data.feedback);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader theme="light" />
      <main className="mx-auto max-w-xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <Badge variant="outline" className="rounded-full border-indigo-200 bg-white px-3 py-1 text-indigo-700">
            Resume Score
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Get Your Resume Score</h1>
          <p className="mt-2 text-base text-slate-600">Upload your resume to receive an instant score and actionable feedback.</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFile}
            className="mb-4 block w-full rounded border border-slate-200 px-4 py-2 text-sm"
            disabled={loading}
          />
          {loading && <div className="text-center text-indigo-600">Scoring your resume...</div>}
          {score !== null && (
            <div className="mt-6 text-center">
              <div className="text-5xl font-bold text-indigo-700">{score}%</div>
              <div className="mt-2 text-base text-slate-700">{feedback}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
