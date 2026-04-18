import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroResumeImage from "@/HeroResume/Professional Modern CV Resume.jpg";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.28),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(139,92,246,0.24),transparent_26%),radial-gradient(circle_at_50%_78%,rgba(56,189,248,0.16),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,1))]" />
        <div className="hero-orb hero-float-delay-1 absolute left-[-6rem] top-12 h-64 w-64 bg-indigo-300/70 blur-3xl" />
        <div className="hero-orb hero-float-delay-3 absolute right-[-4rem] top-20 h-80 w-80 bg-violet-300/70 blur-3xl" />
        <div className="hero-orb hero-float-delay-2 absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 bg-sky-200/70 blur-3xl" />
        <div className="hero-ring hero-float-delay-4 absolute left-[7%] top-20 hidden h-44 w-44 lg:block" />
        <div className="hero-ring hero-float-delay-2 absolute right-[12%] top-44 hidden h-32 w-32 lg:block" />
        <div className="hero-ring hero-float-delay-1 absolute left-[30%] bottom-12 hidden h-24 w-24 md:block" />
        <div className="hero-dot hero-dot-delay-1 absolute left-[10%] top-24" />
        <div className="hero-dot hero-dot-delay-2 absolute left-[22%] top-40 hidden sm:block" />
        <div className="hero-dot hero-dot-delay-3 absolute left-[18%] bottom-16 hidden lg:block" />
        <div className="hero-dot hero-dot-delay-4 absolute right-[14%] top-24" />
        <div className="hero-dot hero-dot-delay-2 absolute right-[22%] top-56 hidden md:block" />
        <div className="hero-dot hero-dot-delay-3 absolute right-[30%] bottom-20 hidden lg:block" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] lg:gap-8">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <Badge
            variant="secondary"
            className="inline-flex h-auto rounded-full border border-indigo-100 bg-white/90 px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur"
          >
            <Sparkles className="size-3.5" />
            New Feature
          </Badge>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl lg:leading-[1.02]">
            Build a resume that{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              gets you hired.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9 lg:mx-0">
            CVpilot pairs recruiter-friendly templates with AI-guided writing so you can turn raw experience into a
            polished, interview-ready resume without fighting formatting.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-full bg-slate-950 px-7 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(15,23,42,0.7)] transition-transform hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Link href="/dashboard/templates">
                Build your resume
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-full border-slate-300 bg-white/85 px-7 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition-transform hover:-translate-y-0.5 hover:bg-white"
            >
              <Link href="/resume-score">Get your resume score</Link>
            </Button>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-center lg:pr-10 xl:pr-14">
          <div className="hero-float absolute inset-x-0 top-8 h-[88%] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.58)_0%,rgba(167,139,250,0.34)_38%,rgba(56,189,248,0.18)_56%,rgba(255,255,255,0)_78%)] blur-3xl" />
          <div className="hero-float hero-float-delay-1 absolute -right-3 top-8 hidden h-28 w-28 rounded-full border border-white/90 bg-white/70 blur-sm lg:block" />
          <div className="hero-orb hero-float-delay-4 absolute -left-12 top-1/3 hidden h-28 w-28 bg-cyan-300/70 blur-2xl lg:block" />
          <div className="hero-orb hero-float-delay-2 absolute right-10 bottom-8 hidden h-24 w-24 bg-indigo-300/65 blur-2xl lg:block" />
          <div className="hero-ring hero-float-delay-3 absolute -left-6 top-16 hidden h-36 w-36 lg:block" />
          <div className="hero-dot hero-dot-delay-1 absolute left-4 top-20 hidden lg:block" />
          <div className="hero-dot hero-dot-delay-4 absolute right-4 bottom-16 hidden lg:block" />

          <div className="relative w-full max-w-[20rem] sm:max-w-[21.5rem] lg:max-w-[22rem]">
            <div className="absolute inset-0 translate-x-3 translate-y-4 rounded-[2rem] bg-gradient-to-br from-indigo-400/70 via-white/25 to-violet-400/70 blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-2.5 shadow-[0_42px_90px_-34px_rgba(79,70,229,0.6)] backdrop-blur-xl">
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,1))] p-1.5 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.5)]">
                <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-lg shadow-slate-300/50">
                  <Image
                    src={heroResumeImage}
                    alt="Blue Simple Professional CV Resume template preview"
                    priority
                    className="h-auto w-full rotate-[-2deg] scale-[1.01] transform object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="absolute -left-10 bottom-8 hidden rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-lg shadow-indigo-200/70 backdrop-blur lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Resume score</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">94%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}