"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AppHeader() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur lg:px-6">
      <div className="flex items-center gap-4 sm:gap-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-900">
          Resume<span className="text-sky-600">Studio</span>
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Home
          </Link>
          <Link href="/dashboard/templates" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Templates
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Pricing
          </Link>
          <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Blog
          </Link>
          <Link href="/account" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Account
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:block">
          <p className="max-w-[240px] truncate font-medium text-slate-700">{session?.user?.email}</p>
          {session?.user?.plan === "PREMIUM" ? (
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              Premium
            </span>
          ) : null}
        </div>
        <Link
          href="/account"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Profile
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
