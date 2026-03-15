export default function AboutApp() {
  return (
    <details className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
      <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 list-none flex justify-between items-center select-none">
        O aplikaci
        <span className="text-gray-400 dark:text-gray-500 transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="mt-3 space-y-2 leading-relaxed">
        <p>
          Poznej Halenkovice je nezisková aplikace vytvořená pro zábavu a jako pocta obci
          Halenkovice. Nevzniká za ní žádný příjem ani komerční záměr.
        </p>
        <p>
          Úkolem je uhodnout místo, kde byla fotografie pořízena (ne co je na fotografii vyfoceno).
        </p>
        <p>
          Všechny fotografie použité ve hře jsou buď pořízeny autorem této aplikace, nebo pocházejí
          z fotogalerie webu{' '}
          <a href="https://www.halenkovice.cz" target="_blank" rel="noopener noreferrer"
             className="font-medium text-gray-700 dark:text-gray-300 hover:underline">
            www.halenkovice.cz
          </a>{' '}
          se svolením obce Halenkovice k jejich sdílení, nebo z volných zdrojů na internetu pod licencí{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">CC0 Public Domain</span> — tedy bez
          jakýchkoliv autorských omezení. U každé fotografie je uveden zdroj.
        </p>
      </div>
    </details>
  )
}
