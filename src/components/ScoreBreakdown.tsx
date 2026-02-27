import type { RoundResult, ScoreTier } from '@/types/index'

interface ScoreBreakdownProps {
  results: RoundResult[]
  playerName: string
}

const TIER_BADGE: Record<ScoreTier, string> = {
  Perfect: 'bg-green-500 text-white',
  Close: 'bg-yellow-400 text-black',
  Far: 'bg-red-500 text-white',
}

const TIER_LABEL: Record<ScoreTier, string> = {
  Perfect: 'Perfektní',
  Close: 'Blízko',
  Far: 'Daleko',
}

function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`
  return `${(metres / 1000).toFixed(1)} km`
}

export default function ScoreBreakdown({ results, playerName }: ScoreBreakdownProps) {
  const total = results.reduce((sum, r) => sum + r.points, 0)
  const maxPossible = results.length * 1000

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <p className="text-gray-500 text-sm">Konec hry, {playerName}!</p>
        <p className="text-4xl font-bold text-gray-900">{total} b</p>
        <p className="text-sm text-gray-400">z {maxPossible} možných</p>
      </div>

      {/* Breakdown table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-left">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Foto</th>
              <th className="px-4 py-2 font-medium">Vzdálenost</th>
              <th className="px-4 py-2 font-medium">Výsledek</th>
              <th className="px-4 py-2 font-medium text-right">Body</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((r, i) => (
              <tr key={r.photoId} className="bg-white">
                <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                <td className="px-4 py-2">
                  <img
                    src={`/img/${r.filename}`}
                    alt={`Kolo ${i + 1}`}
                    className="h-10 w-16 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-2 text-gray-700">{formatDistance(r.distanceMeters)}</td>
                <td className="px-4 py-2">
                  <span className={`${TIER_BADGE[r.tier]} text-xs font-semibold px-2 py-0.5 rounded-full`}>
                    {TIER_LABEL[r.tier]}
                  </span>
                </td>
                <td className="px-4 py-2 text-right font-semibold text-gray-900">
                  {r.points}
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="bg-gray-50 font-semibold">
              <td colSpan={4} className="px-4 py-2 text-gray-700">Celkem</td>
              <td className="px-4 py-2 text-right text-gray-900">{total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
