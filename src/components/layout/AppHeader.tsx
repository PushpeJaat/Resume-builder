"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { BrandMark } from "@/components/BrandMark";

export function AppHeader() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && Boolean(session?.user?.id);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3 sm:gap-6">
          <BrandMark size="sm" onClick={() => setMenuOpen(false)} />
          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">Home</Link>
            <Link href="/dashboard/templates" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">Templates</Link>
            <Link href="/blog" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">Blog</Link>
            <Link href="/account" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">Account</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop auth */}
          <div className="hidden items-center gap-2 sm:gap-3 md:flex">
            {status === "loading" ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
            ) : isLoggedIn ? (
              <>
                <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 lg:block">
                  <p className="max-w-[200px] truncate font-medium text-slate-700">{session?.user?.email}</p>
                </div>
                <Link href="/account" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Profile</Link>
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
                <Link href="/login" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Sign In</Link>
                <Link href="/signup" className="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition hover:brightness-105">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-slate-200/60 bg-white/95 px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2 text-sm font-medium">
            <Link href="/" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-100">Home</Link>
            <Link href="/dashboard/templates" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-100">Templates</Link>
            <Link href="/blog" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-100">Blog</Link>
            <Link href="/account" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-100">Account</Link>
            <div className="my-1 h-px bg-slate-200" />
            {isLoggedIn ? (
              <>
                {session?.user?.email && (
                  <p className="truncate px-3 py-1 text-xs text-slate-500">{session.user.email}</p>
                )}
                <Link href="/account" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-100">Profile</Link>
                <button type="button" onClick={() => { setMenuOpen(false); void signOut({ callbackUrl: "/" }); }} className="rounded-lg px-3 py-2.5 text-left font-semibold text-red-600 hover:bg-red-50">Log out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-100">Sign In</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="mt-1 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-2.5 text-center font-semibold text-white">Get Started</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
