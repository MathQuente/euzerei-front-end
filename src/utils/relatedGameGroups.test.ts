import { describe, expect, it } from 'vitest'
import type { GameBase } from '../types/games'
import { splitRelatedGames } from './relatedGameGroups'

const game = (igdbId: number, category: number) =>
  ({ igdbId, category }) as GameBase

describe('splitRelatedGames', () => {
  it('sends remakes, remasters, expanded editions and ports to versions', () => {
    const { dlcs, versions } = splitRelatedGames([
      game(1, 1),
      game(2, 8),
      game(3, 9),
      game(4, 10),
      game(5, 11),
      game(6, 13),
    ])
    expect(versions.map(g => g.igdbId)).toEqual([2, 3, 4, 5])
    expect(dlcs.map(g => g.igdbId)).toEqual([1, 6])
  })

  it('keeps unknown categories with the DLCs', () => {
    const { dlcs, versions } = splitRelatedGames([game(1, -1), game(2, 0)])
    expect(dlcs).toHaveLength(2)
    expect(versions).toHaveLength(0)
  })
})
