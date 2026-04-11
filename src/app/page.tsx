import Link from "next/link";
import {
  Bot,
  FileDown,
  LayoutTemplate,
  PencilRuler,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";
import Hero from "@/components/Hero";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: PencilRuler,
    title: "Easy Editor",
    description: "Edit every section with a guided builder that keeps your resume structured and clean.",
  },
  {
    icon: LayoutTemplate,
    title: "Professional Templates",
    description: "Choose from recruiter-friendly designs built for clarity, polish, and ATS compatibility.",
  },
  {
    icon: FileDown,
    title: "Instant PDF Download",
    description: "Export crisp, production-ready PDFs in seconds without formatting surprises.",
  },
  {
    icon: Bot,
    title: "AI Suggestions",
    description: "Refine summaries, improve bullet points, and write stronger resumes with AI guidance.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f8fafc_100%)] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <BrandMark />

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-950">
              Features
            </a>
            <Link href="/dashboard/templates" className="transition hover:text-slate-950">
              Templates
            </Link>
            <a href="#pricing" className="transition hover:text-slate-950">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="rounded-xl px-5 shadow-lg shadow-slate-950/10">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Hero />

        <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-700">
                Features
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything you need to ship a standout resume
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Designed like a modern SaaS product: fast workflows, clean UI, and thoughtful details that make job
                applications easier.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="rounded-[24px] border-slate-200/80 bg-white/90 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                    <CardHeader>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300/40">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="pt-2 text-lg">{feature.title}</CardTitle>
                      <CardDescription className="leading-7">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Card className="rounded-[32px] border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#111827_40%,#0ea5e9_120%)] text-white shadow-2xl shadow-slate-300/60">
              <CardContent className="px-8 py-12 text-center sm:px-12">
                <Badge className="rounded-full bg-white/10 px-3 py-1 text-white ring-1 ring-white/15">
                  Get started free
                </Badge>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Start building your resume today
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200">
                  Go from blank page to polished resume with AI support, premium-feeling templates, and fast export.
                </p>
                <div className="mt-8 flex justify-center">
                  <Button asChild size="lg" variant="secondary" className="rounded-2xl px-6 text-slate-950">
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">CVpilot</p>
            <p className="mt-1 text-sm text-slate-500">Modern resume building for fast-moving careers.</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-slate-500">
            <Link href="/contact-us" className="transition hover:text-slate-950">
              Contact Us
            </Link>
            <Link href="/terms-and-conditions" className="transition hover:text-slate-950">
              Terms &amp; Conditions
            </Link>
            <Link href="/refunds-cancellations" className="transition hover:text-slate-950">
              Refunds &amp; Cancellations
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
