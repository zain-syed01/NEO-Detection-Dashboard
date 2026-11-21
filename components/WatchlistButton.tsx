"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { NeoObject } from "@/lib/types";
import { watchlistPayloadFromNeo } from "@/lib/watchlist";

type WatchlistButtonProps = {
  neo: NeoObject;
};

type SavedSnapshot = {
  neoId: string;
  saved: boolean;
};

export function WatchlistButton({ neo }: WatchlistButtonProps) {
  const { user, loading: authLoading, configured } = useAuth();
  const [snapshot, setSnapshot] = useState<SavedSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saved =
    snapshot && snapshot.neoId === neo.id ? snapshot.saved : null;

  useEffect(() => {
    if (!configured || !user) return;

    let cancelled = false;

    void (async () => {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from("watchlist")
        .select("id")
        .eq("neo_id", neo.id)
        .maybeSingle();

      if (cancelled) return;

      if (queryError) {
        setError(queryError.message);
        setSnapshot({ neoId: neo.id, saved: false });
        return;
      }

      setError(null);
      setSnapshot({ neoId: neo.id, saved: Boolean(data) });
    })();

    return () => {
      cancelled = true;
    };
  }, [configured, user, neo.id]);

  async function toggle() {
    if (!configured || !user || busy || saved == null) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();

    try {
      if (saved) {
        const { error: deleteError } = await supabase
          .from("watchlist")
          .delete()
          .eq("neo_id", neo.id);
        if (deleteError) throw deleteError;
        setSnapshot({ neoId: neo.id, saved: false });
      } else {
        const { error: insertError } = await supabase.from("watchlist").insert({
          user_id: user.id,
          ...watchlistPayloadFromNeo(neo),
        });
        if (insertError) throw insertError;
        setSnapshot({ neoId: neo.id, saved: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Watchlist update failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <p className="mt-4 text-xs text-zinc-600">
        Add Supabase keys to `.env` / `.env.local` and restart the dev server to enable
        watchlists.
      </p>
    );
  }

  if (authLoading || (user && saved == null)) {
    return <p className="mt-4 text-xs text-zinc-500">Checking account…</p>;
  }

  if (!user) {
    return (
      <p className="mt-4 text-sm text-zinc-400">
        <Link href="/login" className="text-cyan-300 underline-offset-2 hover:underline">
          Sign in
        </Link>{" "}
        to save this asteroid.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void toggle()}
        className={`w-full border px-3 py-2 text-sm font-medium disabled:opacity-50 ${
          saved
            ? "border-zinc-600 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
            : "border-cyan-700/60 bg-cyan-950/40 text-cyan-100 hover:bg-cyan-900/40"
        }`}
      >
        {busy ? "Saving…" : saved ? "Remove from watchlist" : "Save to watchlist"}
      </button>
      {error ? (
        <p className="text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
