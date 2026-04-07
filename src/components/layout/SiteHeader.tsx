import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/40 bg-white/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
            <div className="relative rounded-lg bg-gradient-to-br from-sky-600 to-cyan-600 p-2">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Resume<span className="text-transparent bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text">Studio</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 text-sm font-medium">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-200"
          >
            Sign In
          </Link>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <Link
            href="/signup"
            className="group relative inline-flex items-center justify-center px-5 py-2.5 text-white font-semibold rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 shadow-lg shadow-sky-600/30 hover:shadow-xl hover:shadow-sky-600/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-sky-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative">Get Started</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
