import { WatchlistPanel } from "@/components/WatchlistPanel";

export default function WatchlistPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-500/90">
          Personal tracking
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-zinc-50">
          My Watchlist
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Asteroids you save from the dashboard appear here. Data is stored in Supabase and
          scoped to your account.
        </p>
      </header>
      <WatchlistPanel />
    </main>
  );
}
