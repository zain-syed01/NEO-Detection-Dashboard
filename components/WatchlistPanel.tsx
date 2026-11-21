"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/components/AuthProvider";
import { HazardBadge } from "@/components/HazardBadge";
import { createClient } from "@/lib/supabase/client";
import type { WatchlistRow } from "@/lib/watchlist";

type WatchlistSnapshot = {
  userId: string;
  rows: WatchlistRow[];
};

export function WatchlistPanel() {
  const { user, loading: authLoading, configured } = useAuth();
  const [snapshot, setSnapshot] = useState<WatchlistSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows =
    user && snapshot && snapshot.userId === user.id ? snapshot.rows : null;

  useEffect(() => {
    if (!configured || !user) return;

    let cancelled = false;
    const userId = user.id;

    void (async () => {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from("watchlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (queryError) {
        setError(queryError.message);
        setSnapshot({ userId, rows: [] });
        return;
      }

      setError(null);
      setSnapshot({ userId, rows: (data as WatchlistRow[]) ?? [] });
    })();

    return () => {
      cancelled = true;
    };
  }, [configured, user]);

  async function remove(neoId: string) {
    if (!user) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("watchlist")
      .delete()
      .eq("neo_id", neoId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSnapshot((prev) =>
      prev && prev.userId === user.id
        ? { ...prev, rows: prev.rows.filter((row) => row.neo_id !== neoId) }
        : prev,
    );
  }

  if (!configured) {
    return (
      <div className="panel-surface p-6 text-sm text-zinc-400">
        Add <code className="text-zinc-200">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="text-zinc-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
        <code className="text-zinc-200">.env</code> or{" "}
        <code className="text-zinc-200">.env.local</code>, restart{" "}
        <code className="text-zinc-200">npm run dev</code>, then run{" "}
        <code className="text-zinc-200">supabase/schema.sql</code> in the Supabase SQL Editor if
        you have not already.
      </div>
    );
  }

  if (authLoading || (user && rows == null && !error)) {
    return (
      <div className="panel-surface p-6 text-sm text-zinc-500">Loading watchlist…</div>
    );
  }

  if (!user) {
    return (
      <div className="panel-surface p-6 text-sm text-zinc-400">
        <Link href="/login" className="text-cyan-300 underline-offset-2 hover:underline">
          Sign in
        </Link>{" "}
        to view and manage your saved asteroids.
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-surface p-6 text-sm text-red-300" role="alert">
        {error}
        <p className="mt-2 text-zinc-500">
          If this mentions a missing table, run <code>supabase/schema.sql</code> in the Supabase
          SQL Editor.
        </p>
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <div className="panel-surface p-6 text-sm text-zinc-400">
        No saved asteroids yet. Open the{" "}
        <Link href="/" className="text-cyan-300 underline-offset-2 hover:underline">
          dashboard
        </Link>
        , select an object, and click Save to watchlist.
      </div>
    );
  }

  return (
    <div className="panel-surface overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-950/90 text-[11px] uppercase tracking-[0.14em] text-zinc-500">
          <tr>
            <th className="px-3 py-2.5 font-medium">Name</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 font-medium">Saved</th>
            <th className="px-3 py-2.5 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-zinc-900/90">
              <td className="px-3 py-2 text-zinc-100">{row.neo_name}</td>
              <td className="px-3 py-2">
                <HazardBadge hazardous={row.is_potentially_hazardous} />
              </td>
              <td className="px-3 py-2 font-mono text-zinc-400">
                {new Date(row.created_at).toLocaleString()}
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-3">
                  {row.nasa_jpl_url ? (
                    <a
                      href={row.nasa_jpl_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 underline-offset-2 hover:underline"
                    >
                      JPL
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void remove(row.neo_id)}
                    className="text-zinc-400 underline-offset-2 hover:text-red-300 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
