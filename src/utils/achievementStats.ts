import type { AchievementStats } from '../types/user'

export type AchievementStoreKey = 'steam' | 'xbox' | 'playstation'

export interface StoreAchievement {
  /** Conquistas (Steam, Xbox) ou troféus (PlayStation). */
  count: number
  /** O mesmo número já formatado em pt-BR ("1.387"). */
  countText: string
  /** "conquista(s)" ou "troféu(s)". */
  word: string
  /** O número que só existe naquela loja: gamerscore ou platinas. */
  extra: string | null
  /** "1.387 conquistas", "837 conquistas · 15.250 G", "1.310 troféus · 0 platinas". */
  caption: string
  /** Texto para leitor de tela. */
  spoken: string
  /** Ressalva de como o número é contado, quando houver. */
  note: string | null
}

const n = (value: number) => value.toLocaleString('pt-BR')

const plural = (value: number, one: string, many: string) =>
  value === 1 ? one : many

/**
 * Número de conquistas de uma loja, ou `null` quando o backend ainda não tem
 * (conta não importada depois da migration): sem número é melhor que um
 * total parcial que parece completo.
 */
export function storeAchievement(
  key: AchievementStoreKey,
  stats?: AchievementStats
): StoreAchievement | null {
  if (key === 'steam' && stats?.steam) {
    const { achievements } = stats.steam
    const word = plural(achievements, 'conquista', 'conquistas')
    return {
      count: achievements,
      countText: n(achievements),
      word,
      extra: null,
      caption: word,
      spoken: `${n(achievements)} ${word}, só de jogos verificados na importação`,
      note: 'só jogos verificados na importação',
    }
  }
  if (key === 'xbox' && stats?.xbox) {
    const { achievements, gamerscore } = stats.xbox
    const word = plural(achievements, 'conquista', 'conquistas')
    const extra = `${n(gamerscore)} G`
    return {
      count: achievements,
      countText: n(achievements),
      word,
      extra,
      caption: `${word} · ${extra}`,
      spoken: `${n(achievements)} ${word}, ${n(gamerscore)} de gamerscore`,
      note: null,
    }
  }
  if (key === 'playstation' && stats?.psn) {
    const { trophies, platinum } = stats.psn
    const word = plural(trophies, 'troféu', 'troféus')
    const extra = `${n(platinum)} ${plural(platinum, 'platina', 'platinas')}`
    return {
      count: trophies,
      countText: n(trophies),
      word,
      extra,
      caption: `${word} · ${extra}`,
      spoken: `${n(trophies)} ${word}, ${extra}`,
      note: null,
    }
  }
  return null
}
