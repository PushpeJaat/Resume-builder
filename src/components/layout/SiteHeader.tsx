"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

type Props = {
  theme?: "light" | "dark";
};

export function SiteHeader({ theme = "light" }: Props) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && Boolean(session?.user?.id);
  const dark = theme === "dark";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl",
        dark ? "border-b border-white/10 bg-slate-950/55" : "border-b border-slate-200/40 bg-white/70",
      )}
    >
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
          <span className={cn("text-lg font-bold tracking-tight", dark ? "text-white" : "text-slate-900")}>
            CV<span className="text-transparent bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text">pilot</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 text-sm font-medium">
          <Link
            href="/"
            className={cn(
              "rounded-lg px-3 py-2 transition-all duration-200",
              dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60",
            )}
          >
            Home
          </Link>
          <Link
            href="/dashboard/templates"
            className={cn(
              "rounded-lg px-3 py-2 transition-all duration-200",
              dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60",
            )}
          >
            Templates
          </Link>
          <Link
            href="/blog"
            className={cn(
              "hidden rounded-lg px-3 py-2 transition-all duration-200 sm:inline-flex",
              dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60",
            )}
          >
            Blog
          </Link>

          <div className={cn("hidden h-6 w-px sm:block", dark ? "bg-white/12" : "bg-slate-200")} />

          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-current opacity-10" />
          ) : isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "rounded-lg px-4 py-2.5 transition-all duration-200",
                  dark ? "text-slate-200 hover:text-white hover:bg-white/8" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50",
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/account"
                className={cn(
                  "rounded-lg px-4 py-2.5 transition-all duration-200",
                  dark ? "text-slate-200 hover:text-white hover:bg-white/8" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50",
                )}
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className={cn(
                  "group relative inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5",
                  dark
                    ? "bg-gradient-to-r from-white/12 to-white/6 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40"
                    : "bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg shadow-slate-700/25 hover:shadow-xl hover:shadow-slate-700/35",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    dark ? "bg-gradient-to-r from-white/14 to-white/10" : "bg-gradient-to-r from-slate-900 to-slate-800",
                  )}
                />
                <span className="relative">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "rounded-lg px-4 py-2.5 transition-all duration-200",
                  dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50",
                )}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-sky-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-600/40"
              >
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-sky-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Get Started</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
