import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TemplatesSection } from "@/components/TemplatesSection";

const featureCards = [
  {
    title: "True WYSIWYG editing",
    description: "See the same layout while editing and exporting. No formatting surprises.",
  },
  {
    title: "Interview-ready templates",
    description: "Use proven structures for product, engineering, design, and business roles.",
  },
  {
    title: "Fast PDF export",
    description: "Generate clean A4 PDFs quickly with consistent spacing and typography.",
  },
  {
    title: "Secure account history",
    description: "Track your resume downloads and manage account settings in one place.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 top-24 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -right-20 top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-indigo-400/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-100">
                Resume Studio
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                A cleaner workflow for your next resume
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
                Build polished resumes with structure, speed, and pixel-perfect PDF output. Designed for applicants who care about quality.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Start free
                </Link>
                <Link
                  href="/dashboard/templates"
                  className="inline-flex items-center rounded-xl border border-sky-300/40 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-800/30"
                >
                  Explore templates
                </Link>
              </div>
              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {[
                  { value: "10K+", label: "Resumes created" },
                  { value: "4.9/5", label: "Average rating" },
                  { value: "99.9%", label: "PDF success" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur sm:p-6">
              <div className="rounded-2xl bg-white p-5 shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-sky-700">Preview</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">From draft to final PDF</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Move from idea to export in minutes with guided sections and ATS-friendly formatting.
                </p>
                <div className="mt-4 space-y-2">
                  {["Personal details", "Experience bullets", "Skills and projects", "One-click export"].map((item) => (
                    <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything needed for a strong application</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Built for consistency across editing, preview, and final exports.
              </p>
            </div>
            <Link href="/pricing" className="text-sm font-semibold text-sky-700 hover:text-sky-900">
              View pricing
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <TemplatesSection />

      <section className="px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                No credit card required
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Create your first resume today</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                Start free and upgrade only when you need premium options. Your drafts and download history stay in one account.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/signup" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  Create account
                </Link>
                <Link href="/login" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Sign in
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">3 min</p>
                <p className="mt-1 text-xs text-slate-500">Average setup</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">∞</p>
                <p className="mt-1 text-xs text-slate-500">Resume drafts</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">A4</p>
                <p className="mt-1 text-xs text-slate-500">Export format</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-lg font-semibold text-slate-900">ResumeStudio</p>
              <p className="mt-2 text-sm text-slate-600">Professional resume builder with modern templates and fast exports.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link href="/dashboard/templates" className="hover:text-slate-900">Templates</Link></li>
                <li><Link href="/pricing" className="hover:text-slate-900">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-slate-900">Blog</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Account</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link href="/login" className="hover:text-slate-900">Sign in</Link></li>
                <li><Link href="/signup" className="hover:text-slate-900">Create account</Link></li>
                <li><Link href="/account" className="hover:text-slate-900">Profile settings</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Explore</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link href="/" className="hover:text-slate-900">Home</Link></li>
                <li><Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link></li>
                <li><Link href="/dashboard/templates" className="hover:text-slate-900">Start building</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">© 2026 Resume Studio. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
