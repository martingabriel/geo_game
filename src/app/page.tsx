import { getPhotos } from '@/lib/photos'
import HomeForm from '@/components/HomeForm'
import Link from 'next/link'

export default async function Home() {
  const photos = await getPhotos()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            🗺️ Poznej Halenkovice
          </h1>
          <p className="text-gray-500">
            Poznáš, kde byly pořízeny tyto fotky? Uhádni místo na mapě!
          </p>
          <p className="text-sm text-gray-400">
            {photos.length} {photos.length === 1 ? 'fotka' : 'fotek'} v databázi
          </p>
        </div>

        {/* Promo quote */}
        <blockquote className="text-sm text-gray-500 italic border-l-4 border-green-400 pl-4 text-left">
          Kdo chce poznat Vídeň, mosí chodit týdeň…<br />
          Kdo chce poznat Halenkovice, mosí chodit 3 měsíce.
        </blockquote>

        {/* Form */}
        <HomeForm photos={photos} />

        {/* Leaderboard link */}
        <p className="text-sm text-gray-500">
          <Link href="/leaderboard" className="text-green-600 hover:underline font-medium">
            Žebříček →
          </Link>
        </p>
      </div>
    </main>
  )
}
