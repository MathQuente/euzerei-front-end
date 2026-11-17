import { describe, expect, it } from 'vitest'
import type { UserGameEntry } from '../types/games'
import { mergeQueue } from './queue'

const game = (igdbId: number, status: string, updatedAt?: string) =>
  ({ igdbId, status, updatedAt }) as UserGameEntry

const ids = (games: UserGameEntry[]) => games.map(g => g.igdbId)

describe('mergeQueue', () => {
  it('mixes backlog and dropped games from newest to oldest', () => {
    const backlog = [
      game(1, 'BACKLOG', '2026-11-10T00:00:00Z'),
      game(2, 'BACKLOG', '2026-11-01T00:00:00Z'),
    ]
    const dropped = [
      game(3, 'DROPPED', '2026-11-12T00:00:00Z'),
      game(4, 'DROPPED', '2026-11-05T00:00:00Z'),
    ]

    expect(ids(mergeQueue(backlog, dropped, 10))).toEqual([3, 1, 4, 2])
  })

  it('cuts the list at the limit after mixing', () => {
    const backlog = [game(1, 'BACKLOG', '2026-11-01T00:00:00Z')]
    const dropped = [
      game(2, 'DROPPED', '2026-11-12T00:00:00Z'),
      game(3, 'DROPPED', '2026-11-11T00:00:00Z'),
    ]

    expect(ids(mergeQueue(backlog, dropped, 2))).toEqual([2, 3])
  })

  it('keeps the original order of games changed at the same moment', () => {
    const same = '2026-11-10T00:00:00Z'
    const merged = mergeQueue(
      [game(1, 'BACKLOG', same)],
      [game(2, 'DROPPED', same)],
      10
    )

    expect(ids(merged)).toEqual([1, 2])
  })

  it('falls back to backlog first, then dropped, when a date is missing', () => {
    const merged = mergeQueue(
      [game(1, 'BACKLOG'), game(2, 'BACKLOG')],
      [game(3, 'DROPPED', '2026-11-12T00:00:00Z')],
      10
    )

    expect(ids(merged)).toEqual([1, 2, 3])
  })

  it('works with no dropped games', () => {
    const backlog = [game(1, 'BACKLOG', '2026-11-10T00:00:00Z')]
    expect(ids(mergeQueue(backlog, [], 8))).toEqual([1])
    expect(mergeQueue([], [], 8)).toEqual([])
  })
})
