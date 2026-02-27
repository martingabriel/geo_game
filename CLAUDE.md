# Village GeoGuessr — Project Conventions

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Map**: Leaflet 1.x + OpenStreetMap tiles (no API key required)
- **Storage**: Local filesystem — `data/photos.json`, `data/leaderboard.json`, `public/img/`
- **Auth**: Single env-var password (`ADMIN_PASSWORD`) + HttpOnly cookie

## Project Structure
```
geo_game/
├── CLAUDE.md
├── .env.local                  # ADMIN_PASSWORD=... (never commit)
├── middleware.ts               # Admin route guard
├── next.config.ts
├── tailwind.config.ts
├── data/
│   ├── photos.json             # Photo metadata (source of truth)
│   └── leaderboard.json        # Leaderboard entries
├── public/
│   ├── img/                    # Uploaded photo files
│   └── leaflet/                # Copied Leaflet marker icons
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (imports leaflet CSS)
│   │   ├── page.tsx            # Home page
│   │   ├── game/page.tsx       # Game page (all phases in one component)
│   │   ├── leaderboard/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Admin dashboard
│   │   │   └── login/page.tsx
│   │   └── api/
│   │       ├── photos/route.ts          # GET, POST, PATCH, DELETE
│   │       ├── leaderboard/route.ts     # GET, POST
│   │       └── admin/auth/route.ts      # POST (login), DELETE (logout)
│   ├── components/
│   │   ├── MapPicker.tsx        # Leaflet map (must be dynamically imported ssr:false)
│   │   ├── ResultOverlay.tsx    # Post-guess tier/score display
│   │   ├── RoundPhoto.tsx       # Photo display for current round
│   │   ├── ScoreBreakdown.tsx   # End-of-game breakdown table
│   │   ├── LeaderboardTable.tsx
│   │   ├── AdminPhotoCard.tsx   # Photo card in admin dashboard
│   │   └── AdminUploadForm.tsx  # Upload form
│   ├── lib/
│   │   ├── photos.ts            # Server-only: read/write photos.json
│   │   ├── leaderboard.ts       # Server-only: read/write leaderboard.json
│   │   ├── distance.ts          # Pure: haversine distance in metres
│   │   ├── scoring.ts           # Pure: tier + points calculation
│   │   └── auth.ts              # Server-only: cookie validation
│   └── types/
│       └── index.ts             # All shared TypeScript types
└── tests/
    ├── distance.test.ts
    └── scoring.test.ts
```

## TypeScript Conventions
- **No `any`** — use `unknown` and narrow, or define proper types in `src/types/index.ts`
- **Strict mode** — `tsconfig.json` has `"strict": true`
- **Imports** — always use `@/` alias (e.g. `import { scoreGuess } from '@/lib/scoring'`)

## React / Next.js Conventions
- **Server Components by default** — fetch data server-side and pass as props
- **`"use client"`** only when required: Leaflet, event handlers, `useState`/`useEffect`, browser APIs
- **Leaflet SSR**: import Leaflet inside `useEffect` only; load component via `dynamic(..., { ssr: false })`
- **Tailwind only** — no CSS modules, no inline `style` objects
- **No `next/image` optimisation** — use plain `<img>` tags; images are local and don't need CDN optimisation

## Data Layer
- `src/lib/photos.ts` and `src/lib/leaderboard.ts` are **server-only** — never import in client components
- `src/lib/distance.ts` and `src/lib/scoring.ts` are **pure functions** — no Node.js imports, safe for client use
- `data/photos.json` is the **single source of truth** — always read/write through the lib functions
- Leaderboard writes use a **promise queue** to prevent concurrent write races

## Data Schemas

### Photo (`data/photos.json`)
```typescript
interface Photo {
  id: string;           // e.g. "photo_1" or "photo_1700000000000"
  filename: string;     // e.g. "photo_1.png"
  lat: number;
  lng: number;
  perfectRadius: number; // metres — default 50
  closeRadius: number;   // metres — default 200
}
```

### LeaderboardEntry (`data/leaderboard.json`)
```typescript
interface LeaderboardEntry {
  name: string;
  score: number;
  rounds: number;
  date: string; // ISO date string
}
```

## Scoring Rules
- Distance ≤ `perfectRadius` → **Perfect** → **1000 pts**
- Distance ≤ `closeRadius` → **Close** → **500 pts**
- Distance > `closeRadius` → **Far** → **100 pts**
- Max score per game = `rounds × 1000`

## Admin Auth
- Password stored in `.env.local` as `ADMIN_PASSWORD`
- Login POSTs to `/api/admin/auth`, which sets an HttpOnly cookie `admin_session=1` (Max-Age 86400)
- `middleware.ts` protects all `/admin/**` routes except `/admin/login`
- All mutating admin API routes (`POST /api/photos`, `DELETE /api/photos`, `PATCH /api/photos`) should be called only from authenticated admin pages (cookie is checked by middleware for page access, but API routes themselves should also verify the cookie server-side)

## Game Session State
- Stored in `sessionStorage` as two keys:
  - `gameSession` — `GameSession` object (player name, round count, photo IDs, current round index, results)
  - `gamePhotos` — `Photo[]` for the selected photos (needed for radii during client-side scoring)
- No server-side session required

## Map Configuration
- Default centre: `[49.176, 17.457]` (the village area)
- Default zoom: `16`
- Tile URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Attribution: `© OpenStreetMap contributors`
- Leaflet marker icons: copy from `node_modules/leaflet/dist/images/` to `public/leaflet/`

## Testing
- **Framework**: Vitest
- **Test files**: `tests/*.test.ts`
- **What to test**: all pure functions in `src/lib/distance.ts` and `src/lib/scoring.ts`
- **What NOT to test**: React components, API routes, file I/O

## Colours / Tiers (Tailwind classes)
- **Perfect**: `bg-green-500 text-white`
- **Close**: `bg-yellow-400 text-black`
- **Far**: `bg-red-500 text-white`

## Scripts (after scaffolding)
```bash
npm run dev     # development server
npm run build   # production build (TypeScript check)
npm run lint    # ESLint
npm test        # Vitest
```
