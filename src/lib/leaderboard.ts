import { sql } from '@vercel/postgres'
import type { LeaderboardEntry } from '@/types/index'

export async function getEntries(): Promise<LeaderboardEntry[]> {
  const { rows } = await sql`
    SELECT name, score, rounds, date
    FROM leaderboard
    ORDER BY score DESC
  `
  return rows as LeaderboardEntry[]
}

export async function addEntry(entry: LeaderboardEntry): Promise<void> {
  await sql`
    INSERT INTO leaderboard (name, score, rounds, date)
    VALUES (${entry.name}, ${entry.score}, ${entry.rounds}, ${entry.date})
  `
}
