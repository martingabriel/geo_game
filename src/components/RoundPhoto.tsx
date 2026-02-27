interface RoundPhotoProps {
  filename: string
  roundNumber: number
  totalRounds: number
}

export default function RoundPhoto({ filename, roundNumber, totalRounds }: RoundPhotoProps) {
  return (
    <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden">
      {/* Round badge */}
      <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs font-semibold
                      px-2.5 py-1 rounded-full backdrop-blur-sm">
        Kolo {roundNumber} z {totalRounds}
      </div>

      {/* Photo */}
      <img
        src={`/img/${filename}`}
        alt={`Kolo ${roundNumber} — uhádni místo`}
        className="w-full object-contain max-h-[25vh]"
      />
    </div>
  )
}
