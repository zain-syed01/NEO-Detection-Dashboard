# NEO Detection & Alert Dashboard

Mission-control style dashboard that pulls live near-Earth object (NEO) close-approach data from NASA's NeoWs API, normalizes nested JSON on the server, ranks objects by a transparent threat score, and visualizes diameter vs miss distance with Recharts.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Zod (available for validation as you harden the API layer)

## Features (scaffold)

- Metrics strip: total tracked, closest miss, hazard count
- Server route `GET /api/neos` — fetch, normalize, filter, rank
- Interactive scatter plot (estimated diameter × miss distance)
- PHA visual alerts (pulse badge + row accent)
- Detail panel with NASA JPL link

## Project layout

```text
app/
  page.tsx                 # dashboard entry
  api/neos/route.ts        # NASA proxy + ranking
components/
  Dashboard.tsx
  MetricsGrid.tsx
  FiltersBar.tsx
  NeoScatterChart.tsx
  NeoTable.tsx
  NeoDetailPanel.tsx
  HazardBadge.tsx
lib/
  types.ts                 # shared types
  nasa.ts                  # NeoWs client
  normalize.ts             # nested JSON → NeoObject[]
  rank.ts                  # threat score + sort/filter
  metrics.ts               # KPI aggregates
  dates.ts                 # 7-day feed window helpers
tests/
  normalize.test.ts        # placeholders for unit tests
  rank.test.ts
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from the example file:

```bash
cp .env.example .env.local
```

3. Add a NASA API key from [api.nasa.gov](https://api.nasa.gov/).

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

`GET /api/neos`

| Query        | Description                                      |
|--------------|--------------------------------------------------|
| `start`      | YYYY-MM-DD (inclusive)                           |
| `end`        | YYYY-MM-DD (inclusive, max 7-day span)           |
| `sort`       | `threatScore` (default), `missDistanceKm`, etc.  |
| `hazardous`  | `true` to keep NASA PHA-flagged objects only     |
| `maxMissKm`  | optional miss-distance ceiling                   |

## Threat score

Transparent 0–100 composite (not ML):

- PHA flag — 35%
- Closeness (inverse miss distance) — 30%
- Relative velocity — 20%
- Estimated diameter — 15%

Tune weights in `lib/rank.ts`.

## Notes

- NeoWs `/feed` allows at most **7 days** per request.
- Prefer a personal `NASA_API_KEY`; `DEMO_KEY` is rate-limited.
- No auth or database in v1 — this project focuses on parsing, ranking, and visualization.

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint
```
