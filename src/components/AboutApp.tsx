export default function AboutApp() {
  return (
    <details className="group rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm text-gray-600">
      <summary className="cursor-pointer font-medium text-gray-700 list-none flex justify-between items-center select-none">
        O aplikaci
        <span className="text-gray-400 transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="mt-3 space-y-2 leading-relaxed">
        <p>
          Poznej Halenkovice je nezisková aplikace vytvořená pro zábavu a jako pocta obci
          Halenkovice. Nevzniká za ní žádný příjem ani komerční záměr.
        </p>
        <p>
          Všechny fotografie použité ve hře jsou buď pořízeny autorem této aplikace, nebo
          pocházejí z volných zdrojů na internetu pod licencí{' '}
          <span className="font-medium text-gray-700">CC0 Public Domain</span> — tedy bez
          jakýchkoliv autorských omezení.
        </p>
      </div>
    </details>
  )
}
