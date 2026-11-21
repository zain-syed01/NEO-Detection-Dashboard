# NEO Detection & Alert Dashboard

Live demo: [https://neo-detection-dashboard.vercel.app](https://neo-detection-dashboard.vercel.app)

Mission-control style web app that tracks near-Earth objects (NEOs) using NASA's **NeoWs** API. The server parses nested JSON close-approach data, ranks objects with a transparent threat score, and visualizes estimated diameter vs miss distance. Authenticated users can save asteroids to a personal watchlist.

Built as a junior full-stack / applied data portfolio project: real API ingestion, filtering algorithms, interactive charts, auth, and a Postgres-backed watchlist.

---

## Features

- Live NASA NeoWs close-approach feed (max 7-day window)
- Server-side normalize → filter → rank pipeline
- Mission metrics: total tracked, closest miss, hazard count, max velocity
- Interactive Recharts scatter plot (diameter × miss distance, log-scaled Y in million km)
- PHA (potentially hazardous asteroid) visual alerts
- Detail panel with miss distance, velocity, diameter, threat score, and JPL link
- URL-synced filters (date range, sort, hazardous-only, max miss distance)
- Supabase email/password auth
- Per-user **My Watchlist** (save / remove), protected with Row Level Security
- Loading, empty, and error states with retry

---

## Tech stack

| Layer | Tools |
|-------|--------|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Validation | Zod |
| Backend route | Next.js Route Handler (`/api/neos`) |
| Auth + DB | Supabase Auth + Postgres |
| Tests | Vitest |
| Deploy | Vercel |

---

## Architecture (high level)

```text
Browser
  ├── Dashboard UI (metrics, filters, chart, table, detail)
  ├── Auth + Watchlist (Supabase client + RLS)
  └── GET /api/neos?...
        ├── NASA NeoWs /feed
        ├── normalize nested JSON
        ├── threat-score ranking / filters
        └── metrics aggregates
```

- NASA API key stays on the server (`NASA_API_KEY`)
- Supabase public URL + publishable/anon key are used in the browser (`NEXT_PUBLIC_...`)
- Watchlist rows are scoped with RLS: `auth.uid() = user_id`

---

## Project structure

```text
app/
  page.tsx                 # dashboard
  login/page.tsx           # sign in / sign up
  watchlist/page.tsx       # saved asteroids
  api/neos/route.ts        # NASA proxy + ranking API
components/                # UI (dashboard, chart, auth, watchlist)
lib/
  nasa.ts / normalize.ts / rank.ts / metrics.ts
  schemas.ts / filters.ts / format.ts / dates.ts
  supabase/                # browser + server clients
  watchlist.ts
supabase/
  schema.sql               # watchlist table, grants, RLS policies
tests/                     # unit tests for parse / rank / metrics / dates
```

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/zain-syed01/NEO-Detection-Dashboard.git
cd NEO-Detection-Dashboard
npm install
```

### 2. Environment variables

Copy the example file to **`.env`** or **`.env.local`** (both work with Next.js):

```bash
cp .env.example .env.local
```

Fill in:

```bash
NASA_API_KEY=your_nasa_key
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_key
```

| Variable | Where to get it |
|----------|-----------------|
| `NASA_API_KEY` | [api.nasa.gov](https://api.nasa.gov/) (NeoWs uses this key) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → legacy `anon` key **or** new `sb_publishable_...` key |

Notes:
- Restart `npm run dev` after changing env vars
- Do **not** put `service_role` / `sb_secret_...` in any `NEXT_PUBLIC_` variable
- Supabase is migrating from `anon` → publishable keys; either public key works in this app today

### 3. Supabase database

1. Open Supabase → **SQL Editor** → New query  
2. Paste and run all of `supabase/schema.sql`  
3. Confirm `watchlist` exists under **Table Editor**  

`Success. No rows returned` is normal for `CREATE TABLE` / `GRANT` statements.

If you ever see `permission denied for table watchlist`, re-run the `GRANT` section in `supabase/schema.sql`.

### 4. Auth settings (local/demo)

Supabase → **Authentication** → **Providers** → Email  

For a portfolio demo, it is fine to turn **off** “Confirm email” so sign-up works immediately.

Also add local redirects if needed:

- Site URL can stay your production URL  
- Redirect URLs should include: `http://localhost:3000/**`

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `/` — dashboard  
- `/login` — create account / sign in  
- Select an asteroid → **Save to watchlist**  
- `/watchlist` — personal list  

---

## Deploy (Vercel)

This repo is set up for Vercel.

1. Import the GitHub repo in Vercel  
2. Keep default Next.js build settings (`next build`)  
3. Add the same three env vars in Vercel Project Settings → Environment Variables  
4. Deploy  

### Supabase auth URLs for production

Supabase → **Authentication** → **URL Configuration**:

| Field | Value |
|-------|--------|
| Site URL | `https://neo-detection-dashboard.vercel.app` |
| Redirect URLs | `https://neo-detection-dashboard.vercel.app/**` and `http://localhost:3000/**` |

---

## API

### `GET /api/neos`

Fetches NeoWs, normalizes objects, applies filters/sort, returns metrics + object list.

| Query | Description |
|-------|-------------|
| `start` | Start date `YYYY-MM-DD` |
| `end` | End date `YYYY-MM-DD` (inclusive; max **7-day** span) |
| `sort` | `threatScore` (default), `missDistanceKm`, `relativeVelocityKmS`, `estimatedDiameterKm`, `closeApproachDate`, `name` |
| `hazardous` | `true` to keep NASA PHA-flagged objects only |
| `maxMissKm` | Optional miss-distance ceiling (km) |

Example response shape:

```json
{
  "metrics": {
    "totalTracked": 30,
    "closestMissKm": 8980000,
    "closestMissName": "(2019 UFO)",
    "hazardousCount": 1,
    "maxVelocityKmS": 25.4,
    "largestDiameterKm": 0.45
  },
  "objects": [ /* normalized NEOs */ ],
  "meta": {
    "startDate": "2026-11-20",
    "endDate": "2026-11-26",
    "fetchedAt": "...",
    "elementCount": 30
  }
}
```

---

## Threat score

Transparent **0–100** composite in `lib/rank.ts` :

| Factor | Weight |
|--------|--------|
| NASA PHA flag | 35% |
| Closeness (inverse miss distance) | 30% |
| Relative velocity | 20% |
| Estimated diameter | 15% |



---

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint
npm test         # Vitest unit tests
```

Unit tests cover date-window validation, NeoWs normalization, threat scoring / filters, and metrics aggregates.

---

## Notes & limitations

- NeoWs `/feed` allows at most **7 days** per request  
- Approach dates/distances come from NASA/JPL catalog data and can be refined over time  
- Email confirmation is typically disabled for demo convenience  
- No email/SMS alert system in this version (watchlist only)  
- Chart Y-axis uses a log scale in **million km** for readability  

---


---

## License

Personal / portfolio project. NASA NeoWs data is provided by NASA and subject to their API terms of use.
