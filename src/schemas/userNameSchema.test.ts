import { describe, expect, it } from 'vitest'
import { userNameSchema } from './userNameSchema'

describe('userNameSchema', () => {
  it('keeps the name exactly as typed, including lowercase', () => {
    expect(userNameSchema.parse('miyeonstan')).toBe('miyeonstan')
    expect(userNameSchema.parse('ana maria')).toBe('ana maria')
    expect(userNameSchema.parse('McDonald')).toBe('McDonald')
  })

  it('trims the ends only', () => {
    expect(userNameSchema.parse('  miyeonstan  ')).toBe('miyeonstan')
    expect(userNameSchema.parse('a  b')).toBe('a  b')
  })

  it('rejects an empty name and one made only of spaces', () => {
    expect(userNameSchema.safeParse('').success).toBe(false)
    expect(userNameSchema.safeParse('   ').success).toBe(false)
  })

  it('accepts 30 characters and rejects 31', () => {
    expect(userNameSchema.safeParse('a'.repeat(30)).success).toBe(true)
    expect(userNameSchema.safeParse('a'.repeat(31)).success).toBe(false)
  })
})
