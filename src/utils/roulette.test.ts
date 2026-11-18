import { describe, expect, it } from 'vitest'
import {
  POINTER_PHYSICS,
  type PointerState,
  ROULETTE_COLORS,
  WHEEL_MAX,
  baseLabelFont,
  easeOutSpin,
  finalRotation,
  fitLabelFont,
  indexUnderPointer,
  isPointerSettled,
  paletteIndex,
  pickWinnerIndex,
  randomInt,
  stepPointer,
} from './roulette'

function sequence(...values: number[]) {
  let at = 0
  return () => values[Math.min(at++, values.length - 1)]
}

describe('randomInt', () => {
  it('keeps the value when it falls in the usable range', () => {
    expect(randomInt(10, () => 37)).toBe(7)
    expect(randomInt(1, () => 123456)).toBe(0)
  })

  it('throws away values that would favour the first numbers', () => {
    const next = sequence(0xffffffff, 5)
    expect(randomInt(3, next)).toBe(2)
  })

  it('refuses a size that is not a positive whole number', () => {
    expect(() => randomInt(0)).toThrow(RangeError)
    expect(() => randomInt(2.5)).toThrow(RangeError)
    expect(() => randomInt(-1)).toThrow(RangeError)
  })

  it('reaches every value with the same chance', () => {
    const counts = [0, 0, 0, 0, 0]
    const step = Math.floor(0x100000000 / 5000)
    for (let i = 0; i < 5000; i++) counts[randomInt(5, () => i * step)]++
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1)
  })

  it('works with the real secure source', () => {
    for (let i = 0; i < 200; i++) {
      const value = randomInt(24)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(24)
    }
  })
})

describe('pickWinnerIndex', () => {
  const games = [{ igdbId: 10 }, { igdbId: 20 }, { igdbId: 30 }]

  it('never picks the game that just won', () => {
    for (let n = 0; n < 40; n++) {
      expect(pickWinnerIndex(games, 20, () => n * 99991)).not.toBe(1)
    }
  })

  it('can pick any game when there was no previous winner', () => {
    const seen = new Set<number>()
    for (let n = 0; n < 60; n++) {
      seen.add(pickWinnerIndex(games, null, () => n * 71993))
    }
    expect([...seen].sort()).toEqual([0, 1, 2])
  })

  it('falls back to the only game when it is also the last winner', () => {
    expect(pickWinnerIndex([{ igdbId: 5 }], 5, () => 0)).toBe(0)
  })
})

describe('finalRotation and indexUnderPointer', () => {
  it('stops with the chosen slice under the pointer, for any size and start', () => {
    for (let count = 2; count <= WHEEL_MAX; count++) {
      for (const current of [0, 1234.5, -77, 359.9, 10000]) {
        for (const jitter of [-1, -0.4, 0, 0.7, 1]) {
          for (let index = 0; index < count; index++) {
            const target = finalRotation(index, count, current, 7, jitter)
            expect(indexUnderPointer(target, count)).toBe(index)
          }
        }
      }
    }
  })

  it('always turns forward by at least the requested full turns', () => {
    for (const current of [0, 200, 12345]) {
      const target = finalRotation(3, 8, current, 4, 0)
      expect(target - current).toBeGreaterThanOrEqual(4 * 360)
      expect(target - current).toBeLessThan(5 * 360)
    }
  })

  it('reads the slice under the pointer from the rotation', () => {
    expect(indexUnderPointer(0, 4)).toBe(0)
    expect(indexUnderPointer(-90, 4)).toBe(1)
    expect(indexUnderPointer(-359, 4)).toBe(3)
    expect(indexUnderPointer(720.5, 4)).toBe(3)
  })
})

describe('easeOutSpin', () => {
  it('starts at 0, ends at 1 and only ever slows down', () => {
    expect(easeOutSpin(0)).toBe(0)
    expect(easeOutSpin(1)).toBe(1)
    let previousStep = Number.POSITIVE_INFINITY
    let previous = 0
    for (let i = 1; i <= 20; i++) {
      const value = easeOutSpin(i / 20)
      const step = value - previous
      expect(step).toBeLessThanOrEqual(previousStep + 1e-9)
      previousStep = step
      previous = value
    }
  })

  it('stays between 0 and 1 even when the progress overshoots', () => {
    expect(easeOutSpin(1.0001)).toBe(1)
    expect(easeOutSpin(-0.5)).toBe(0)
  })
})

describe('paletteIndex', () => {
  it('never gives the same colour to two neighbouring slices, including the wrap', () => {
    for (let count = 2; count <= WHEEL_MAX; count++) {
      for (let i = 0; i < count; i++) {
        const here = paletteIndex(i, count)
        const next = paletteIndex((i + 1) % count, count)
        expect(here).not.toBe(next)
        expect(here).toBeLessThan(ROULETTE_COLORS.length)
      }
    }
  })
})

describe('label font', () => {
  it('shrinks with crowded slices and never passes the size cap', () => {
    expect(baseLabelFont(560, 270, 8)).toBeCloseTo(28, 5)
    expect(baseLabelFont(560, 270, 24)).toBeLessThan(baseLabelFont(560, 270, 8))
  })

  it('keeps the font when the longest name fits', () => {
    expect(fitLabelFont(20, 100, 150)).toBe(20)
  })

  it('shrinks in proportion but never below 62% of the base', () => {
    expect(fitLabelFont(20, 200, 150)).toBeCloseTo(15, 5)
    expect(fitLabelFont(20, 1000, 150)).toBeCloseTo(12.4, 5)
  })
})

describe('stepPointer', () => {
  const rest = { angle: 0, velocity: 0 }

  function run(state: PointerState, seconds: number, kicksPerSecond = 0) {
    let current = state
    const frames = Math.round(seconds * 60)
    let owed = 0
    let peak = 0
    for (let i = 0; i < frames; i++) {
      owed += kicksPerSecond / 60
      const kicks = Math.floor(owed)
      owed -= kicks
      current = stepPointer(current, 1 / 60, kicks)
      peak = Math.max(peak, current.angle)
    }
    return { current, peak }
  }

  it('stays still when nothing hits it', () => {
    expect(run(rest, 1).current).toEqual(rest)
  })

  it('swings forward on one hit and comes back to rest', () => {
    const hit = stepPointer(rest, 1 / 60, 1)
    expect(hit.angle).toBeGreaterThan(0)
    const { current, peak } = run(hit, 1.5)
    expect(peak).toBeGreaterThan(hit.angle)
    expect(isPointerSettled(current)).toBe(true)
  })

  it('never goes past its stop, even with a hit on every frame', () => {
    const { peak } = run(rest, 2, 360)
    expect(peak).toBeLessThanOrEqual(POINTER_PHYSICS.maxDeflection)
  })

  it('stays pressed near the stop at a high rate and relaxes at a low one', () => {
    const fast = run(rest, 2, 80).current.angle
    const slow = run(rest, 2, 3).current.angle
    expect(fast).toBeGreaterThan(POINTER_PHYSICS.maxDeflection * 0.4)
    expect(slow).toBeLessThan(fast)
  })

  it('never swings backwards past the rest position', () => {
    const { current } = run(stepPointer(rest, 1 / 60, 2), 2)
    expect(current.angle).toBeGreaterThanOrEqual(0)
  })
})

describe('isPointerSettled', () => {
  it('needs both a tiny angle and a tiny speed', () => {
    expect(isPointerSettled({ angle: 0.01, velocity: 0.2 })).toBe(true)
    expect(isPointerSettled({ angle: 3, velocity: 0 })).toBe(false)
    expect(isPointerSettled({ angle: 0, velocity: 50 })).toBe(false)
  })
})
