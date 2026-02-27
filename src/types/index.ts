export interface Photo {
  id: string
  filename: string
  lat: number
  lng: number
  perfectRadius: number
  closeRadius: number
}

export type ScoreTier = 'Perfect' | 'Close' | 'Far'

export interface RoundResult {
  photoId: string
  filename: string
  guessLat: number
  guessLng: number
  distanceMeters: number
  tier: ScoreTier
  points: number
}

export interface GameSession {
  playerName: string
  totalRounds: number
  photoIds: string[]
  currentRound: number
  results: RoundResult[]
}

export interface LeaderboardEntry {
  name: string
  score: number
  rounds: number
  date: string
}
