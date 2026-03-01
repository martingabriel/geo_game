import { getPhotos } from '@/lib/photos'
import HomeForm from '@/components/HomeForm'
import HowToPlay from '@/components/HowToPlay'
import AboutApp from '@/components/AboutApp'
import Link from 'next/link'

export default async function Home() {
  const photos = await getPhotos()

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/halenkovice_znak.png"
              alt="Znak obce Halenkovice"
              className="h-28 w-auto drop-shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Poznej Halenkovice
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              Poznáš, kde byly pořízeny tyto fotky? Uhádni místo na mapě!
            </p>
          </div>
        </div>

        {/* Promo quote */}
        <blockquote className="text-sm text-gray-500 italic border-l-4 border-blue-300 pl-4">
          Kdo chce poznat Vídeň, mosí chodit týdeň…<br />
          Kdo chce poznat Halenkovice, mosí chodit 3 měsíce.
        </blockquote>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-7">
          <HomeForm photos={photos} />
        </div>

        <HowToPlay />
        <AboutApp />

        {/* Footer row */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span>{photos.length} fotek v databázi</span>
          <Link href="/leaderboard" className="text-green-600 hover:underline font-medium text-sm">
            Žebříček →
          </Link>
        </div>

        {/* Author */}
        <p className="text-center text-xs text-gray-400">
          Autor:{' '}
          <a href="https://martingabriel.cz" target="_blank" rel="noopener noreferrer"
             className="hover:underline">
            martingabriel.cz
          </a>
        </p>

      </div>
    </main>
  )
}
