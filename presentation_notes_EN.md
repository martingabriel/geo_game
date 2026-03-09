# Poznej Halenkovice — How I Built It with Claude Code

https://www.poznej-halenkovice.cz/
https://geo-game-chi.vercel.app/

https://code.claude.com/docs/en/vs-code
https://github.com/martingabriel/geo_game

---

## 1. Introduction — What the App Does

This project is a geography game inspired by GeoGuessr for the village, where I live, Halenkovice.

- Players are shown a photo taken somewhere in the village
- They place a pin on an OpenStreetMap map to guess the location where the photo was taken
- The score is based on how close the guess was to actual location
- Two game modes: **10 rounds** (fixed) or **3 lives** (all photos, 3 lives)
- At the end: leaderboard, shareable score card with photo grid (Canvas API → Web Share API)

**Tech stack:**

It is built on top of Node.js, using OpenStreetMap, Postgre DB and Vercel for hosting.

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Map | Leaflet + OpenStreetMap (no API key) |
| Database | Vercel Postgres (`@vercel/postgres`) |
| Hosting | Vercel (poznej-halenkovice.cz) |
| Analytics | Vercel Analytics + custom guess tracking |

**Photo collection:** 28 photos with GPS coordinates stored in `data/photos.json`.

> note: Mention it is a personal/hobby project — not a work assignment.

---

## 2. How I Worked with Claude Code — Workflow

### Setup

- Claude Code runs as a VS Code extension
- It has access to read/write files, run shell commands (`npm run build`, `git commit`), and search the codebase
- I created a **`CLAUDE.md`** file in the project root —  instruction file that Claude reads at the start of every session. It defines:
  - The tech stack and conventions 
  - The data schema for photos and leaderboard
  - Scoring rules, file structure, component naming conventions
  - It was created with prompt

### Typical interaction pattern

I worked almost entirely through **short, conversational prompts** — no formal specifications:

```
Plan mode:
"I want to build the app inspired by geoguessr game. The app will shot photos from village Halenkovice to the user and the user have to guess on the map, where the photo was taken. Lets prepare a plan for building this app."

Follow-up prompts:
"Add a loading spinner when the photo is loading between rounds"
"Make the zoom overlay appear above the map controls"
"Add a share button at the end of the game that generates an image"
```

Claude Code would:
1. Read the relevant files first
2. Make the change
3. Run `npm run build` + `npm test` to verify
4. Commit and push — all in one flow

> note: Show the CLAUDE.md file. Emphasize this is the key to consistent output across sessions — without it, Claude forgets the project conventions every time. It's basically a contract between you and the AI.

---

## 3. What Worked Well — Single-Prompt Features

These features were implemented in **one prompt with no follow-up corrections needed**:

### Complex game logic — 3 lives mode
I dont have the original prompt, but there was a basic description what i expect from the game (photos will be shown to users, who will guess the location on the clickable map, lets prepare a plan for this kind of web app).
Prompt: *"Add 3 lives system for all-photos mode, remove 3-round option"*

Result: Modified `GameSession` type, game state transitions, UI hearts display, lives decrement on "Far" guess — all in one commit across 4 files.

### Collapsible "How to Play" section
Prompt: *"It would be great to have a rules of the game somewhere"*

Result: Full `HowToPlay.tsx` component using `<details>`/`<summary>` (zero JS), scoring table with tier badges, game mode descriptions — immediately usable.

### Share card (Canvas API)
Prompt: *"I would like to add the 'share' button at the end of the game..."*

Result: 182-line `shareCard.ts` using raw Canvas 2D API — drawing background, village emblem, score text, photo grid with object-cover cropping, tier-colored borders, hashtag, footer. Plus `ShareButton.tsx` with Web Share API and download fallback. This is the most technically complex code in the project.


---

## 4. Where I Had to Correct the Output — Iterations

### z-index battle with Leaflet (3 commits)

The photo zoom overlay was appearing *behind* Leaflet's map controls.

| Commit | What happened |
|---|---|
| `c7c315f` | Raised overlay to `z-[1000]` — still hidden behind controls |
| `d5b616f` | Raised to `z-[1000]` again with different selector — still broken |
| Final fix | Raised to `z-[2000]` — finally above Leaflet's internal hierarchy |

**Why:** Claude didn't know Leaflet's internal z-index hierarchy (controls sit at ~1000). Each fix was a reasonable guess, but required manual testing to discover the actual value needed.

### Photo loading skeleton (3 commits)

| Commit | What happened |
|---|---|
| `b7c2688` | Added `animate-pulse` gray skeleton — correct concept |
| `a99977f` | User: *"Gray skeleton works, but I don't see any loading animation, fix that"* — replaced with spinning border |
| `faff9c6` | User: *"Add a text 'načítání..' in the center"* — added label |

**Why:** `animate-pulse` opacity change was too subtle to notice. The first output was technically correct but visually insufficient. Required two rounds of feedback.

### Not using the plan mode
This is the second try of building this app. I havent used the plan mode

### Result overlay scrolling (2 commits)

Layout issue on mobile: the "Next round" button was pushed off screen by the result overlay.

- `9d3e573` — first attempt (restructure)
- `5c9dde9` — second attempt (side-by-side flex layout) — accepted

**Why:** CSS layout on real devices requires iteration. Claude's first attempt was logical but not quite right.

> note: Be honest here. The z-index issue is a good example of a case where Claude was confidently wrong twice. It's important not to oversell — AI-assisted development still requires a developer who can test, understand what went wrong, and guide the next iteration.

---

## 5. Key Takeaways — Tips for Colleagues

### Do these things

**Create a `CLAUDE.md`** in every project
- Claude reads it at the start of every session. Defines conventions so you don't repeat yourself.
**Give context, not super specific requirements**
- "Add a loading spinner when the photo changes" is better than writing a 5-paragraph requirement.
**Ask it to build + test after every change**
- `npm run build && npm test` catches type errors before you even look at the code. 
**Let it handle git**
- Conventional commits, branching, merging — it does all of this correctly.


### Avoid these mistakes

- Use Plan mode for description what you want. Claude will prepare internal plan files which will help to get better results.
- Trusting output without testing on real devices. Always test UI changes in the actual browser.
- Giant prompts with 10 requirements at once. One feature per prompt — easier to review and rollback.
- Letting it pick infrastructure without context. Tell it what you already have ("use existing Postgres").


### What Claude Code is good at

- Boilerplate-heavy code (API routes, TypeScript interfaces, CRUD operations)
- Browser APIs you'd normally have to look up (Canvas 2D, Web Share, `crypto.randomUUID()`)
- Consistent application of a coding style across many files
- Git workflow management
- Explaining legal/licensing questions (asked about photo licensing — got accurate answer)

---

## 6. Conclusion

### Time assessment

| Feature | Estimated manual time | With Claude Code |
|---|---|---|
| Canvas share card (shareCard.ts, 182 lines) | 3–4 hours | ~15 min |
| Analytics DB layer (schema + API + tracking) | 1–2 hours | ~10 min |
| Lives system + game state logic | 1 hour | ~5 min |
| "How to Play" component | 30 min | ~2 min |
| Git workflow (36 commits) | — | 0 min (fully automated) |
| **Total project** | **~3–4 weeks part-time** | **~3–4 evenings** |

### Overall assessment

Claude Code works best as a **senior pair programmer who writes fast and never gets tired** — but still needs you to:
- Define the project conventions upfront (`CLAUDE.md`)
- Plan and iterate
- Test the output on real devices

**Recommendation:** Just try it and play with it or any different agentic AI.


---

*Prepared for internal presentation — March 2026*
