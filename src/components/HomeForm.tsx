'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Photo, GameSession } from '@/types/index'

interface HomeFormProps {
  photos: Photo[]
}

export default function HomeForm({ photos }: HomeFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [roundChoice, setRoundChoice] = useState<10 | 'all'>(10)

  const roundOptions: Array<{ label: string; value: 10 | 'all' }> = []
  if (photos.length >= 10) roundOptions.push({ label: '10 kol', value: 10 })
  roundOptions.push({ label: 'Na přežití ❤️❤️❤️', value: 'all' })

  function handleStart() {
    if (!name.trim()) return

    const shuffled = [...photos].sort(() => Math.random() - 0.5)
    const count = roundChoice === 'all' ? shuffled.length : roundChoice
    const selected = shuffled.slice(0, count)

    const session: GameSession = {
      playerName: name.trim(),
      totalRounds: selected.length,
      photoIds: selected.map((p) => p.id),
      currentRound: 0,
      results: [],
      ...(roundChoice === 'all' ? { livesRemaining: 3 } : {}),
    }

    sessionStorage.setItem('gameSession', JSON.stringify(session))
    sessionStorage.setItem('gamePhotos', JSON.stringify(selected))
    router.push('/game')
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Name input */}
      <div>
        <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
          Tvoje jméno
        </label>
        <input
          id="playerName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          placeholder="Zadej svoje jméno…"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          autoFocus
        />
      </div>

      {/* Round selector */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Herní mód</p>
        <div className="flex gap-2 flex-wrap">
          {roundOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRoundChoice(opt.value)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors
                ${roundChoice === opt.value
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        type="button"
        onClick={handleStart}
        disabled={!name.trim()}
        className="w-full rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white
                   transition-colors hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Spustit hru
      </button>
    </div>
  )
}
