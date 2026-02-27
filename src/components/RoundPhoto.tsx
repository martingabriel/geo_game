interface RoundPhotoProps {
  filename: string
  roundNumber: number
  totalRounds: number
}

export default function RoundPhoto({ filename, roundNumber, totalRounds }: RoundPhotoProps) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden">
      {/* Blurred background to fill letterbox bars */}
      <img
        src={`/img/${filename}`}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-80"
      />

      {/* Round badge */}
      <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs font-semibold
                      px-2.5 py-1 rounded-full backdrop-blur-sm">
        Kolo {roundNumber} z {totalRounds}
      </div>

      {/* Sharp photo on top */}
      <img
        src={`/img/${filename}`}
        alt={`Kolo ${roundNumber} — uhádni místo`}
        className="relative w-full object-contain max-h-[32vh]"
      />
    </div>
  )
}
