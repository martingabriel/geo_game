'use client'

import { useTheme } from '@/components/ThemeProvider'

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
      className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400
                 dark:hover:bg-gray-700 transition-colors"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
