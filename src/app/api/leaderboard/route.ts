import { NextRequest, NextResponse } from 'next/server'
import { getEntries, addEntry } from '@/lib/leaderboard'
import type { LeaderboardEntry } from '@/types/index'
import { checkRateLimit } from '@/lib/rateLimit'

export async function GET() {
  const entries = await getEntries()
  return NextResponse.json(entries)
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(ip, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = (await request.json()) as { name?: unknown; score?: unknown; rounds?: unknown }

  const name   = typeof body.name   === 'string' ? body.name.trim() : null
  const score  = typeof body.score  === 'number' && Number.isInteger(body.score)  ? body.score  : null
  const rounds = typeof body.rounds === 'number' && Number.isInteger(body.rounds) ? body.rounds : null

  if (!name || name.length < 1 || name.length > 50) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }
  if (score === null || score < 0) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
  }
  if (rounds === null || rounds < 1 || rounds > 100) {
    return NextResponse.json({ error: 'Invalid rounds' }, { status: 400 })
  }
  if (score > rounds * 1000) {
    return NextResponse.json({ error: 'Score exceeds maximum possible' }, { status: 400 })
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
