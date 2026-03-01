'use client'

import { useState } from 'react'

interface RoundPhotoProps {
  filename: string
  roundNumber: number
  totalRounds: number
}

export default function RoundPhoto({ filename, roundNumber, totalRounds }: RoundPhotoProps) {
  const [zoomed, setZoomed] = useState(false)
  const [loadedFilename, setLoadedFilename] = useState<string | null>(null)

  const isLoading = loadedFilename !== filename

  return (
    <>
      {/* Normal view — click to zoom */}
      <div
        className="relative w-full rounded-xl overflow-hidden cursor-zoom-in"
        onClick={() => !isLoading && setZoomed(true)}
      >
        {/* Loading spinner shown while photo is fetching */}
        {isLoading && (
          <div className="w-full h-[32vh] bg-gray-100 rounded-xl flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Blurred background — hidden while loading to avoid showing stale photo */}
        {!isLoading && (
          <img
            src={`/img/${filename}`}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-80"
          />
        )}

        {/* Round badge */}
        <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs font-semibold
                        px-2.5 py-1 rounded-full backdrop-blur-sm">
          Kolo {roundNumber} z {totalRounds}
        </div>

        {/* Sharp photo — always in DOM so browser fetches it; hidden until loaded */}
        <img
          src={`/img/${filename}`}
          alt={`Kolo ${roundNumber} — uhádni místo`}
          onLoad={() => setLoadedFilename(filename)}
          className={isLoading ? 'hidden' : 'relative w-full object-contain max-h-[32vh]'}
        />
      </div>

      {/* Zoomed overlay — click to dismiss */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[2000] bg-black/85 flex items-center justify-center cursor-zoom-out px-4"
          onClick={() => setZoomed(false)}
        >
          <img
            src={`/img/${filename}`}
            alt={`Kolo ${roundNumber} — uhádni místo`}
            className="w-full max-w-2xl object-contain max-h-[90vh] rounded-xl"
          />
        </div>
      )}
    </>
  )
}
