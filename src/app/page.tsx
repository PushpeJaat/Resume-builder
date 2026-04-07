import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TemplatesSection } from "@/components/TemplatesSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-slate-800">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-4xl text-center">
            {/* Badges */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/50 px-4 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-sky-200">Trusted by professionals</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/50 px-4 py-2 backdrop-blur-sm">
                <span className="text-xs font-medium text-sky-200">⚡ Pixel-perfect results</span>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
              Craft Your Perfect{" "}
              <span className="relative">
                <span className="absolute inset-0 -skew-x-12 transform bg-gradient-to-r from-sky-400 to-cyan-400 blur-xl opacity-75" />
                <span className="relative bg-gradient-to-r from-sky-200 to-cyan-200 bg-clip-text text-transparent">
                  Resume
                </span>
              </span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto mb-8 max-w-2xl text-lg sm:text-xl text-slate-200 leading-relaxed">
              The modern resume builder designed for precision. Create stunning, professional resumes that look identical on screen and in print. No compromises. No frustrations. Pure excellence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-cyan-500 rounded-xl shadow-lg shadow-sky-500/50 hover:shadow-xl hover:shadow-sky-500/75 transition-all duration-300 hover:-translate-y-1"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Start Building Free</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-sky-200 border border-sky-400/50 rounded-xl bg-sky-950/40 backdrop-blur-sm hover:bg-sky-950/60 hover:border-sky-400/80 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>

            {/* Features pills */}
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {["✓ No sign-up required", "✓ Live preview", "✓ Perfect PDFs", "✓ Save & download"].map(
                (feature) => (
                  <div
                    key={feature}
                    className="inline-block rounded-full border border-sky-400/30 bg-sky-950/50 px-4 py-2 text-sm text-sky-100 backdrop-blur-sm"
                  >
                    {feature}
                  </div>
                )
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-16 pt-12 border-t border-sky-400/20">
              {[
                { value: "10K+", label: "Resumes Created" },
                { value: "4.9★", label: "User Rating" },
                { value: "99.9%", label: "PDF Success" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text">
                    {stat.value}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-center">
            <p className="text-xs text-sky-200 mb-2">Scroll to explore</p>
            <svg className="mx-auto h-5 w-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Resume Studio?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Designed with professionals in mind. Every feature engineered for excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                icon: "🎨",
                title: "Pixel-Perfect Design",
                description:
                  "Your resume looks exactly the same on screen and paper. No layout shifts, no surprises when you print.",
                details: ["WYSIWYG editor", "Real-time preview", "Consistent rendering"],
              },
              {
                icon: "⚡",
                title: "Lightning Fast",
                description:
                  "Load, edit, and export in seconds. Optimized performance that respects your time.",
                details: ["Instant updates", "Smart caching", "Rapid PDF generation"],
              },
              {
                icon: "🔐",
                title: "Secure & Private",
                description:
                  "Your resume data is encrypted and stored securely. Only you have access to your documents.",
                details: ["End-to-end protection", "Zero tracking", "GDPR compliant"],
              },
              {
                icon: "📱",
                title: "Fully Responsive",
                description:
                  "Build your resume anywhere. Edit on desktop, tablet, or mobile with full functionality.",
                details: ["Cross-device sync", "Touch-friendly", "Adaptive UI"],
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-sky-600">•</span> {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Excellence Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Built on Modern Technology
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Enterprise-grade infrastructure powering your resume creation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                title: "Unified Rendering",
                description:
                  "Handlebars templates with dedicated CSS modules ensure one HTML output for both preview and PDF—no canvas snapshots, no rendering drift.",
              },
              {
                number: "02",
                title: "Headless Chrome PDFs",
                description:
                  "Browserless integration delivers pixel-perfect A4 PDFs with proper spacing, margins, and print quality—exactly what you see.",
              },
              {
                number: "03",
                title: "Persistent Storage",
                description:
                  "PostgreSQL backend with NextAuth authentication. Your resumes are safely stored with full version history and download audit trails.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="relative rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-lg transition-all"
              >
                <div className="absolute -top-3 -left-3 h-16 w-16 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text">
                    {item.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 mt-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-cyan-600 p-12 text-center shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Build Your Perfect Resume?
            </h2>
            <p className="text-lg text-sky-50 mb-8 max-w-xl mx-auto">
              Join thousands of professionals creating stunning, interview-winning resumes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-sky-600 bg-white rounded-xl hover:bg-slate-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Free Today
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <TemplatesSection />

      {/* Final CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-white border-2 border-slate-200 p-12 text-center shadow-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-emerald-50/50 px-4 py-2 mb-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">✓ Free & Easy</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              No Credit Card Required
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Create and edit your resume completely free. Only pay if you need premium templates or features.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="p-4">
                <div className="text-3xl font-bold text-sky-600 mb-2">3 min</div>
                <p className="text-sm text-slate-600">Setup takes just minutes</p>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-sky-600 mb-2">∞</div>
                <p className="text-sm text-slate-600">Unlimited resumes</p>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-sky-600 mb-2">100%</div>
                <p className="text-sm text-slate-600">ATS optimized</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-sky-600 to-cyan-600 rounded-xl shadow-lg shadow-sky-600/30 hover:shadow-xl hover:shadow-sky-600/40 hover:from-sky-700 hover:to-cyan-700 transition-all duration-300"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-lg font-semibold tracking-tight text-slate-900">
                Resume<span className="text-sky-600">Studio</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Professional resume builder for the modern world.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Blog"],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Contact", "Press"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Cookies", "Compliance"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-slate-900">{col.title}</h4>
                <ul className="mt-4 space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 pt-8">
            <p className="text-center text-sm text-slate-600">
              © 2026 Resume Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
