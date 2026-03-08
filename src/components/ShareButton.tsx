'use client'

import { useState } from 'react'
import { generateShareCard, type ShareCardData } from '@/lib/shareCard'

type Props = Omit<ShareCardData, 'gameUrl'>

export default function ShareButton(props: Props) {
  const [state, setState] = useState<'idle' | 'generating' | 'done'>('idle')

  async function handleShare() {
    setState('generating')
    try {
      const gameUrl = window.location.origin
      const blob = await generateShareCard({ ...props, gameUrl })
      const file = new File([blob], 'vysledek.png', { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Poznej Halenkovice',
          text: `${props.playerName}: ${props.score} / ${props.maxScore} bodů`,
        })
      } else {
        // Fallback: trigger download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'vysledek.png'
        a.click()
        URL.revokeObjectURL(url)
      }
      setState('done')
    } catch {
      setState('idle')
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={!props.playerName || state === 'generating'}
      className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-green-600
                 bg-white text-green-700 font-semibold py-3 text-sm
                 hover:bg-green-50 active:bg-green-100 disabled:opacity-50 transition-colors"
    >
      {state === 'generating' ? (
        <>
          <span className="w-4 h-4 border-2 border-green-400 border-t-green-700 rounded-full animate-spin" />
          Připravuji obrázek…
        </>
      ) : state === 'done' ? (
        <>✓ Obrázek připraven</>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               className="w-4 h-4">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Sdílet výsledek
        </>
      )}
    </button>
  )
}
