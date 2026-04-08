import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start free and upgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Free</h3>
                <div className="text-3xl font-bold text-slate-900 mb-4">$0</div>
                <p className="text-slate-600 mb-6">Perfect for getting started</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">3 Resume Templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Basic Customization</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">PDF Export</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full rounded-lg bg-slate-100 px-4 py-3 text-center font-semibold text-slate-900 hover:bg-slate-200 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="rounded-2xl border-2 border-sky-500 bg-sky-50 p-8 shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="rounded-full bg-sky-500 px-4 py-1 text-sm font-semibold text-white">Most Popular</span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Premium</h3>
                <div className="text-3xl font-bold text-slate-900 mb-4">$9.99<span className="text-lg font-normal text-slate-600">/month</span></div>
                <p className="text-slate-600 mb-6">For serious job seekers</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">All Templates (10+)</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Advanced Customization</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Unlimited PDF Downloads</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Priority Support</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full rounded-lg bg-sky-600 px-4 py-3 text-center font-semibold text-white hover:bg-sky-700 transition-colors"
              >
                Start Premium Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-slate-900 mb-4">Custom</div>
                <p className="text-slate-600 mb-6">For teams and organizations</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Everything in Premium</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Team Collaboration</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Custom Branding</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Dedicated Support</span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="block w-full rounded-lg bg-slate-100 px-4 py-3 text-center font-semibold text-slate-900 hover:bg-slate-200 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}