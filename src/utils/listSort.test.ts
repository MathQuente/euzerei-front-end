import { describe, expect, it } from 'vitest'
import {
  SORT_FIELDS,
  SORT_FIELD_META,
  sortFieldsFor,
  sortLabel,
  sortOrdersFor,
} from './listSort'

describe('sortFieldsFor', () => {
  it('offers the finish date only to played games', () => {
    expect(sortFieldsFor('played')).toContain('completedAt')
    expect(sortFieldsFor('played')).not.toContain('dateAdded')
    expect(sortFieldsFor('library')).toContain('dateAdded')
    expect(sortFieldsFor('library')).not.toContain('completedAt')
  })

  it('keeps library-only fields out of the public lists', () => {
    expect(sortFieldsFor('games')).toEqual(['name', 'releaseDate', 'rating'])
  })
})

describe('sortOrdersFor', () => {
  it('puts the default order first', () => {
    expect(sortOrdersFor('name')).toEqual(['asc', 'desc'])
    expect(sortOrdersFor('dateAdded')).toEqual(['desc', 'asc'])
    expect(sortOrdersFor('rating')).toEqual(['desc', 'asc'])
  })

  it('names both orders of every field', () => {
    for (const field of SORT_FIELDS) {
      const meta = SORT_FIELD_META[field]
      expect(meta.orderLabels.asc).toBeTruthy()
      expect(meta.orderLabels.desc).toBeTruthy()
    }
  })
})

describe('sortLabel', () => {
  it('joins field and direction so no arrow is needed', () => {
    expect(sortLabel('name', 'asc')).toBe('Nome A–Z')
    expect(sortLabel('name', 'desc')).toBe('Nome Z–A')
    expect(sortLabel('dateAdded', 'desc')).toBe('Adição · mais recentes')
    expect(sortLabel('completedAt', 'asc')).toBe('Finalização · mais antigos')
    expect(sortLabel('rating', 'desc')).toBe('Avaliação · maior nota')
    expect(sortLabel('hoursPlayed', 'asc')).toBe('Tempo de jogo · menos horas')
  })
})
