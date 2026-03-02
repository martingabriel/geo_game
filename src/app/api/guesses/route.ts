import { NextRequest, NextResponse } from 'next/server'
import { recordGuess, type GuessRecord } from '@/lib/guesses'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GuessRecord
    await recordGuess(body)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
