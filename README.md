# NEO Detection & Alert Dashboard

Mission-control dashboard that pulls live near-Earth object (NEO) close-approach data from NASA's **NeoWs** API, normalizes nested JSON on the server, ranks objects with a transparent threat score, and visualizes diameter vs miss distance with Recharts.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Recharts
- Zod (query validation)
- Vitest (unit tests for parse / rank / metrics)

## Features

- Metrics strip: total tracked, closest miss, hazard count, max velocity
- `GET /api/neos` — fetch NeoWs, normalize, filter, rank
- Interactive scatter plot (estimated diameter × miss distance, log-scale Y)
- PHA visual alerts (pulse badge + row accent)
- Detail panel with lunar-distance context + NASA JPL link
- Filter state synced to the URL query string
- Loading skeletons, empty states, and API error retry

## Project layout

```text
app/
  page.tsx
  api/neos/route.ts
components/
  Dashboard.tsx
  MetricsGrid.tsx
  FiltersBar.tsx
  StatusBar.tsx
  NeoScatterChart.tsx
  NeoTable.tsx
  NeoDetailPanel.tsx
  HazardBadge.tsx
lib/
  types.ts
  schemas.ts
  nasa.ts
  normalize.ts
  rank.ts
  metrics.ts
  dates.ts
  format.ts
  filters.ts
tests/
  *.test.ts
```

## Setup

### 1. NASA API key (required for reliable use)

1. Go to [https://api.nasa.gov/](https://api.nasa.gov/)
2. Fill the form and generate a key
3. You want access to **NeoWs** (Near Earth Object Web Service) — same key unlocks NeoWs, APOD, Mars Rover, etc.

`DEMO_KEY` works for a quick smoke test but rate-limits fast. Use your own key.

### 2. Install & configure

```bash
npm install
cp .env.example .env.local
```

Put your key in `.env.local`:

```bash
NASA_API_KEY=your_key_here
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
- Prefer a personal `NASA_API_KEY`
- No auth or database in v1 — focus is parsing, ranking, and visualization

## Resume bullets (suggested)

- Architected a responsive web application utilizing the NASA NeoWs API to track, filter, and visualize real-time asteroid close-approach data
- Programmed server-side filtering algorithms to parse complex NASA JSON payloads, dynamically categorizing objects by miss-distance, velocity, and hazard classification
- Integrated Recharts to map asteroid diameter against miss distance, converting raw NeoWs fields into an interactive data visualization dashboard
