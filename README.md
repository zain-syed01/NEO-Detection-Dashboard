# NEO Detection & Alert Dashboard

Mission-control dashboard that pulls live near-Earth object (NEO) close-approach data from NASA's **NeoWs** API, normalizes nested JSON on the server, ranks objects with a transparent threat score, and visualizes diameter vs miss distance with Recharts.

Authenticated users can save asteroids to a personal **My Watchlist** backed by Supabase Auth + Postgres.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Recharts
- Zod (query validation)
- Vitest (unit tests for parse / rank / metrics)
- Supabase (Auth + watchlist database)

## Features

- Metrics strip: total tracked, closest miss, hazard count, max velocity
- `GET /api/neos` — fetch NeoWs, normalize, filter, rank
- Interactive scatter plot (estimated diameter × miss distance, log-scale Y)
- PHA visual alerts (pulse badge + row accent)
- Detail panel with lunar-distance context + NASA JPL link
- Filter state synced to the URL query string
- Supabase email/password auth
- Save / remove asteroids on a per-user watchlist

## Setup

### 1. One env file: `.env.local`

```bash
npm install
cp .env.example .env.local
```

Edit **`.env.local`** (this is the only file you need for secrets):

```bash
NASA_API_KEY=your_nasa_key
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

| Variable | Where to get it |
|----------|-----------------|
| `NASA_API_KEY` | [api.nasa.gov](https://api.nasa.gov/) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key |

Do **not** put the `service_role` key in the frontend env file.

### 2. Create the watchlist table

1. Open Supabase → **SQL Editor** → New query
2. Paste and run the contents of `supabase/schema.sql`
3. Confirm the `watchlist` table exists under **Table Editor**

### 3. (Recommended) Easier local sign-up

Supabase → **Authentication** → **Providers** → Email  
Turn **off** “Confirm email” while developing so you can sign up and use the app immediately.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Sign up / sign in at `/login`
- Select an asteroid → **Save to watchlist**
- View saves at `/watchlist`

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint
npm test         # Vitest unit tests
```

## API

`GET /api/neos`

| Query       | Description                                     |
|-------------|-------------------------------------------------|
| `start`     | YYYY-MM-DD (inclusive)                          |
| `end`       | YYYY-MM-DD (inclusive, max 7-day span)          |
| `sort`      | `threatScore` (default), `missDistanceKm`, etc. |
| `hazardous` | `true` to keep NASA PHA-flagged objects only    |
| `maxMissKm` | optional miss-distance ceiling                  |

## Threat score

Transparent 0–100 composite (not ML):

- PHA flag — 35%
- Closeness (inverse miss distance) — 30%
- Relative velocity — 20%
- Estimated diameter — 15%

Tune weights in `lib/rank.ts`.

## Notes

- NeoWs `/feed` allows at most **7 days** per request
- Watchlist rows are protected with Supabase Row Level Security (users only see their own rows)
- No email/SMS alert system in this version

## Resume bullets (suggested)

- Architected a responsive web application utilizing the NASA NeoWs API to track, filter, and visualize real-time asteroid close-approach data
- Programmed server-side filtering algorithms to parse complex NASA JSON payloads, dynamically categorizing objects by miss-distance, velocity, and hazard classification
- Integrated Recharts to map asteroid diameter against miss distance, converting raw NeoWs fields into an interactive data visualization dashboard
- Implemented Supabase authentication and a Postgres-backed watchlist so users can save near-Earth objects of interest
