"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

export function AppHeader() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && Boolean(session?.user?.id);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.png"
              alt="CVpilot"
              width={110}
              height={34}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Home
            </Link>
            <Link href="/dashboard/templates" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Templates
            </Link>
            <Link href="/blog" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Blog
            </Link>
            <Link href="/account" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Account
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {status === "loading" ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
          ) : isLoggedIn ? (
            <>
              <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 sm:block">
                <p className="max-w-[240px] truncate font-medium text-slate-700">{session?.user?.email}</p>
              </div>
              <Link
                href="/account"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition hover:brightness-105"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition hover:brightness-105"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
