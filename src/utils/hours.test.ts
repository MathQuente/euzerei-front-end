import { describe, expect, it } from 'vitest'
import {
  NO_HOURS_LABEL,
  formatHours,
  formatHoursOrNone,
  formatHoursSpoken,
} from './hours'

const NBSP = '\u00a0'

describe('formatHours', () => {
  it.each([
    [0.02, '0,02'],
    [0.22, '0,22'],
    [13.05, '13,05'],
    [28.83, '28,83'],
    [3771.6, '3.771,6'],
    [1, '1'],
    [6.5, '6,5'],
    [0, '0'],
  ])('shows every stored decimal, up to two: %s', (hours, expected) => {
    expect(formatHours(hours)).toBe(`${expected}${NBSP}h`)
  })

  it('rounds beyond the two decimals the database keeps', () => {
    expect(formatHours(13.054)).toBe(`13,05${NBSP}h`)
  })
})

describe('formatHoursSpoken', () => {
  it.each([
    [0.22, '0,22 horas'],
    [13.05, '13,05 horas'],
    [1, '1 hora'],
  ])('%s -> %s', (hours, expected) => {
    expect(formatHoursSpoken(hours)).toBe(expected)
  })
})

describe('formatHoursOrNone', () => {
  it('says there are no hours instead of printing zero', () => {
    expect(formatHoursOrNone(null)).toBe(NO_HOURS_LABEL)
    expect(formatHoursOrNone(13.05)).toBe(`13,05${NBSP}h`)
  })
})
