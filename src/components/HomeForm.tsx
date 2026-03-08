'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Photo, GameSession } from '@/types/index'

interface HomeFormProps {
  photos: Photo[]
}

export default function HomeForm({ photos }: HomeFormProps) {
  const router = useRouter()
  const [roundChoice, setRoundChoice] = useState<10 | 'all'>(10)

  const roundOptions: Array<{ label: string; value: 10 | 'all' }> = []
  if (photos.length >= 10) roundOptions.push({ label: '10 kol', value: 10 })
  roundOptions.push({ label: 'Na 3 životy', value: 'all' })

  function handleStart() {
    const shuffled = [...photos].sort(() => Math.random() - 0.5)
    const count = roundChoice === 'all' ? shuffled.length : roundChoice
    const selected = shuffled.slice(0, count)

    const session: GameSession = {
      playerName: '',
      totalRounds: selected.length,
      photoIds: selected.map((p) => p.id),
      currentRound: 0,
      results: [],
      sessionId: crypto.randomUUID(),
      ...(roundChoice === 'all' ? { livesRemaining: 3 } : {}),
    }

    sessionStorage.setItem('gameSession', JSON.stringify(session))
    sessionStorage.setItem('gamePhotos', JSON.stringify(selected))
    router.push('/game')
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Round selector */}
      <div>
        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Herní mód</p>
        <div className="flex gap-2 flex-wrap">
          {roundOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRoundChoice(opt.value)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors
                ${roundChoice === opt.value
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-500'
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
        className="w-full rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white
                   transition-colors hover:bg-green-700"
      >
        Spustit hru
      </button>
    </div>
  )
}
