# Poznej Halenkovice — Project Conventions

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Map**: Leaflet 1.x + OpenStreetMap tiles (no API key required)
- **Photos**: Local filesystem — `img/` (root, committed to git), metadata in `data/photos.json`
- **Database**: Vercel Postgres (`@vercel/postgres`) — leaderboard + guess analytics
- **Analytics**: Vercel Analytics (`@vercel/analytics/next`) — page views
- **Hosting**: Vercel (poznej-halenkovice.online)

## Project Structure
```
geo_game/
├── CLAUDE.md
├── .env.local                  # POSTGRES_URL=... (set automatically by Vercel; pull locally with: npx vercel env pull .env.local)
├── next.config.ts
├── tailwind.config.ts
├── data/
│   └── photos.json             # Photo metadata (source of truth)
├── img/                        # Photo image files (committed to git)
├── public/
│   ├── halenkovice_znak.png    # Village emblem used in UI and share card
│   └── leaflet/                # Copied Leaflet marker icons
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (imports Leaflet CSS, Vercel Analytics)
│   │   ├── page.tsx            # Home page (server component)
│   │   ├── game/page.tsx       # Game page — all phases in one client component
│   │   ├── leaderboard/page.tsx
│   │   └── api/
│   │       ├── leaderboard/route.ts   # GET, POST
│   │       └── guesses/route.ts       # POST — analytics tracking only
│   ├── components/
│   │   ├── HomeForm.tsx         # Client: name input + mode selector, creates session
│   │   ├── MapPicker.tsx        # Leaflet map (must be dynamically imported ssr:false)
│   │   ├── RoundPhoto.tsx       # Photo display with loading spinner + click-to-zoom
│   │   ├── ResultOverlay.tsx    # Post-guess tier/score display
│   │   ├── ScoreBreakdown.tsx   # End-of-game breakdown table
│   │   ├── ShareButton.tsx      # Client: generates share card image via Canvas API
│   │   ├── LeaderboardTable.tsx
│   │   ├── HowToPlay.tsx        # Static: collapsible rules section (no JS, uses <details>)
│   │   └── AboutApp.tsx         # Static: collapsible about/licence section
│   ├── lib/
│   │   ├── photos.ts            # Server-only: read photos.json
│   │   ├── leaderboard.ts       # Server-only: read/write leaderboard via @vercel/postgres
│   │   ├── guesses.ts           # Server-only: write guess analytics via @vercel/postgres
│   │   ├── shareCard.ts         # Client-only: Canvas 2D API share image generation
│   │   ├── distance.ts          # Pure: haversine distance in metres
│   │   └── scoring.ts           # Pure: tier + points calculation
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
- `src/lib/photos.ts`, `src/lib/leaderboard.ts`, and `src/lib/guesses.ts` are **server-only** — never import in client components
- `src/lib/shareCard.ts` is **client-only** — uses browser Canvas API, never import in server components
- `src/lib/distance.ts` and `src/lib/scoring.ts` are **pure functions** — no Node.js imports, safe for client use
- `data/photos.json` is the **single source of truth for photo metadata** — read via `src/lib/photos.ts`
- Leaderboard and guesses are stored in **Vercel Postgres** — connection via `POSTGRES_URL` env var (no promise queue needed; Postgres handles concurrent writes)

## Database Schemas

### `leaderboard` table (Postgres)
```typescript
interface LeaderboardEntry {
  name: string;
  score: number;
  rounds: number;
  date: string; // ISO date string
}
```

### `guesses` table (Postgres)
```typescript
interface GuessRecord {
  sessionId: string;     // crypto.randomUUID() per game session
  playerName: string;
  gameMode: '10_rounds' | 'all_photos';
  roundNumber: number;   // 1-based
  photoId: string;       // e.g. "photo_3"
  filename: string;      // e.g. "photo_3.jpg"
  latActual: number;
  lngActual: number;
  latGuess: number;
  lngGuess: number;
  distanceM: number;     // haversine distance in metres
  tier: ScoreTier;       // 'Perfect' | 'Close' | 'Far'
  points: number;
  // created_at: TIMESTAMPTZ DEFAULT NOW() — added by Postgres automatically
}
```

### Photo (`data/photos.json`)
```typescript
interface Photo {
  id: string;            // e.g. "photo_1"
  filename: string;      // e.g. "photo_1.png" or "photo_9.jpg"
  lat: number;
  lng: number;
  perfectRadius: number; // metres — default 50
  closeRadius: number;   // metres — default 200
}
```

### GameSession (sessionStorage)
```typescript
interface GameSession {
  playerName: string;
  totalRounds: number;
  photoIds: string[];
  currentRound: number;
  results: RoundResult[];
  sessionId: string;        // crypto.randomUUID() — generated in HomeForm on game start
  livesRemaining?: number;  // only present in 'all_photos' mode (starts at 3)
}
```

## Scoring Rules
- Distance ≤ `perfectRadius` → **Perfect** → **1000 pts**
- Distance ≤ `closeRadius` → **Close** → **500 pts**
- Distance > `closeRadius` → **Far** → **0 pts**
- Max score per game = `rounds × 1000`

## Game Modes
- **10 kol** — 10 randomly selected photos, no lives
- **Na 3 životy** — all photos in random order; each "Far" guess costs one life; game ends when lives reach 0 or all photos are played

## Game Session State
- Stored in `sessionStorage` as two keys:
  - `gameSession` — `GameSession` object
  - `gamePhotos` — `Photo[]` for the selected photos (needed for radii during client-side scoring)
- `sessionId` is `crypto.randomUUID()` generated in `HomeForm.tsx` on game start
- No server-side session required

## Guess Analytics
- After every confirmed guess, `game/page.tsx` fires a **fire-and-forget** `POST /api/guesses`
- Failure is intentionally silent — analytics must never block the game UI
- All fields (coordinates, tier, distance, player name, session ID, game mode) are recorded per guess

## Map Configuration
- Default centre: `[49.171, 17.472]` (the village area)
- Default zoom: `14`
- Tile URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Attribution: `© OpenStreetMap contributors`
- Leaflet marker icons: copy from `node_modules/leaflet/dist/images/` to `public/leaflet/`

## Testing
- **Framework**: Vitest
- **Test files**: `tests/*.test.ts`
- **What to test**: all pure functions in `src/lib/distance.ts` and `src/lib/scoring.ts`
- **What NOT to test**: React components, API routes, database calls

## Colours / Tiers (Tailwind classes)
- **Perfect**: `bg-green-500 text-white`
- **Close**: `bg-yellow-400 text-black`
- **Far**: `bg-red-500 text-white`

## Scripts
```bash
npm run dev     # development server
npm run build   # production build (TypeScript check)
npm run lint    # ESLint
npm test        # Vitest
```
