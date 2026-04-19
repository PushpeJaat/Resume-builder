import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-8 text-slate-300 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <p className="text-sm font-semibold text-white">CVpilot</p>
          <p className="mt-1 text-xs text-slate-400">
            Modern resume building for fast-moving careers.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:justify-end">
          <Link href="/contact-us" className="transition hover:text-white">
            Contact Us
          </Link>
          <Link href="/privacy-policy" className="transition hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="transition hover:text-white">
            Terms
          </Link>
          <Link href="/refunds-cancellations" className="transition hover:text-white">
            Refunds
          </Link>
        </nav>
      </div>
      <p className="mx-auto mt-4 w-full max-w-6xl text-center text-[11px] text-slate-500 sm:text-left">
        &copy; {new Date().getFullYear()} CVpilot. All rights reserved.
      </p>
    </footer>
  );
}