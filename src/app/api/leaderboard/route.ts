import { NextResponse } from 'next/server'
import { getEntries, addEntry } from '@/lib/leaderboard'
import type { LeaderboardEntry } from '@/types/index'

export async function GET() {
  const entries = await getEntries()
  return NextResponse.json(entries)
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: unknown; score?: unknown; rounds?: unknown }

  const name = typeof body.name === 'string' ? body.name.trim() : null
  const score = typeof body.score === 'number' ? body.score : null
  const rounds = typeof body.rounds === 'number' ? body.rounds : null

  if (!name || score === null || rounds === null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const entry: LeaderboardEntry = {
    name,
    score,
    rounds,
    date: new Date().toISOString().split('T')[0],
  }

  await addEntry(entry)
  return NextResponse.json(entry, { status: 201 })
}
