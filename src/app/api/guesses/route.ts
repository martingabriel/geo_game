import { NextRequest, NextResponse } from 'next/server'
import { recordGuess, type GuessRecord } from '@/lib/guesses'
import { checkRateLimit } from '@/lib/rateLimit'

function isValid(b: unknown): b is GuessRecord {
  if (!b || typeof b !== 'object') return false
  const r = b as Record<string, unknown>
  return (
    typeof r.sessionId === 'string'   && r.sessionId.length >= 1  && r.sessionId.length <= 36 &&
    typeof r.playerName === 'string'  && r.playerName.length >= 1 && r.playerName.length <= 50 &&
    (r.gameMode === '10_rounds' || r.gameMode === 'all_photos') &&
    typeof r.roundNumber === 'number' && Number.isInteger(r.roundNumber) && r.roundNumber >= 1 &&
    typeof r.photoId === 'string'     && /^photo_\d+$/.test(r.photoId) &&
    typeof r.filename === 'string'    && r.filename.length >= 1 && r.filename.length <= 100 && !r.filename.includes('..') &&
    typeof r.latActual === 'number'   && Math.abs(r.latActual) <= 90 &&
    typeof r.lngActual === 'number'   && Math.abs(r.lngActual) <= 180 &&
    typeof r.latGuess === 'number'    && Math.abs(r.latGuess) <= 90 &&
    typeof r.lngGuess === 'number'    && Math.abs(r.lngGuess) <= 180 &&
    typeof r.distanceM === 'number'   && r.distanceM >= 0 &&
    (r.tier === 'Perfect' || r.tier === 'Close' || r.tier === 'Far') &&
    (r.points === 0 || r.points === 500 || r.points === 1000)
  )
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(ip, 30, 60_000)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  try {
    const body: unknown = await req.json()
    if (!isValid(body)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    await recordGuess(body)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
