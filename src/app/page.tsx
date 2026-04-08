import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileDown,
  LayoutTemplate,
  PencilRuler,
  Sparkles,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const templates = [
  { name: "Minimal Clean", accent: "from-slate-900 to-slate-700", premium: false },
  { name: "Modern Professional", accent: "from-sky-600 to-cyan-500", premium: true },
  { name: "Executive Portrait", accent: "from-emerald-600 to-teal-500", premium: false },
  { name: "Creative Designer", accent: "from-fuchsia-600 to-rose-500", premium: true },
  { name: "Profile Edge", accent: "from-indigo-600 to-violet-500", premium: true },
  { name: "Classic ATS", accent: "from-amber-500 to-orange-500", premium: false },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f8fafc_100%)] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">CVpilot</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-950">
              Features
            </a>
            <a href="#templates" className="transition hover:text-slate-950">
              Templates
            </a>
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
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-0 top-10 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
            <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-slate-200/60 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Badge variant="outline" className="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
                AI-powered resume builder for modern job seekers
              </Badge>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-6xl">
                Build Your Professional Resume in Minutes
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Create polished resumes fast with AI-powered writing help, a frictionless editor, and modern templates
                designed to look sharp on screen and in PDF.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-2xl px-6">
                  <Link href="/editor">
                    Create Resume
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-2xl px-6">
                  <Link href="#templates">View Templates</Link>
                </Button>
              </div>
              <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
                {[
                  { label: "Resumes created", value: "25K+" },
                  { label: "Average build time", value: "8 min" },
                  { label: "Template styles", value: "12+" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <p className="text-2xl font-semibold text-slate-950">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-10 hidden h-32 w-32 rounded-full bg-sky-300/30 blur-2xl lg:block" />
              <div className="absolute -right-6 bottom-6 hidden h-36 w-36 rounded-full bg-cyan-300/30 blur-2xl lg:block" />

              <Card className="relative overflow-hidden rounded-[28px] border-white/70 bg-white/85 shadow-2xl shadow-slate-200/70 backdrop-blur">
                <CardHeader className="border-b border-slate-100 pb-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-semibold">Resume Preview</CardTitle>
                      <CardDescription>Live, ATS-friendly formatting with AI-assisted writing.</CardDescription>
                    </div>
                    <Badge className="rounded-full px-3">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start gap-4 border-b border-slate-200 pb-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-40 rounded-full bg-slate-900" />
                        <div className="h-3 w-56 rounded-full bg-slate-300" />
                        <div className="flex flex-wrap gap-2 pt-1">
                          {["Product Designer", "San Francisco", "janedoe.dev"].map((item) => (
                            <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-5">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-sky-500" />
                          <div className="h-3 w-24 rounded-full bg-slate-800" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-2.5 w-full rounded-full bg-slate-200" />
                          <div className="h-2.5 w-11/12 rounded-full bg-slate-200" />
                          <div className="h-2.5 w-9/12 rounded-full bg-slate-200" />
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-cyan-500" />
                          <div className="h-3 w-28 rounded-full bg-slate-800" />
                        </div>
                        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                          <div className="h-3 w-40 rounded-full bg-slate-900" />
                          <div className="mt-2 h-2.5 w-28 rounded-full bg-slate-300" />
                          <div className="mt-3 space-y-2">
                            <div className="h-2.5 w-full rounded-full bg-slate-200" />
                            <div className="h-2.5 w-10/12 rounded-full bg-slate-200" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                          <div className="h-3 w-24 rounded-full bg-slate-900" />
                          <div className="mt-3 flex flex-wrap gap-2">
                            {["Figma", "Notion", "UX"].map((item) => (
                              <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-slate-950 p-4 text-white">
                          <p className="text-xs uppercase tracking-[0.22em] text-sky-200">AI Tip</p>
                          <p className="mt-2 text-sm leading-6 text-slate-200">
                            Stronger verb detected. Replaced “worked on” with “led”.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t border-slate-100 bg-white/70">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Export-ready layout
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl">
                    <Link href="/editor">Open Editor</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

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

        <section id="templates" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <Badge variant="outline" className="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
                  Templates
                </Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Modern layouts for every role</h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Browse polished template directions inspired by modern SaaS products and premium resume builders.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/dashboard/templates">See all templates</Link>
              </Button>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template, index) => (
                <Card key={template.name} className="overflow-hidden rounded-[26px] border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                  <CardContent className="p-0">
                    <div className={`relative h-72 overflow-hidden bg-gradient-to-br ${template.accent} p-5`}>
                      {template.premium ? (
                        <Badge className="absolute right-4 top-4 rounded-full bg-white/90 px-3 text-slate-950 shadow-sm">
                          <Star className="h-3 w-3 fill-current" />
                          Premium
                        </Badge>
                      ) : null}
                      <div className="mx-auto h-full max-w-[280px] rounded-[22px] bg-white/95 p-4 shadow-2xl shadow-slate-950/20">
                        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                          <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-28 rounded-full bg-slate-900" />
                            <div className="h-2.5 w-16 rounded-full bg-slate-300" />
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-[0.38fr_1fr] gap-3">
                          <div className="space-y-2">
                            <div className="h-2.5 w-full rounded-full bg-slate-200" />
                            <div className="h-2.5 w-5/6 rounded-full bg-slate-200" />
                            <div className="h-16 rounded-2xl bg-slate-100" />
                          </div>
                          <div className="space-y-2">
                            <div className="h-2.5 w-full rounded-full bg-slate-200" />
                            <div className="h-2.5 w-full rounded-full bg-slate-200" />
                            <div className="h-2.5 w-10/12 rounded-full bg-slate-200" />
                            <div className="mt-3 h-14 rounded-2xl bg-slate-100" />
                            <div className="h-14 rounded-2xl bg-slate-100" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur">
                        0{index + 1}
                      </div>
                    </div>
                  </CardContent>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>
                      Built for clarity, readable hierarchy, and a strong first impression.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
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
            <Link href="/about" className="transition hover:text-slate-950">
              About
            </Link>
            <Link href="/contact" className="transition hover:text-slate-950">
              Contact
            </Link>
            <Link href="/privacy" className="transition hover:text-slate-950">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
