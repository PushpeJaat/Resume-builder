"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";

type Props = {
  theme?: "light" | "dark";
};

export function SiteHeader({ theme = "light" }: Props) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && Boolean(session?.user?.id);
  const fullName = session?.user?.name?.trim() ?? "";
  const emailPrefix = session?.user?.email?.split("@")[0] ?? "";
  const displayName = fullName && !fullName.includes("@") ? fullName : emailPrefix;
  const firstName = displayName.split(/\s+/).filter(Boolean)[0] ?? "there";
  const dark = theme === "dark";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl",
        dark ? "border-b border-white/10 bg-slate-950/55" : "border-b border-slate-200/40 bg-white/70",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between px-3 sm:px-4 lg:px-5">
        <BrandMark theme={dark ? "dark" : "light"} size="sm" onClick={() => setMenuOpen(false)} />

        {/* Desktop nav */}
        <nav
          className={cn(
            "hidden items-center gap-2 text-sm font-medium lg:flex lg:gap-3 [&>a]:border [&>a]:border-transparent [&>a]:transition-all",
            dark ? "[&>a:hover]:border-white/20" : "[&>a:hover]:border-sky-200/90",
          )}
        >
          <Link href="/" className={cn("rounded-lg px-3 py-2 transition-all duration-200", dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60")}>Home</Link>
          <Link href="/dashboard/templates" className={cn("rounded-lg px-3 py-2 transition-all duration-200", dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60")}>Templates</Link>
          <Link href="/pricing" className={cn("rounded-lg px-3 py-2 transition-all duration-200", dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60")}>Pricing</Link>
          <Link href="/blog" className={cn("rounded-lg px-3 py-2 transition-all duration-200", dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60")}>Blog</Link>
          <Link href="/contact-us" className={cn("rounded-lg px-3 py-2 transition-all duration-200", dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60")}>Contact</Link>
          <div className={cn("h-6 w-px", dark ? "bg-white/12" : "bg-slate-200")} />
          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-current opacity-10" />
          ) : isLoggedIn ? (
            <>
              <span className={cn("rounded-lg px-3 py-2 text-sm font-medium", dark ? "text-slate-200" : "text-slate-700")}>Hi, {firstName}</span>
              <Link href="/account" className={cn("rounded-lg px-3 py-2 transition-all duration-200", dark ? "text-slate-200 hover:text-white hover:bg-white/8" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50")}>Profile</Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className={cn("rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-white transition-all duration-200", dark ? "bg-white/10 hover:border-white/20 hover:bg-white/15" : "bg-slate-800 hover:border-slate-500/70 hover:bg-slate-700")}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={cn("rounded-lg px-3 py-2 transition-all duration-200", dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50")}>Sign In</Link>
              <Link href="/signup" className="rounded-lg border border-transparent bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-600/30 transition hover:border-cyan-200/80 hover:brightness-110">Get Started</Link>
            </>
          )}
        </nav>

        {/* Mobile: auth button + hamburger */}
        <div className="flex items-center gap-1.5 lg:hidden">
          {status !== "loading" && !isLoggedIn && (
            <Link href="/signup" className="rounded-lg border border-transparent bg-gradient-to-r from-sky-600 to-cyan-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-md shadow-sky-600/25 transition hover:border-cyan-200/80 hover:brightness-110">
              Get Started
            </Link>
          )}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
            className={cn("rounded-lg border border-transparent p-1.5 transition", dark ? "text-slate-300 hover:border-white/20 hover:bg-white/10" : "text-slate-600 hover:border-sky-200 hover:bg-slate-100")}
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
        <div className={cn("border-t px-3 pb-2.5 sm:px-4 lg:hidden", dark ? "border-white/10 bg-slate-950/95" : "border-slate-200/60 bg-white/95")}>
          <nav
            className={cn(
              "flex flex-col gap-0.5 pt-1.5 text-[0.95rem] font-medium [&>a]:border [&>a]:border-transparent [&>a]:transition-all",
              dark ? "[&>a:hover]:border-white/20" : "[&>a:hover]:border-sky-200/90",
            )}
          >
            <Link href="/" onClick={() => setMenuOpen(false)} className={cn("rounded-lg px-3 py-2", dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-700 hover:bg-slate-100")}>Home</Link>
            <Link href="/dashboard/templates" onClick={() => setMenuOpen(false)} className={cn("rounded-lg px-3 py-2", dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-700 hover:bg-slate-100")}>Templates</Link>
            <Link href="/pricing" onClick={() => setMenuOpen(false)} className={cn("rounded-lg px-3 py-2", dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-700 hover:bg-slate-100")}>Pricing</Link>
            <Link href="/blog" onClick={() => setMenuOpen(false)} className={cn("rounded-lg px-3 py-2", dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-700 hover:bg-slate-100")}>Blog</Link>
            <Link href="/contact-us" onClick={() => setMenuOpen(false)} className={cn("rounded-lg px-3 py-2", dark ? "text-slate-300 hover:text-white hover:bg-white/8" : "text-slate-700 hover:bg-slate-100")}>Contact</Link>
            <div className={cn("my-0.5 h-px", dark ? "bg-white/10" : "bg-slate-200")} />
            {isLoggedIn ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)} className={cn("rounded-lg px-3 py-2", dark ? "text-slate-200 hover:bg-white/8" : "text-slate-700 hover:bg-slate-100")}>Profile</Link>
                <button type="button" onClick={() => { setMenuOpen(false); void signOut({ callbackUrl: "/" }); }} className={cn("rounded-lg border border-transparent px-3 py-2 text-left font-semibold", dark ? "text-red-400 hover:border-white/20 hover:bg-white/8" : "text-red-600 hover:border-red-200 hover:bg-red-50")}>Log out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className={cn("rounded-lg px-3 py-2", dark ? "text-slate-300 hover:bg-white/8" : "text-slate-700 hover:bg-slate-100")}>Sign In</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="mt-0.5 rounded-lg border border-transparent bg-gradient-to-r from-sky-600 to-cyan-600 px-3 py-2 text-center font-semibold text-white hover:border-cyan-200/80">Get Started</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
