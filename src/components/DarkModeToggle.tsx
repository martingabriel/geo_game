'use client'

import { useTheme } from '@/components/ThemeProvider'

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
      className="rounded-full border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm
                 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                 transition-colors"
    >
      {theme === 'dark' ? 'Světlý režim' : 'Tmavý režim'}
    </button>
  )
}
