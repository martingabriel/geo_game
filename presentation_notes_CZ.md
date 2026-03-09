# Poznej Halenkovice — Jak jsem to postavil s Claude Code
### Přípravné poznámky na 10minutovou prezentaci

---

## 1. Úvod — Co aplikace dělá

**„Poznej Halenkovice"** je hra v duchu GeoGuessr zasazená do prostředí obce Halenkovice.

- Hráč vidí fotografii pořízenu někde v obci
- Umístí špendlík na mapu (OpenStreetMap) a hádá, kde byla fotka pořízena
- Výsledek se hodnotí ve třech úrovních: **Perfektní** (≤50 m, 1000 b), **Blízko** (≤200 m, 500 b), **Daleko** (0 b)
- Dva herní módy: **10 kol** (fixní počet) nebo **Na 3 životy** (všechny fotky, 3 pokusy)
- Na konci: žebříček, sdílitelná výsledková karta s náhledy fotek (Canvas API → Web Share API)

**Tech stack:**

| Vrstva | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Stylování | Tailwind CSS |
| Mapa | Leaflet + OpenStreetMap (bez API klíče) |
| Databáze | Vercel Postgres (`@vercel/postgres`) |
| Hosting | Vercel (poznej-halenkovice.cz) |
| Analytika | Vercel Analytics + vlastní sledování tipů |

**Kolekce fotek:** 28 fotografií s GPS souřadnicemi uloženými v `data/photos.json`.

> note: Začni otevřením živého webu a zahraj jedno kolo. Ať lidé vidí, jak to vypadá, než začneš vysvětlovat, jak to vzniklo. Zdůrazni, že jde o osobní/hobby projekt — ne pracovní zadání. To nastaví správný tón: „co Claude Code zvládne na reálném projektu?"

---

## 2. Jak jsem pracoval s Claude Code — Workflow

### Nastavení

- Claude Code běží jako **CLI nástroj v terminálu** (nebo rozšíření pro VS Code)
- Má přístup ke čtení/zápisu souborů, spouštění příkazů (`npm run build`, `git commit`) a prohledávání kódové báze
- Vytvořil jsem soubor **`CLAUDE.md`** v kořeni projektu — trvalý instrukční soubor, který Claude čte na začátku každé session. Definuje:
  - Tech stack a konvence (`no any`, strict TypeScript, pouze Tailwind)
  - Datové schéma pro fotky a žebříček
  - Pravidla bodování, strukturu souborů, pojmenování komponent

### Typický způsob práce

Pracoval jsem téměř výhradně přes **krátké, konverzační prompty** — žádné formální specifikace:

```
"Add a loading spinner when the photo is loading between rounds"
"Make the zoom overlay appear above the map controls"
"Add a share button at the end of the game that generates an image"
"Dont use sqlite.. Use existing postgreSQL - just give me the create statement"
```

Claude Code pak:
1. Přečetl relevantní soubory
2. Provedl změnu
3. Spustil `npm run build` + `npm test` pro ověření
4. Commitoval a pushoval — vše v jednom průběhu

### Git workflow

- Po každé smysluplné změně jsem žádal o commit
- Konvenční formát commitů (`feat:`, `fix:`, `refactor:`) byl dodržován automaticky
- Správa větví (`devel` / `main`) probíhala na vyžádání

> note: Ukaž soubor CLAUDE.md. Zdůrazni, že toto je klíč ke konzistentnímu výstupu napříč sezeními — bez něj Claude zapomene konvence projektu vždy při novém spuštění. Je to v podstatě smlouva mezi tebou a AI.

---

## 3. Co fungovalo dobře — Funkce z jednoho promptu

Tyto funkce vznikly v **jednom promptu bez jakýchkoliv následných korekcí**:

### Komplexní herní logika — systém životů
Prompt: *„Add lives system for all-photos mode, remove 3-round option, update map center"*

Výsledek: Úprava typu `GameSession`, přechody herního stavu, zobrazení srdíček v UI, odečítání životů při tipu „Daleko" — vše v jednom commitu napříč 4 soubory.

### Rozbalovací sekce „Jak se hraje"
Prompt: *„It would be great to have a rules of the game somewhere"*

Výsledek: Kompletní komponenta `HowToPlay.tsx` využívající `<details>`/`<summary>` (nula JavaScriptu), tabulka bodování s odznaky úrovní, popisy herních módů — okamžitě použitelné.

### Analytická databázová vrstva
Prompt: *„I would like to gather some statistics about game guesses into database. [...] Lets store everything useful."*

Výsledek: Kompletní návrh schématu, `src/lib/guesses.ts`, `src/app/api/guesses/route.ts`, fire-and-forget sledování v herní smyčce, přidání `sessionId` do `GameSession` — vše v jednom commitu. Claude navrhl schéma bez toho, aby byl instruován, jaké sloupce zařadit.

### Sdílecí karta (Canvas API)
Prompt: *„I would like to add the 'share' button at the end of the game..."*

Výsledek: 182 řádků `shareCard.ts` s použitím čistého Canvas 2D API — vykreslování pozadí, erbu obce, textu skóre, mřížky fotek s object-cover ořezem, barevné ohraničení podle úrovně, hashtag, patička. Plus `ShareButton.tsx` s Web Share API a záložním stahováním. Toto je technicky nejkomplexnější kód v celém projektu.

### Vercel Analytics
Prompt: *(vložen obsah z Vercel dokumentace — 3 kroky)*

Výsledek: Instalace balíčku, přidání `<Analytics />` do root layoutu, commit, push — hotovo během vteřin.

### Konvenční commity a git workflow
Každý commit dodržuje formát `feat:`, `fix:`, `refactor:`. Claude psal všechny commit zprávy, vyřizoval vytváření větví, mergování a pushování bez jakýchkoliv instrukcí o git syntaxi.

> note: U sdílecí karty se vyplatí se zastavit déle. Používá Canvas 2D API — simulaci object-cover, `Promise.allSettled` pro paralelní načítání obrázků, dynamické velikosti buněk mřížky podle počtu fotek. Nenapsal jsem jediný řádek. Manuálně by mi to zabralo hodiny.

---

## 4. Kde jsem musel výstup opravovat — Iterace

### Bitva o z-index s Leafletem (3 commity)

Zoom overlay fotek se zobrazoval *za* ovládacími prvky mapy Leaflet.

| Commit | Co se stalo |
|---|---|
| `c7c315f` | Overlay zvýšen na `z-[1000]` — stále skrytý za ovládacími prvky |
| `d5b616f` | Opět zvýšen na `z-[1000]` s jiným selektorem — stále rozbitý |
| Finální fix | Zvýšen na `z-[2000]` — konečně nad interní hierarchií Leafletu |

**Proč:** Claude neznal interní hierarchii z-indexů Leafletu (ovládací prvky sedí kolem 1000). Každý fix byl rozumný odhad, ale vyžadoval manuální testování pro zjištění správné hodnoty.

### Skeleton při načítání fotky (3 commity)

| Commit | Co se stalo |
|---|---|
| `b7c2688` | Přidán `animate-pulse` šedý skeleton — správný koncept |
| `a99977f` | Uživatel: *„Gray skeleton works, but I don't see any loading animation, fix that"* — nahrazeno roztočeným okrajem |
| `faff9c6` | Uživatel: *„Add a text 'načítání..' in the center"* — přidán popisek |

**Proč:** Změna průhlednosti `animate-pulse` byla příliš jemná na povšimnutí. První výstup byl technicky správný, ale vizuálně nedostatečný. Vyžadovalo to dvě kola zpětné vazby.

### Design sdílecí karty (4 commity)

Karta prošla výraznou designovou evolucí po první funkční verzi:

1. `ed0fb88` — první funkční verze (čtverec 1080×1080, jednoduché počty úrovní)
2. `7941a3d` — *„Make it higher so it is better for sharing on social media"* → 9:16, modrá hlavička
3. `a5b67a8` — *„Add photo miniatures instead of counts"* → mřížka fotek s barevnými okraji
4. `d7ea836` — *„Add text 'Poznal jsem X z Y fotek!'"* → řádek s počtem uhádnutých

**Proč:** Designová rozhodnutí jsou ze své podstaty iterativní. Claude pokaždé dodal funkční řešení, ale vizuální design potřeboval upřesnění na základě reálného testování.

### Změna technologie databáze (2 commity)

- `f76e645` — Claude zvolil SQLite (`better-sqlite3`) jako nejjednodušší lokální možnost
- `81001d0` — Uživatel: *„Dont use sqlite.. Use existing postgreSQL"* — přechod na `@vercel/postgres`

**Proč:** Claude udělal rozumnou výchozí volbu (SQLite je jednodušší), ale uživatel měl existující PostgreSQL databázi, kterou měl použít. Přechod byl čistý a rychlý po nasměrování.

### Scrollování výsledkového overlaye (2 commity)

Layout problém na mobilu: tlačítko „Další kolo" bylo posunuto mimo obrazovku výsledkovým overlayem.

- `9d3e573` — první pokus (restrukturalizace)
- `5c9dde9` — druhý pokus (flex layout vedle sebe) — přijato

**Proč:** CSS layout na reálných zařízeních vyžaduje iteraci. První pokus Claude byl logický, ale ne úplně správný.

> note: Buď tady upřímný. Z-index problém je dobrý příklad situace, kdy byl Claude dvakrát sebejistě špatně. Důležité je nepřehánět — vývoj s AI stále vyžaduje vývojáře, který umí testovat, pochopit, co se pokazilo, a nasměrovat další iteraci.

---

## 5. Klíčové závěry — Tipy pro kolegy

### Co dělat

| Tip | Proč na tom záleží |
|---|---|
| **Vytvořit `CLAUDE.md`** v každém projektu | Claude jej čte na začátku každé session. Definuje konvence, abys je neopakoval. |
| **Dávat kontext, ne specifikace** | „Add a loading spinner when the photo changes" je lepší než psát 5 odstavců požadavku. |
| **Nechat ho buildovat + testovat po každé změně** | `npm run build && npm test` zachytí typové chyby dřív, než se na kód vůbec podíváš. |
| **Nechat ho zpracovat git** | Konvenční commity, větvení, mergování — vše provádí správně. |
| **Zeptat se „jak by mělo schéma vypadat?"** | Pro datové modelování (DB tabulky, TypeScript rozhraní) Claude často navrhuje lepší strukturu než rychlý první nápad. |
| **Použít ho na věci, které bys googlit** | Canvas API, Web Share API, Haversineův vzorec, Leaflet z-index — to vše zná. |

### Čemu se vyhnout

| Chyba | Co dělat místo toho |
|---|---|
| Důvěřovat výstupu bez testování na reálných zařízeních | Vždy testuj změny UI v reálném prohlížeči |
| Obří prompty s 10 požadavky najednou | Jedna funkce na prompt — snazší review a rollback |
| Nechat ho vybírat infrastrukturu bez kontextu | Řekni mu, co už máš („use existing Postgres") |
| Přeskakovat `CLAUDE.md` u krátkých projektů | I u malých projektů 10 minut nastavení ušetří hodiny |

### Co Claude Code umí dobře

- Kód plný boilerplate (API routes, TypeScript rozhraní, CRUD operace)
- Prohlížečová API, která bys jinak musel hledat (Canvas 2D, Web Share, `crypto.randomUUID()`)
- Konzistentní aplikace coding style napříč mnoha soubory
- Správa git workflow
- Odpovídání na právní/licenční otázky (dotazoval jsem se na licencování fotografií — dostal jsem přesnou odpověď)

### Co stále vyžaduje tvůj úsudek

- Vizuální designová rozhodnutí (vypadá to *správně* na reálném telefonu?)
- Volba infrastruktury (defaultuje na nejjednodušší, ne na to, co už máš)
- Z-index a CSS layout na reálných zařízeních
- Zda je vygenerovaný kód skutečně idiomatický pro verzi tvého frameworku

> note: Tip s CLAUDE.md je nejpraktičtější věc, kterou si lidé z přednášky odnesou. Ukaž svůj soubor — má asi 100 řádků. Poukáž na to, že obsahuje pravidla bodování, TypeScript konvence, strukturu souborů. Claude by nedodržel konzistenci napříč 36 commity bez něj.

---

## 6. Závěr

### Časový odhad

| Funkce | Odhadovaný čas manuálně | S Claude Code |
|---|---|---|
| Canvas sdílecí karta (shareCard.ts, 182 řádků) | 3–4 hodiny | ~15 min |
| Analytická DB vrstva (schéma + API + tracking) | 1–2 hodiny | ~10 min |
| Systém životů + logika herního stavu | 1 hodina | ~5 min |
| Komponenta „Jak se hraje" | 30 min | ~2 min |
| Git workflow (36 commitů) | — | 0 min (plně automatizované) |
| **Celý projekt** | **~3–4 týdny part-time** | **~3–4 večery** |

### Celkové hodnocení

Claude Code nejlépe funguje jako **senior pair programmer, který píše rychle a nikdy se neunaví** — ale který potřebuje, aby ses:
- Předem definoval konvence projektu (`CLAUDE.md`)
- Testoval výstup na reálných zařízeních
- Rozhodoval o produktu (jak má vypadat? která databáze?)
- Zachytil případy, kdy se sebejistě mýlí

**Není** náhradou za vývojáře. Je to multiplikátor.

**Doporučení:** Použij ho na svůj příští side projekt nebo proof-of-concept. Investice do nastavení (`CLAUDE.md`, struktura projektu) se vrátí během první hodiny. Pro produkční práci přistupuj k jeho výstupu jako k pull requestu od rychlého juniora — review před mergováním.

> note: Zakonči živým webem: poznej-halenkovice.cz. Nech lidi hrát. Zeptej se, kdo dostal „Perfektní". Nejlepší způsob, jak ukázat, co Claude Code dokáže, je ukázat hotový produkt a říct — „postavil jsem to za pár večerů, hlavně tím, že jsem popisoval, co chci, v normálních větách."

---

*Připraveno pro interní prezentaci — březen 2026*
