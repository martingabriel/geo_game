import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://poznej-halenkovice.online'),
  title: 'Poznej Halenkovice',
  description: 'Poznáš, kde byly pořízeny tyto fotky z Halenkovic?',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
