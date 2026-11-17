import { describe, expect, it } from 'vitest'
import { formatMemberSince } from './memberSince'

describe('formatMemberSince', () => {
  it('shows month and year in pt-BR', () => {
    expect(formatMemberSince('2026-08-05T12:00:00.000Z')).toMatch(
      /^ago\.? de 2026$/
    )
  })

  it('returns null for an invalid date', () => {
    expect(formatMemberSince('not-a-date')).toBeNull()
  })
})
