import { getPhotos } from '@/lib/photos'
import HomeForm from '@/components/HomeForm'
import HowToPlay from '@/components/HowToPlay'
import AboutApp from '@/components/AboutApp'
import DarkModeToggle from '@/components/DarkModeToggle'
import Link from 'next/link'

export default async function Home() {
  const photos = await getPhotos()

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">

        {/* Dark mode toggle — top right, no overlap */}
        <div className="flex justify-end">
          <DarkModeToggle />
        </div>

        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Poznej Halenkovice
          </h1>
          <img
            src="/halenkovice_prapor.jpg"
            alt="Prapor obce Halenkovice"
            className="h-28 w-auto drop-shadow-lg mx-auto"
          />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Poznáš, kde byly pořízeny tyto fotky? Uhádni místo na mapě!
          </p>
        </div>

        {/* Promo quote */}
        <blockquote className="text-sm text-gray-500 dark:text-gray-400 italic border-l-4 border-blue-300 dark:border-blue-600 pl-4">
          Kdo chce poznat Vídeň, mosí chodit týdeň…<br />
          Kdo chce poznat Halenkovice, mosí chodit 3 měsíce.
        </blockquote>

        {/* Form card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 px-6 py-7">
          <HomeForm photos={photos} />
        </div>

        <HowToPlay />
        <AboutApp />

        {/* Footer row */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 px-1">
          <span>{photos.length} fotek v databázi</span>
          <Link href="/leaderboard" className="text-green-600 hover:underline font-medium text-sm">
            Žebříček →
          </Link>
        </div>

        {/* Author */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
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
