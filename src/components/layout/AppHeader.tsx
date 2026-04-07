"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AppHeader() {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-900">
          Resume<span className="text-sky-600">Studio</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Home
          </Link>
          <Link href="/dashboard/templates" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Templates
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Pricing
          </Link>
        </nav>
        <span className="hidden text-sm text-slate-500 sm:inline">
          {session?.user?.email}
          {session?.user?.plan === "PREMIUM" ? (
            <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
              Premium
            </span>
          ) : null}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
