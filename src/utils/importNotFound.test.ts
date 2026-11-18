import { describe, expect, it } from 'vitest'
import type { ImportResultSection } from '../types/import'
import { countNotFound, notFoundMessage } from './importNotFound'

const section = (notFound: string[] | undefined): ImportResultSection => ({
  title: 'Biblioteca',
  result: {
    imported: 0,
    updated: 0,
    skipped: 0,
    notFound: notFound as string[],
  },
})

describe('countNotFound', () => {
  it('adds up the unmatched games of every section', () => {
    expect(
      countNotFound([section(['A', 'B']), section(['C']), section([])])
    ).toBe(3)
  })

  it('counts zero when nothing was left out, or the list is missing', () => {
    expect(countNotFound([])).toBe(0)
    expect(countNotFound([section([]), section(undefined)])).toBe(0)
  })
})

describe('notFoundMessage', () => {
  it('says nothing when everything was found', () => {
    expect(notFoundMessage(0)).toBeNull()
  })

  it('uses the singular and the plural', () => {
    expect(notFoundMessage(1)).toBe(
      '1 jogo não foi encontrado e ficou de fora.'
    )
    expect(notFoundMessage(12)).toBe(
      '12 jogos não foram encontrados e ficaram de fora.'
    )
  })
})
