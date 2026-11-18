import { describe, expect, it } from 'vitest'
import { confettiOpacity, spawnConfetti, stepConfetti } from './confetti'

const COLORS = ['#111111', '#222222', '#333333']

describe('confetti', () => {
  it('spawns a rain from above the screen plus a jet from the middle', () => {
    const pieces = spawnConfetti(1000, 800, COLORS)
    expect(pieces).toHaveLength(320)
    const rain = pieces.slice(0, 230)
    const jet = pieces.slice(230)
    expect(rain.every(p => p.y < 0 && p.x >= 0 && p.x <= 1000)).toBe(true)
    expect(jet.every(p => p.x === 500 && p.vy < 0)).toBe(true)
    expect(jet[0].y).toBeCloseTo(440, 5)
  })

  it('only uses the colours it was given', () => {
    const pieces = spawnConfetti(400, 700, COLORS)
    expect(pieces.every(p => COLORS.includes(p.color))).toBe(true)
  })

  it('lets every piece die: by age or by leaving the screen', () => {
    const pieces = spawnConfetti(1000, 800, COLORS)
    for (const piece of pieces) {
      let frames = 0
      while (stepConfetti(piece, 1, 800)) {
        frames++
        expect(frames).toBeLessThan(500)
      }
    }
  })

  it('fades only near the end of its life', () => {
    const [piece] = spawnConfetti(1000, 800, COLORS)
    piece.age = piece.life * 0.5
    expect(confettiOpacity(piece)).toBe(1)
    piece.age = piece.life * 0.9
    expect(confettiOpacity(piece)).toBeCloseTo(0.5, 5)
    piece.age = piece.life
    expect(confettiOpacity(piece)).toBeCloseTo(0, 5)
  })
})
