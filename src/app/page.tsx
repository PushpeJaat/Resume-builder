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

const heroSkills = ["TypeScript", "React", "Node.js", "AWS", "System Design", "PostgreSQL"];

const heroExperience = [
  {
    role: "Senior Software Engineer",
    company: "Nova Labs",
    period: "2022 - Present",
    bullets: [
      "Built resume workflow tooling used by 120K+ monthly users.",
      "Reduced page load time by 38% with streaming and caching improvements.",
    ],
  },
  {
    role: "Software Engineer",
    company: "CloudPeak",
    period: "2019 - 2022",
    bullets: [
      "Shipped internal platform features across web, API, and PDF pipelines.",
    ],
  },
];

const heroProof = [
  "ATS-friendly layouts",
  "AI-assisted writing",
  "Export-ready PDF",
];

const heroStats = [
  { value: "25K+", label: "resumes built" },
  { value: "4.9/5", label: "average rating" },
  { value: "8 min", label: "to first draft" },
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(14,165,233,0.14),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(6,182,212,0.12),transparent_22%),radial-gradient(circle_at_52%_78%,rgba(125,211,252,0.1),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.2),rgba(148,163,184,0.05))]" />
            <div className="hero-mesh absolute inset-x-[6%] inset-y-[8%] hidden lg:block" />
            <div className="hero-orb hero-float-delay-1 absolute left-[3%] top-10 h-40 w-40 bg-sky-300/45 blur-3xl" />
            <div className="hero-orb hero-float-delay-2 absolute left-[16%] top-56 h-14 w-14 bg-cyan-300/55 blur-xl" />
            <div className="hero-orb hero-float-delay-3 absolute right-[6%] top-8 h-44 w-44 bg-slate-300/45 blur-3xl" />
            <div className="hero-orb hero-float-delay-4 absolute right-[24%] top-60 h-20 w-20 bg-sky-200/60 blur-2xl" />
            <div className="hero-orb hero-float-delay-2 absolute bottom-6 left-[44%] h-28 w-28 bg-cyan-200/50 blur-3xl" />
            <div className="hero-ring hero-float-delay-3 absolute left-[10%] top-24 h-44 w-44" />
            <div className="hero-ring hero-float-delay-1 absolute right-[15%] top-36 h-28 w-28" />
            <div className="hero-ring hero-float-delay-4 absolute bottom-14 left-[34%] h-20 w-20" />
            <div className="hero-dot hero-dot-delay-1 absolute left-[12%] top-20" />
            <div className="hero-dot hero-dot-delay-2 absolute left-[24%] top-[14rem]" />
            <div className="hero-dot hero-dot-delay-3 absolute left-[31%] top-[22rem]" />
            <div className="hero-dot hero-dot-delay-4 absolute right-[14%] top-[7rem]" />
            <div className="hero-dot hero-dot-delay-2 absolute right-[26%] top-[17rem]" />
            <div className="hero-dot hero-dot-delay-3 absolute bottom-16 left-[49%]" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_1.02fr]">
            <div className="max-w-2xl">
              <Badge variant="outline" className="rounded-full border-sky-200 bg-white/85 px-3 py-1 text-sky-700 shadow-sm backdrop-blur">
                Resume builder trusted by modern professionals
              </Badge>
              <h1 className="mt-7 text-5xl font-semibold leading-[0.96] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Build a Job-Winning Resume in Minutes
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                Create a polished resume with smarter writing prompts, recruiter-friendly templates, and a visual
                editor that helps every section feel sharper.
              </p>

              <div className="mt-7 flex flex-wrap gap-3 text-sm text-slate-600">
                {heroProof.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-2 shadow-sm backdrop-blur"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-2xl px-6 shadow-lg shadow-slate-950/10 transition-transform hover:-translate-y-0.5">
                  <Link href="/editor">
                    Create Resume
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border-slate-300 bg-white/85 px-6 transition-transform hover:-translate-y-0.5 hover:bg-white"
                >
                  <Link href="#templates">View Templates</Link>
                </Button>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur">
                    <p className="text-2xl font-semibold text-slate-950">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="hero-float absolute left-0 top-20 hidden rounded-2xl border border-white/70 bg-white/85 p-4 shadow-xl shadow-slate-200/70 backdrop-blur lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">ATS Check</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">96%</p>
                <p className="mt-1 text-sm text-slate-500">Ready to submit</p>
              </div>

              <div className="hero-float hero-float-delay-2 absolute bottom-12 left-8 hidden rounded-2xl border border-sky-100 bg-sky-50/90 p-4 shadow-lg shadow-sky-100/80 backdrop-blur lg:block">
                <div className="flex items-center gap-2 text-sm font-medium text-sky-700">
                  <Sparkles className="h-4 w-4" />
                  AI Rewrite
                </div>
                <p className="mt-2 max-w-[180px] text-sm leading-6 text-slate-600">
                  Reworded your summary to sound sharper and more confident.
                </p>
              </div>

              <div className="relative w-full max-w-[34rem]">
                <Card className="absolute right-2 top-6 hidden w-[82%] rotate-[6deg] rounded-[28px] border border-slate-200/70 bg-slate-100/85 shadow-2xl shadow-slate-200/70 lg:block" />

                <Card className="relative z-10 w-full rounded-[32px] border border-white/70 bg-white/92 shadow-[0_28px_90px_-30px_rgba(15,23,42,0.36)] backdrop-blur">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg font-semibold">Resume Preview</CardTitle>
                        <CardDescription>Software Engineer profile</CardDescription>
                      </div>
                      <Badge className="rounded-full px-3">Live</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                    <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 sm:p-6">
                      <div className="grid gap-5 sm:grid-cols-[0.38fr_1fr]">
                        <div className="space-y-4">
                          <div className="rounded-[22px] bg-slate-950 p-4 text-white shadow-lg shadow-slate-200/60">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400" />
                            <h3 className="mt-4 text-xl font-semibold tracking-tight">Aarav Mehta</h3>
                            <p className="mt-1 text-sm text-sky-200">Software Engineer</p>
                            <div className="mt-4 space-y-2 text-xs text-slate-300">
                              <p>San Francisco, CA</p>
                              <p>aaravmehta.dev</p>
                              <p>linkedin.com/in/aarav</p>
                            </div>
                          </div>

                          <div className="rounded-[22px] bg-white p-4 ring-1 ring-slate-200">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Skills</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {heroSkills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="rounded-[22px] bg-white p-5 ring-1 ring-slate-200">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Summary</p>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                              Full-stack engineer with 6+ years building product experiences, scalable APIs, and
                              performance-focused web applications used by fast-growing teams.
                            </p>
                          </div>

                          <div className="mt-4 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Experience</p>
                            {heroExperience.map((item) => (
                              <div key={`${item.company}-${item.role}`} className="rounded-[22px] bg-white p-4 ring-1 ring-slate-200">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{item.role}</p>
                                    <p className="text-xs text-slate-500">{item.company}</p>
                                  </div>
                                  <span className="text-[11px] font-medium text-slate-400">{item.period}</span>
                                </div>
                                <ul className="mt-3 space-y-1.5 text-xs leading-5 text-slate-600">
                                  {item.bullets.map((bullet) => (
                                    <li key={bullet} className="flex gap-2">
                                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                                      <span>{bullet}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
