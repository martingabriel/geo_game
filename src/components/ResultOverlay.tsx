import type { ScoreTier } from '@/types/index'

interface ResultOverlayProps {
  tier: ScoreTier
  distanceMeters: number
  points: number
  totalScore: number
}

const TIER_STYLES: Record<ScoreTier, { bg: string; label: string; emoji: string }> = {
  Perfect: { bg: 'bg-green-500 text-white', label: 'Perfektní!', emoji: '🎯' },
  Close: { bg: 'bg-yellow-400 text-black', label: 'Blízko!', emoji: '👍' },
  Far: { bg: 'bg-red-500 text-white', label: 'Daleko…', emoji: '😬' },
}

function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`
  return `${(metres / 1000).toFixed(1)} km`
}

export default function ResultOverlay({ tier, distanceMeters, points, totalScore }: ResultOverlayProps) {
  const { bg, label, emoji } = TIER_STYLES[tier]

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Tier badge */}
      <div className="flex items-center gap-3">
        <span className={`${bg} text-lg font-bold px-4 py-1.5 rounded-full`}>
          {emoji} {label}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-gray-500">Vzdálenost</span>
          <p className="font-semibold text-gray-900 text-base">{formatDistance(distanceMeters)}</p>
        </div>
        <div>
          <span className="text-gray-500">Toto kolo</span>
          <p className="font-semibold text-gray-900 text-base">+{points} b</p>
        </div>
        <div>
          <span className="text-gray-500">Celkem</span>
          <p className="font-semibold text-gray-900 text-base">{totalScore} b</p>
        </div>
      </div>
    </div>
  )
}
