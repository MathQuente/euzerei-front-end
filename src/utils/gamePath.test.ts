import { describe, expect, it } from 'vitest'
import { gamePath, parseGameRef } from './gamePath'

describe('parseGameRef', () => {
  it('reads a plain id', () => {
    expect(parseGameRef('62151')).toEqual({ kind: 'id', id: '62151' })
  })

  it('reads a slug and lowercases it', () => {
    expect(parseGameRef('The-Witcher-3-Wild-Hunt')).toEqual({
      kind: 'slug',
      slug: 'the-witcher-3-wild-hunt',
    })
  })

  it('keeps a slug that ends in digits as a slug', () => {
    expect(parseGameRef('fifa-23')).toEqual({ kind: 'slug', slug: 'fifa-23' })
  })

  it.each([
    undefined,
    '',
    '007',
    '12345678901',
    '0',
    'a b',
    'doom/eternal',
    '-doom',
    'doom-',
    'doom--eternal',
    'ø',
    'x'.repeat(101),
  ])('rejects %s', param => {
    expect(parseGameRef(param)).toEqual({ kind: 'invalid' })
  })
})

describe('gamePath', () => {
  it('uses the slug when there is one', () => {
    expect(gamePath({ igdbId: 1942, slug: 'the-witcher-3-wild-hunt' })).toBe(
      '/games/the-witcher-3-wild-hunt'
    )
  })

  it.each([null, undefined, ''])('falls back to the id for slug %s', slug => {
    expect(gamePath({ igdbId: 1942, slug })).toBe('/games/1942')
  })

  it.each(['half_life', 'jogo ruim', 'x'.repeat(101), '1917'])(
    'ignores the unusable slug %s and uses the id',
    slug => {
      expect(gamePath({ igdbId: 5, slug })).toBe('/games/5')
    }
  )

  it('accepts a string id', () => {
    expect(gamePath({ igdbId: '1942' })).toBe('/games/1942')
  })

  it('adds reviews, search and hash in order', () => {
    expect(
      gamePath(
        { igdbId: 1, slug: 'doom' },
        { reviews: true, search: '?page=2', hash: '#biblioteca' }
      )
    ).toBe('/games/doom/reviews?page=2#biblioteca')
  })
})
