import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { LeaderboardEntry } from '@/types/index'

const LEADERBOARD_PATH = path.join(process.cwd(), 'data', 'leaderboard.json')

// Promise queue to serialise concurrent writes
let writeQueue: Promise<void> = Promise.resolve()

export async function getEntries(): Promise<LeaderboardEntry[]> {
  const raw = await readFile(LEADERBOARD_PATH, 'utf-8')
  const entries = JSON.parse(raw) as LeaderboardEntry[]
  return entries.sort((a, b) => b.score - a.score)
}

export async function addEntry(entry: LeaderboardEntry): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    const entries = await getEntries()
    entries.push(entry)
    entries.sort((a, b) => b.score - a.score)
    await writeFile(LEADERBOARD_PATH, JSON.stringify(entries, null, 2))
  })
  return writeQueue
}
