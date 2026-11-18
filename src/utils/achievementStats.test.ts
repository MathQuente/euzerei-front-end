import { describe, expect, it } from 'vitest'
import type { AchievementStats } from '../types/user'
import { storeAchievement } from './achievementStats'

const stats: AchievementStats = {
  steam: { achievements: 1387 },
  xbox: { gamerscore: 15250, achievements: 837 },
  psn: { trophies: 1310, platinum: 0 },
}

describe('storeAchievement', () => {
  it('shows the Steam count and warns that only verified games count', () => {
    const steam = storeAchievement('steam', stats)
    expect(steam?.count).toBe(1387)
    expect(steam?.countText).toBe('1.387')
    expect(steam?.caption).toBe('conquistas')
    expect(steam?.extra).toBeNull()
    expect(steam?.note).toBe('só jogos verificados na importação')
    expect(steam?.spoken).toContain('1.387 conquistas')
  })

  it('shows Xbox achievements with the gamerscore next to them', () => {
    const xbox = storeAchievement('xbox', stats)
    expect(xbox?.count).toBe(837)
    expect(xbox?.countText).toBe('837')
    expect(xbox?.caption).toBe('conquistas · 15.250 G')
    expect(xbox?.spoken).toBe('837 conquistas, 15.250 de gamerscore')
  })

  it('shows PlayStation trophies with the platinum count, even when it is 0', () => {
    const psn = storeAchievement('playstation', stats)
    expect(psn?.count).toBe(1310)
    expect(psn?.countText).toBe('1.310')
    expect(psn?.caption).toBe('troféus · 0 platinas')
  })

  it('uses the singular for exactly one', () => {
    const one: AchievementStats = {
      steam: { achievements: 1 },
      xbox: { gamerscore: 1, achievements: 1 },
      psn: { trophies: 1, platinum: 1 },
    }
    expect(storeAchievement('steam', one)?.caption).toBe('conquista')
    expect(storeAchievement('xbox', one)?.caption).toBe('conquista · 1 G')
    expect(storeAchievement('playstation', one)?.caption).toBe(
      'troféu · 1 platina'
    )
  })

  it('keeps a real zero as a number instead of treating it as missing', () => {
    const zero: AchievementStats = {
      steam: { achievements: 0 },
      xbox: { gamerscore: 0, achievements: 0 },
      psn: { trophies: 0, platinum: 0 },
    }
    expect(storeAchievement('steam', zero)?.count).toBe(0)
    expect(storeAchievement('xbox', zero)?.caption).toBe('conquistas · 0 G')
  })

  it('gives nothing for a store without numbers, or without stats at all', () => {
    const partial: AchievementStats = { ...stats, xbox: null }
    expect(storeAchievement('xbox', partial)).toBeNull()
    expect(storeAchievement('steam', partial)?.count).toBe(1387)
    expect(storeAchievement('steam', undefined)).toBeNull()
    expect(
      storeAchievement('playstation', { steam: null, xbox: null, psn: null })
    ).toBeNull()
  })
})
