import { describe, expect, it } from 'vitest'
import {
  clearMainIfRemoved,
  compactFavorites,
  isFavoritesDirty,
  moveFavorite,
  setFavoriteSlot,
  toDraft,
  toggleMain,
} from './favorites'

describe('toDraft', () => {
  it('always has four slots, filling the empty ones with null', () => {
    expect(toDraft([])).toEqual([null, null, null, null])
    expect(toDraft([7, 8])).toEqual([7, 8, null, null])
    expect(toDraft([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4])
  })
})

describe('compactFavorites', () => {
  it('moves the favorites up and drops the empty slots', () => {
    expect(compactFavorites([null, 3, null, 9])).toEqual([3, 9])
  })
})

describe('moveFavorite', () => {
  const draft = [1, 2, 3, 4]

  it('pushes the others aside when the card lands on a new slot', () => {
    expect(moveFavorite(draft, 0, 2)).toEqual([2, 3, 1, 4])
    expect(moveFavorite(draft, 3, 0)).toEqual([4, 1, 2, 3])
  })

  it('moves a card onto an empty slot and keeps four slots', () => {
    expect(moveFavorite([1, null, null, null], 0, 2)).toEqual([
      null,
      null,
      1,
      null,
    ])
  })

  it('does nothing for the same slot or an out-of-range slot', () => {
    expect(moveFavorite(draft, 1, 1)).toBe(draft)
    expect(moveFavorite(draft, 0, 9)).toBe(draft)
    expect(moveFavorite(draft, -1, 2)).toBe(draft)
  })

  it('does not change the original list', () => {
    moveFavorite(draft, 0, 3)
    expect(draft).toEqual([1, 2, 3, 4])
  })
})

describe('setFavoriteSlot', () => {
  it('puts a game in a slot and removes it from where it was', () => {
    expect(setFavoriteSlot([1, 2, null, null], 2, 1)).toEqual([
      null,
      2,
      1,
      null,
    ])
  })

  it('replaces the game that was in the slot', () => {
    expect(setFavoriteSlot([1, 2, 3, 4], 1, 9)).toEqual([1, 9, 3, 4])
  })

  it('clears a slot with null', () => {
    expect(setFavoriteSlot([1, 2, 3, 4], 1, null)).toEqual([1, null, 3, 4])
  })
})

describe('isFavoritesDirty', () => {
  it('is clean when the draft has the saved layout', () => {
    expect(isFavoritesDirty([1, 2, null, null], [1, 2])).toBe(false)
  })

  it('is dirty when the order, a game or a gap changes', () => {
    expect(isFavoritesDirty([2, 1, null, null], [1, 2])).toBe(true)
    expect(isFavoritesDirty([null, null, null, null], [1])).toBe(true)
    expect(isFavoritesDirty([1, null, 2, null], [1, 2])).toBe(true)
  })
})

describe('the crowned favorite', () => {
  it('moves the crown to another game and takes it away from the same one', () => {
    expect(toggleMain(null, 5)).toBe(5)
    expect(toggleMain(5, 7)).toBe(7)
    expect(toggleMain(5, 5)).toBeNull()
  })

  it('loses the crown when its game leaves the draft or is replaced', () => {
    expect(clearMainIfRemoved(2, [1, 2, null, null])).toBe(2)
    expect(clearMainIfRemoved(2, [1, null, null, null])).toBeNull()
    expect(
      clearMainIfRemoved(2, setFavoriteSlot([1, 2, 3, 4], 1, 9))
    ).toBeNull()
    expect(clearMainIfRemoved(null, [1, 2, 3, 4])).toBeNull()
  })

  it('counts a changed crown as an unsaved change', () => {
    expect(isFavoritesDirty([1, 2, null, null], [1, 2], 2, 2)).toBe(false)
    expect(isFavoritesDirty([1, 2, null, null], [1, 2], 1, 2)).toBe(true)
    expect(isFavoritesDirty([1, 2, null, null], [1, 2], null, 2)).toBe(true)
  })
})
