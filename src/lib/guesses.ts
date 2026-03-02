// Server-only — never import in client components
import Database from 'better-sqlite3'
import path from 'path'
import type { ScoreTier } from '@/types/index'

const DB_PATH = path.join(process.cwd(), 'data', 'guesses.db')

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.exec(`
      CREATE TABLE IF NOT EXISTS guesses (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id   TEXT    NOT NULL,
        player_name  TEXT    NOT NULL,
        game_mode    TEXT    NOT NULL,  -- '10_rounds' | 'all_photos'
        round_number INTEGER NOT NULL,
        photo_id     TEXT    NOT NULL,
        filename     TEXT    NOT NULL,
        lat_actual   REAL    NOT NULL,
        lng_actual   REAL    NOT NULL,
        lat_guess    REAL    NOT NULL,
        lng_guess    REAL    NOT NULL,
        distance_m   REAL    NOT NULL,
        tier         TEXT    NOT NULL,  -- 'Perfect' | 'Close' | 'Far'
        points       INTEGER NOT NULL,
        created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
      )
    `)
  }
  return db
}

export interface GuessRecord {
  sessionId: string
  playerName: string
  gameMode: '10_rounds' | 'all_photos'
  roundNumber: number
  photoId: string
  filename: string
  latActual: number
  lngActual: number
  latGuess: number
  lngGuess: number
  distanceM: number
  tier: ScoreTier
  points: number
}

const INSERT = `
  INSERT INTO guesses
    (session_id, player_name, game_mode, round_number, photo_id, filename,
     lat_actual, lng_actual, lat_guess, lng_guess, distance_m, tier, points)
  VALUES
    (@sessionId, @playerName, @gameMode, @roundNumber, @photoId, @filename,
     @latActual, @lngActual, @latGuess, @lngGuess, @distanceM, @tier, @points)
`

export function recordGuess(record: GuessRecord): void {
  getDb().prepare(INSERT).run(record)
}
