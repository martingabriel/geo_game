export default function HowToPlay() {
  return (
    <details className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
      <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 list-none flex justify-between items-center select-none">
        Jak se hraje?
        <span className="text-gray-400 dark:text-gray-500 transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="mt-3 space-y-3">
        <p>
          Zobrazí se fotka pořízená někde v obci. Klikni na mapu a umísti svůj tip co nejblíže
          skutečnému místu, pak potvrď tip. Úkolem je uhodnout místo, kde byla fotografie pořízena
          (ne co je na fotografii vyfoceno).
        </p>

        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Bodování</p>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-1 pr-3">
                  <span className="inline-block rounded-full bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5">
                    Perfektní
                  </span>
                </td>
                <td className="py-1 text-gray-500 dark:text-gray-400">do 50 m</td>
                <td className="py-1 text-right font-medium text-gray-700 dark:text-gray-300">1 000 bodů</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-1 pr-3">
                  <span className="inline-block rounded-full bg-yellow-400 text-black text-[10px] font-semibold px-2 py-0.5">
                    Blízko
                  </span>
                </td>
                <td className="py-1 text-gray-500 dark:text-gray-400">50–200 m</td>
                <td className="py-1 text-right font-medium text-gray-700 dark:text-gray-300">500–1 000 bodů</td>
              </tr>
              <tr>
                <td className="py-1 pr-3">
                  <span className="inline-block rounded-full bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5">
                    Daleko
                  </span>
                </td>
                <td className="py-1 text-gray-500 dark:text-gray-400">více než 200 m</td>
                <td className="py-1 text-right font-medium text-gray-700 dark:text-gray-300">0 bodů</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            V pásmu Blízko se body počítají lineárně — čím blíže 50 m, tím více bodů (až 1 000),
            čím blíže 200 m, tím méně (až 500).
          </p>
        </div>

        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Herní módy</p>
          <ul className="space-y-1">
            <li>
              <span className="font-medium">10 kol</span> — 10 náhodných fotek, maximálně
              10 000 bodů.
            </li>
            <li>
              <span className="font-medium">Na 3 životy</span> — hraješ všechny fotky; každý tip
              hodnocený „Daleko" tě stojí jeden život ❤️. Ztratíš-li všechny tři, hra končí.
            </li>
          </ul>
        </div>
      </div>
    </details>
  )
}
