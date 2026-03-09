import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  metadataBase: new URL('https://poznej-halenkovice.cz'),
  title: 'Poznej Halenkovice',
  description: 'Poznáš, kde byly pořízeny tyto fotky z Halenkovic?',
  icons: { icon: '/halenkovice_znak.png' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <head>
        {/* Prevent flash of light mode when dark theme is saved in localStorage */}
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch{}` }} />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
