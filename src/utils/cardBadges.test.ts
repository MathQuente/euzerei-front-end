import { describe, expect, it } from 'vitest'
import {
  cardSummary,
  completionsText,
  countsCompletions,
  isHundredPercent,
  replayBadgeCount,
} from './cardBadges'

describe('replayBadgeCount', () => {
  it.each(['PLAYED', 'BACKLOG', 'PLAYING', 'PAUSED', 'DROPPED'])(
    'hides the count in %s until the second time',
    status => {
      expect(replayBadgeCount(status, 1)).toBeNull()
      expect(replayBadgeCount(status, 2)).toBe('2×')
      expect(replayBadgeCount(status, 4)).toBe('4×')
    }
  )

  it('never shows it for the wishlist, an unknown status or no status', () => {
    expect(replayBadgeCount('WISHLIST', 3)).toBeNull()
    expect(replayBadgeCount('OTHER', 3)).toBeNull()
    expect(replayBadgeCount(undefined, 3)).toBeNull()
  })

  it('ignores zero, negative and missing counts', () => {
    expect(replayBadgeCount('BACKLOG', 0)).toBeNull()
    expect(replayBadgeCount('BACKLOG', -1)).toBeNull()
    expect(replayBadgeCount('BACKLOG', undefined)).toBeNull()
  })

  it('caps the label at 99+ without a second multiplication sign', () => {
    expect(replayBadgeCount('BACKLOG', 99)).toBe('99×')
    expect(replayBadgeCount('BACKLOG', 150)).toBe('99+')
  })
})

describe('countsCompletions', () => {
  it('counts for library statuses but not for the wishlist or unknown ones', () => {
    expect(countsCompletions('PLAYING')).toBe(true)
    expect(countsCompletions('PLAYED')).toBe(true)
    expect(countsCompletions('WISHLIST')).toBe(false)
    expect(countsCompletions(undefined)).toBe(false)
  })
})

describe('completionsText', () => {
  it('uses the singular only for one', () => {
    expect(completionsText(1)).toBe('zerado 1 vez')
    expect(completionsText(2)).toBe('zerado 2 vezes')
  })
})

describe('cardSummary (lançamento)', () => {
  it('fala a data de um jogo que ainda não saiu', () => {
    expect(cardSummary({ releasing: '19/11/2027' })).toBe('lança em 19/11/2027')
    expect(cardSummary({ releasing: null })).toBe('')
  })
})

describe('cardSummary', () => {
  it('lists status, rating with a comma, completions, Infinito and every platform', () => {
    expect(
      cardSummary({
        tag: 'Remaster',
        statusLabel: 'Jogando',
        rating: 4.5,
        completions: 2,
        endless: true,
        platforms: ['Steam', 'Xbox', 'PlayStation'],
      })
    ).toBe(
      'Remaster, Jogando, nota 4,5, zerado 2 vezes, Infinito, jogado em Steam, Xbox, PlayStation'
    )
  })

  it('leaves out what the card does not have', () => {
    expect(cardSummary({ statusLabel: 'Na fila' })).toBe('Na fila')
    expect(cardSummary({})).toBe('')
    expect(cardSummary({ rating: 0 })).toBe('nota 0')
    expect(cardSummary({ tag: 'DLC', statusLabel: 'Na fila' })).toBe(
      'DLC, Na fila'
    )
  })

  it('says when the game was finished at 100%', () => {
    expect(cardSummary({ statusLabel: 'Jogado', hundredPercent: true })).toBe(
      'Jogado, concluído a 100%'
    )
    expect(cardSummary({ statusLabel: 'Jogado' })).toBe('Jogado')
  })

  it('says when the game is the favorite one', () => {
    expect(
      cardSummary({
        statusLabel: 'Jogado',
        hundredPercent: true,
        favorite: true,
      })
    ).toBe('Jogado, concluído a 100%, favorito')
    expect(cardSummary({ statusLabel: 'Jogado', favorite: true })).toBe(
      'Jogado, favorito'
    )
  })
})

describe('isHundredPercent', () => {
  it('only counts a played game with the mark', () => {
    expect(isHundredPercent({ hundredPercent: true, status: 'PLAYED' })).toBe(
      true
    )
    expect(isHundredPercent({ hundredPercent: true, status: 'PLAYING' })).toBe(
      false
    )
    expect(isHundredPercent({ hundredPercent: true })).toBe(false)
    expect(isHundredPercent({ status: 'PLAYED' })).toBe(false)
    expect(isHundredPercent(undefined)).toBe(false)
  })
})
