import { describe, it, expect } from 'vitest'
import { haversineMeters } from '@/lib/distance'

describe('haversineMeters', () => {
  it('returns 0 for the same point', () => {
    expect(haversineMeters(49.176, 17.457, 49.176, 17.457)).toBe(0)
  })

  it('returns approximately 111km for 1 degree of latitude', () => {
    const dist = haversineMeters(0, 0, 1, 0)
    // 1 degree of latitude ≈ 111,195 metres
    expect(dist).toBeGreaterThan(111000)
    expect(dist).toBeLessThan(111500)
  })

  it('is always non-negative', () => {
    const cases: [number, number, number, number][] = [
      [49.176, 17.457, 48.0, 16.0],
      [0, 0, -1, -1],
      [-90, -180, 90, 180],
    ]
    for (const [lat1, lng1, lat2, lng2] of cases) {
      expect(haversineMeters(lat1, lng1, lat2, lng2)).toBeGreaterThanOrEqual(0)
    }
  })

  it('is symmetric (A→B equals B→A)', () => {
    const d1 = haversineMeters(49.176, 17.457, 49.17717, 17.4575)
    const d2 = haversineMeters(49.17717, 17.4575, 49.176, 17.457)
    expect(d1).toBeCloseTo(d2, 5)
  })
})
