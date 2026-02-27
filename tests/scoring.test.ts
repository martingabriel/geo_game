import { describe, it, expect } from 'vitest'
import { scoreGuess } from '@/lib/scoring'
import type { Photo } from '@/types/index'

const testPhoto: Photo = {
  id: 'test_photo',
  filename: 'test.png',
  lat: 49.176,
  lng: 17.457,
  perfectRadius: 50,
  closeRadius: 200,
}

describe('scoreGuess', () => {
  it('returns Perfect and 1000pts when guess is exactly on the photo location', () => {
    const result = scoreGuess(testPhoto.lat, testPhoto.lng, testPhoto)
    expect(result.tier).toBe('Perfect')
    expect(result.points).toBe(1000)
    expect(result.distanceMeters).toBeCloseTo(0, 1)
  })

  it('returns Perfect when within perfectRadius', () => {
    // ~30 metres north (~0.00027 degrees latitude ≈ 30m)
    const result = scoreGuess(49.1762695, 17.457, testPhoto)
    expect(result.distanceMeters).toBeLessThanOrEqual(testPhoto.perfectRadius)
    expect(result.tier).toBe('Perfect')
    expect(result.points).toBe(1000)
  })

  it('returns Close when just outside perfectRadius but within closeRadius', () => {
    // ~100 metres north (~0.0009 degrees latitude ≈ 100m)
    const result = scoreGuess(49.1769, 17.457, testPhoto)
    expect(result.distanceMeters).toBeGreaterThan(testPhoto.perfectRadius)
    expect(result.distanceMeters).toBeLessThanOrEqual(testPhoto.closeRadius)
    expect(result.tier).toBe('Close')
    expect(result.points).toBe(500)
  })

  it('returns Far when beyond closeRadius', () => {
    // ~500 metres away
    const result = scoreGuess(49.180, 17.457, testPhoto)
    expect(result.distanceMeters).toBeGreaterThan(testPhoto.closeRadius)
    expect(result.tier).toBe('Far')
    expect(result.points).toBe(100)
  })

  it('returns Far for very large distance', () => {
    const result = scoreGuess(0, 0, testPhoto)
    expect(result.tier).toBe('Far')
    expect(result.points).toBe(100)
    expect(result.distanceMeters).toBeGreaterThan(1000000)
  })

  it('distanceMeters is always non-negative', () => {
    const result = scoreGuess(0, 0, testPhoto)
    expect(result.distanceMeters).toBeGreaterThanOrEqual(0)
  })
})
