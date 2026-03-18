'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { GameSession, Photo, RoundResult } from '@/types/index'
import { scoreGuess } from '@/lib/scoring'
import RoundPhoto from '@/components/RoundPhoto'
import ResultOverlay from '@/components/ResultOverlay'
import ScoreBreakdown from '@/components/ScoreBreakdown'
import ShareButton from '@/components/ShareButton'

// Leaflet must never be server-rendered
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false })

type GamePhase = 'loading' | 'guessing' | 'result' | 'finished'

export default function GamePage() {
  const router = useRouter()

  const [phase, setPhase] = useState<GamePhase>('loading')
  const [session, setSession] = useState<GameSession | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [guessLat, setGuessLat] = useState<number | null>(null)
  const [guessLng, setGuessLng] = useState<number | null>(null)
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null)
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')

  // ── Load session from sessionStorage on mount ──────────────────────────
  useEffect(() => {
    const rawSession = sessionStorage.getItem('gameSession')
    const rawPhotos = sessionStorage.getItem('gamePhotos')

    if (!rawSession || !rawPhotos) {
      router.replace('/')
      return
    }

    try {
      const s = JSON.parse(rawSession) as GameSession
      const p = JSON.parse(rawPhotos) as Photo[]
      setSession(s)
      setPhotos(p)
      const isGameOver = s.currentRound >= s.totalRounds || s.livesRemaining === 0
      setPhase(isGameOver ? 'finished' : 'guessing')
    } catch {
      router.replace('/')
    }
  }, [router])

  // ── Derived state ───────────────────────────────────────────────────────
  const currentIndex = session?.currentRound ?? 0
  const currentPhoto = photos[currentIndex] ?? null
  const totalScore = session?.results.reduce((sum, r) => sum + r.points, 0) ?? 0

  // ── Pin placement callback (stable reference via useCallback) ───────────
  const handlePin = useCallback((lat: number, lng: number) => {
    setGuessLat(lat)
    setGuessLng(lng)
  }, [])

  // ── Submit guess ────────────────────────────────────────────────────────
  function handleSubmitGuess() {
    if (!session || !currentPhoto || guessLat == null || guessLng == null) return

    const { distanceMeters, tier, points } = scoreGuess(guessLat, guessLng, currentPhoto)

    const result: RoundResult = {
      photoId: currentPhoto.id,
      filename: currentPhoto.filename,
      guessLat,
      guessLng,
      distanceMeters,
      tier,
      points,
    }

    let updatedSession: GameSession = {
      ...session,
      results: [...session.results, result],
    }

    // Decrement a life when the player guesses wrong in all-photos mode
    if (tier === 'Far' && updatedSession.livesRemaining !== undefined) {
      updatedSession = { ...updatedSession, livesRemaining: Math.max(0, updatedSession.livesRemaining - 1) }
    }

    // Fire-and-forget: record this guess for analytics
    fetch('/api/guesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId:   session.sessionId,
        playerName:  session.playerName,
        gameMode:    session.livesRemaining !== undefined ? 'all_photos' : '10_rounds',
        roundNumber: session.currentRound + 1,
        photoId:     currentPhoto.id,
        filename:    currentPhoto.filename,
        latActual:   currentPhoto.lat,
        lngActual:   currentPhoto.lng,
        latGuess:    guessLat,
        lngGuess:    guessLng,
        distanceM:   result.distanceMeters,
        tier:        result.tier,
        points:      result.points,
      }),
    }).catch(() => { /* analytics failure is non-critical */ })

    setCurrentResult(result)
    setSession(updatedSession)
    sessionStorage.setItem('gameSession', JSON.stringify(updatedSession))
    setPhase('result')
  }

  // ── Next round ──────────────────────────────────────────────────────────
  function handleNextRound() {
    if (!session) return
    const nextRound = session.currentRound + 1
    const isLast = nextRound >= session.totalRounds || session.livesRemaining === 0

    const updatedSession: GameSession = { ...session, currentRound: nextRound }
    setSession(updatedSession)
    sessionStorage.setItem('gameSession', JSON.stringify(updatedSession))

    setGuessLat(null)
    setGuessLng(null)
    setCurrentResult(null)

    if (isLast) {
      setPhase('finished')
    } else {
      setPhase('guessing')
    }
  }

  // ── Save to leaderboard ─────────────────────────────────────────────────
  async function handleSaveScore() {
    if (!session) return
    setSavedStatus('saving')

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName.trim(),
          score: totalScore,
          rounds: session.results.length,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        setSaveError(body.error ?? `Chyba ${res.status}`)
        setSavedStatus('error')
        return
      }
      setSavedStatus('saved')
      setSaveError(null)
      // Clear session so the game can't be replayed
      sessionStorage.removeItem('gameSession')
      sessionStorage.removeItem('gamePhotos')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Síťová chyba')
      setSavedStatus('error')
    }
  }

  // ── Loading state ───────────────────────────────────────────────────────
  if (phase === 'loading' || !session || (phase !== 'finished' && !currentPhoto)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">Načítám hru…</p>
      </main>
    )
  }

  // ── Finished phase ──────────────────────────────────────────────────────
  if (phase === 'finished') {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
        <div className="max-w-xl mx-auto space-y-6">
          <ScoreBreakdown results={session.results} />

          {/* Save to leaderboard */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3">
            <h2 className="font-semibold text-gray-900 dark:text-gray-50">Uložit skóre</h2>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Zadej svoje jméno…"
              disabled={savedStatus === 'saved'}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-base
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50
                         placeholder:text-gray-400 dark:placeholder:text-gray-500
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                         disabled:opacity-50"
            />

            {savedStatus === 'saved' ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium text-sm">✓ Skóre uloženo!</p>
                <Link
                  href="/leaderboard"
                  className="inline-block rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold
                             text-white hover:bg-green-700 transition-colors"
                >
                  Zobrazit žebříček →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSaveScore}
                  disabled={!playerName.trim() || savedStatus === 'saving'}
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white
                             hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savedStatus === 'saving' ? 'Ukládám…' : 'Uložit do žebříčku'}
                </button>
                {savedStatus === 'error' && (
                  <p className="text-red-500 text-xs">Uložení se nezdařilo: {saveError ?? 'Zkus to znovu.'}</p>
                )}
              </div>
            )}
          </div>

          <ShareButton
            playerName={playerName}
            score={session.results.reduce((s, r) => s + r.points, 0)}
            maxScore={session.results.length * 1000}
            rounds={session.results.length}
            results={session.results.map(r => ({ filename: r.filename, tier: r.tier }))}
          />

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 text-center rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm
                         font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Hrát znovu
            </Link>
            <Link
              href="/leaderboard"
              className="flex-1 text-center rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm
                         font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Žebříček
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ── Active game (guessing + result phases) ──────────────────────────────
  const isLastRound = session.currentRound + 1 >= session.totalRounds || session.livesRemaining === 0

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          ← Konec
        </Link>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          {session.livesRemaining !== undefined && (
            <span className="flex gap-0.5">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={i < session.livesRemaining! ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'}>
                  ♥
                </span>
              ))}
            </span>
          )}
        </span>
        <span className="text-sm font-semibold text-green-700 dark:text-green-400">
          {totalScore} b
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-2 space-y-2">
        {/* Photo */}
        <RoundPhoto
          filename={currentPhoto.filename}
          roundNumber={session.currentRound + 1}
          totalRounds={session.totalRounds}
          source={currentPhoto.source}
        />

        {/* Map */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700">
          <MapPicker
            phase={phase === 'result' ? 'result' : 'guessing'}
            onPin={handlePin}
            guessLat={guessLat ?? undefined}
            guessLng={guessLng ?? undefined}
            actualLat={phase === 'result' ? currentPhoto.lat : undefined}
            actualLng={phase === 'result' ? currentPhoto.lng : undefined}
          />
        </div>

        {/* Result overlay + next-round button side by side */}
        {phase === 'result' && currentResult && (
          <div className="flex gap-3 items-stretch">
            <div className="flex-1">
              <ResultOverlay
                tier={currentResult.tier}
                distanceMeters={currentResult.distanceMeters}
                points={currentResult.points}
                totalScore={totalScore}
              />
            </div>
            <button
              onClick={handleNextRound}
              className="w-32 shrink-0 rounded-xl bg-gray-800 dark:bg-gray-600 text-sm font-semibold text-white
                         hover:bg-gray-900 dark:hover:bg-gray-500 transition-colors leading-tight px-3"
            >
              {isLastRound ? 'Zobrazit výsledky' : 'Další kolo →'}
            </button>
          </div>
        )}

        {/* Guessing: hint + confirm button */}
        {phase === 'guessing' && (
          <div className="pb-6">
            {guessLat == null && (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 mb-2">
                Kde byla pořízena tato fotka? Klikni na mapu a umísti svůj tip
              </p>
            )}
            <button
              onClick={handleSubmitGuess}
              disabled={guessLat == null}
              className="w-full rounded-xl bg-green-600 py-3 text-base font-semibold text-white
                         hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Potvrdit tip
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
