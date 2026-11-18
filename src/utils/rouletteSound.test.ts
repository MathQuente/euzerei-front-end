import { describe, expect, it } from 'vitest'
import { easeOutSpin, finalRotation, indexUnderPointer } from './roulette'
import { SOUND, crossingTimes, tickShape } from './rouletteSound'

function spinFor(count: number, turns: number, jitter = 0.4) {
  const to = finalRotation(3, count, 0, turns, jitter)
  return { from: 0, to }
}

function crossedSlices(from: number, to: number, count: number) {
  const slice = 360 / count
  return Math.abs(Math.floor(-to / slice) - Math.floor(-from / slice))
}

describe('crossingTimes', () => {
  it.each([
    [24, 7, 7000],
    [12, 7, 7000],
    [6, 7, 7000],
    [24, 4, 4000],
    [12, 4, 4000],
    [6, 4, 4000],
  ])(
    'has one crossing per slice passed (%i slices, %i turns)',
    (count, turns, ms) => {
      const { from, to } = spinFor(count, turns)
      expect(crossingTimes(from, to, ms, count)).toHaveLength(
        crossedSlices(from, to, count)
      )
    }
  )

  it('goes forward in time, inside the spin, and ends before it stops', () => {
    const { from, to } = spinFor(24, 7)
    const crossings = crossingTimes(from, to, 7000, 24)
    for (let i = 1; i < crossings.length; i++) {
      expect(crossings[i].t).toBeGreaterThanOrEqual(crossings[i - 1].t)
    }
    expect(crossings[0].t).toBeGreaterThan(0)
    expect(crossings[crossings.length - 1].t).toBeLessThanOrEqual(7)
  })

  it('never speeds up after the start, and peaks around 80 slices per second', () => {
    const { from, to } = spinFor(24, 7)
    const speeds = crossingTimes(from, to, 7000, 24).map(c => c.speed)
    const peak = Math.max(...speeds)
    expect(peak).toBeGreaterThan(70)
    expect(peak).toBeLessThan(95)
    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]).toBeLessThanOrEqual(speeds[i - 1] + 1)
    }
  })

  it('puts every crossing exactly where the slice under the pointer changes', () => {
    const count = 12
    const { from, to } = spinFor(count, 7, 0)
    expect(indexUnderPointer(to, count)).toBe(3)
    const angleAt = (t: number) => from + (to - from) * easeOutSpin(t / 7)
    const crossings = crossingTimes(from, to, 7000, count)
    expect(crossings.length).toBeGreaterThan(0)
    for (const { t } of crossings.slice(0, 40)) {
      expect(indexUnderPointer(angleAt(t - 0.0005), count)).not.toBe(
        indexUnderPointer(angleAt(t), count)
      )
    }
  })

  it('has no crossings without a spin', () => {
    expect(crossingTimes(0, 1000, 0, 24)).toEqual([])
    expect(crossingTimes(0, 1000, 4000, 1)).toEqual([])
  })
})

describe('tickShape', () => {
  it('has no tonal body at full speed, and a body when slow', () => {
    expect(tickShape(80).bodyGain).toBe(0)
    expect(tickShape(200).bodyGain).toBe(0)
    expect(tickShape(2).bodyGain).toBeGreaterThan(0)
  })

  it('rises a little in pitch and loses a little gain with speed', () => {
    const slow = tickShape(2)
    const fast = tickShape(80)
    expect(fast.clickFreq).toBeGreaterThan(slow.clickFreq)
    expect(fast.clickGain).toBeLessThan(slow.clickGain)
    expect(fast.speedRatio).toBe(1)
  })

  it('keeps the click within the short range the references suggest', () => {
    expect(SOUND.clickSeconds).toBeGreaterThanOrEqual(0.008)
    expect(SOUND.clickSeconds).toBeLessThanOrEqual(0.02)
  })
})
