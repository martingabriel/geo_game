import { getEntries } from '@/lib/leaderboard'
import LeaderboardTable from '@/components/LeaderboardTable'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const entries = await getEntries()

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🏆 Žebříček</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {entries.length} {entries.length === 1 ? 'hráč' : 'hráčů'} v žebříčku
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-green-600 font-medium hover:underline"
          >
            ← Hrát znovu
          </Link>
        </div>

        <LeaderboardTable entries={entries} />
      </div>
    </main>
  )
}
