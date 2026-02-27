import type { LeaderboardEntry } from '@/types/index'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
}

const RANK_STYLES = [
  'text-yellow-500 font-bold text-lg', // Gold
  'text-gray-400 font-bold text-lg',   // Silver
  'text-amber-600 font-bold text-lg',  // Bronze
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-3">🏆</p>
        <p className="font-medium">Zatím žádné výsledky — buď první!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-left">
            <th className="px-4 py-3 font-medium w-10">#</th>
            <th className="px-4 py-3 font-medium">Jméno</th>
            <th className="px-4 py-3 font-medium text-right">Skóre</th>
            <th className="px-4 py-3 font-medium text-right">Kola</th>
            <th className="px-4 py-3 font-medium text-right">Datum</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry, i) => (
            <tr key={`${entry.name}-${entry.date}-${i}`} className="bg-white hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <span className={RANK_STYLES[i] ?? 'text-gray-500'}>
                  {i + 1}
                </span>
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">{entry.name}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">{entry.score}</td>
              <td className="px-4 py-3 text-right text-gray-500">{entry.rounds}</td>
              <td className="px-4 py-3 text-right text-gray-400">{formatDate(entry.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
