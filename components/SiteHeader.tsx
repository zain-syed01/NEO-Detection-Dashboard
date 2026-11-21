"use client";

import Link from "next/link";

import { useAuth } from "@/components/AuthProvider";

export function SiteHeader() {
  const { user, loading, configured, signOut } = useAuth();

  return (
    <header className="border-b border-zinc-900/90 bg-zinc-950/50">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-medium text-zinc-100 hover:text-cyan-200">
            Dashboard
          </Link>
          <Link href="/watchlist" className="text-zinc-400 hover:text-zinc-200">
            My Watchlist
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {!configured ? (
            <span className="hidden text-xs text-zinc-600 sm:inline">
              Add Supabase keys to enable auth
            </span>
          ) : loading ? (
            <span className="text-xs text-zinc-500">Checking session…</span>
          ) : user ? (
            <>
              <span className="hidden max-w-[180px] truncate text-xs text-zinc-500 sm:inline">
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:bg-zinc-900"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="border border-cyan-700/60 bg-cyan-950/40 px-3 py-1.5 text-cyan-100 hover:bg-cyan-900/40"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
