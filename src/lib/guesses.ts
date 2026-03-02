// Server-only — never import in client components
import { sql } from '@vercel/postgres'
import type { ScoreTier } from '@/types/index'

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

export async function recordGuess(r: GuessRecord): Promise<void> {
  await sql`
    INSERT INTO guesses
      (session_id, player_name, game_mode, round_number, photo_id, filename,
       lat_actual, lng_actual, lat_guess, lng_guess, distance_m, tier, points)
    VALUES
      (${r.sessionId}, ${r.playerName}, ${r.gameMode}, ${r.roundNumber},
       ${r.photoId}, ${r.filename},
       ${r.latActual}, ${r.lngActual}, ${r.latGuess}, ${r.lngGuess},
       ${r.distanceM}, ${r.tier}, ${r.points})
  `
}
