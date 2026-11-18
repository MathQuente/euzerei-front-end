import { describe, expect, it } from 'vitest'
import {
  NO_HOURS_LABEL,
  formatHours,
  formatHoursCompact,
  formatHoursOrNone,
  formatHoursSpoken,
  isUnderOneHour,
  playedWord,
  sanitizeHoursInput,
} from './hours'

const NBSP = '\u00a0'

describe('formatHours', () => {
  it.each([
    [4.22, '4,2'],
    [13.05, '13,1'],
    [28.83, '28,8'],
    [3771.6, '3.771,6'],
    [1, '1'],
    [6.5, '6,5'],
    [0, '0'],
  ])(
    'uses one decimal, and "<0,1" for almost nothing: %s',
    (hours, expected) => {
      expect(formatHours(hours)).toBe(`${expected}${NBSP}h`)
    }
  )

  it.each([
    [0.77, '46'],
    [0.8, '48'],
    [0.22, '13'],
    [0.5, '30'],
    [0.02, '1'],
  ])('shows minutes under one hour: %s h -> %s min', (hours, minutes) => {
    expect(formatHours(hours)).toBe(`${minutes}${NBSP}min`)
  })

  it('does not show zero minutes for almost nothing', () => {
    expect(formatHours(0.001)).toBe(`<1${NBSP}min`)
  })

  it('keeps one hour as hours when minutes round up to 60', () => {
    expect(formatHours(0.999)).toBe(`1${NBSP}h`)
  })

  it('rounds to one decimal', () => {
    expect(formatHours(13.054)).toBe(`13,1${NBSP}h`)
  })
})

describe('formatHoursCompact', () => {
  it('uses minutes under one hour', () => {
    expect(formatHoursCompact(0.4)).toBe(`24${NBSP}min`)
  })

  it.each([
    [3771.78, '3.772'],
    [12.5, '13'],
    [0, '0'],
  ])('rounds to whole hours: %s', (hours, expected) => {
    expect(formatHoursCompact(hours)).toBe(`${expected}${NBSP}h`)
  })
})

describe('formatHoursSpoken', () => {
  it.each([
    [0.77, '46 minutos'],
    [0.0167, '1 minuto'],
    [0.001, 'menos de 1 minuto'],
    [13.05, '13,1 horas'],
    [1, '1 hora'],
  ])('%s -> %s', (hours, expected) => {
    expect(formatHoursSpoken(hours)).toBe(expected)
  })
})

describe('formatHoursOrNone', () => {
  it('says there are no hours instead of printing zero', () => {
    expect(formatHoursOrNone(null)).toBe(NO_HOURS_LABEL)
    expect(formatHoursOrNone(13.05)).toBe(`13,1${NBSP}h`)
  })
})

describe('playedWord', () => {
  it.each([
    [0.77, 'jogados'],
    [0.001, 'jogados'],
    [1, 'jogadas'],
    [4.22, 'jogadas'],
    [0.999, 'jogadas'],
  ])('%s h -> %s', (hours, expected) => {
    expect(playedWord(hours)).toBe(expected)
  })
})

describe('isUnderOneHour', () => {
  it('is true only for a positive time that shows up as minutes', () => {
    expect(isUnderOneHour(0.03)).toBe(true)
    expect(isUnderOneHour(0.77)).toBe(true)
    expect(isUnderOneHour(0)).toBe(false)
    expect(isUnderOneHour(1)).toBe(false)
    expect(isUnderOneHour(4.2)).toBe(false)
    expect(isUnderOneHour(0.999)).toBe(false)
  })
})

describe('sanitizeHoursInput', () => {
  it('keeps a single decimal place', () => {
    expect(sanitizeHoursInput('5.53')).toBe('5.5')
    expect(sanitizeHoursInput('5,53')).toBe('5,5')
    expect(sanitizeHoursInput('5.5')).toBe('5.5')
    expect(sanitizeHoursInput('5.')).toBe('5.')
    expect(sanitizeHoursInput('12')).toBe('12')
  })

  it('drops leading zeros but keeps 0.5', () => {
    expect(sanitizeHoursInput('007')).toBe('7')
    expect(sanitizeHoursInput('0.55')).toBe('0.5')
  })
})
