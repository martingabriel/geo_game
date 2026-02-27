import { haversineMeters } from '@/lib/distance'
import type { Photo, ScoreTier } from '@/types/index'

export interface ScoreResult {
  distanceMeters: number
  tier: ScoreTier
  points: number
}

/**
 * Score a player's guess against the actual photo location.
 * - Distance ≤ perfectRadius → Perfect, 1000 pts
 * - Distance ≤ closeRadius  → Close,   500 pts
 * - Distance > closeRadius  → Far,     0 pts
 */
export function scoreGuess(
  guessLat: number,
  guessLng: number,
  photo: Photo
): ScoreResult {
  const distanceMeters = haversineMeters(guessLat, guessLng, photo.lat, photo.lng)

  let tier: ScoreTier
  let points: number

  if (distanceMeters <= photo.perfectRadius) {
    tier = 'Perfect'
    points = 1000
  } else if (distanceMeters <= photo.closeRadius) {
    tier = 'Close'
    points = 500
  } else {
    tier = 'Far'
    points = 0
  }

  return { distanceMeters, tier, points }
}
