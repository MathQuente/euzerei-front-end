import { describe, expect, it } from 'vitest'
import { userNameSchema } from './userNameSchema'

describe('userNameSchema', () => {
  it('lowercases and trims what was typed', () => {
    expect(userNameSchema.parse('  McDonald  ')).toBe('mcdonald')
    expect(userNameSchema.parse('miyeon_stan-2')).toBe('miyeon_stan-2')
  })

  it('rejects an empty name and one made only of spaces', () => {
    expect(userNameSchema.safeParse('').success).toBe(false)
    expect(userNameSchema.safeParse('   ').success).toBe(false)
  })

  it('rejects spaces, accents and symbols', () => {
    for (const bad of ['ana maria', 'joão', 'ana!', 'ana.maria']) {
      expect(userNameSchema.safeParse(bad).success).toBe(false)
    }
  })

  it('requires a letter or number on both ends', () => {
    expect(userNameSchema.safeParse('-ana').success).toBe(false)
    expect(userNameSchema.safeParse('ana_').success).toBe(false)
  })

  it('accepts 3 to 30 characters', () => {
    expect(userNameSchema.safeParse('ab').success).toBe(false)
    expect(userNameSchema.safeParse('abc').success).toBe(true)
    expect(userNameSchema.safeParse('a'.repeat(30)).success).toBe(true)
    expect(userNameSchema.safeParse('a'.repeat(31)).success).toBe(false)
  })

  it('rejects names that clash with a route', () => {
    expect(userNameSchema.safeParse('me').success).toBe(false)
    expect(userNameSchema.safeParse('Roulette').success).toBe(false)
  })
})
