import { describe, expect, it } from 'vitest'
import type { UserGameEntry } from '../types/games'
import { mergeQueue } from './queue'

const game = (
  igdbId: number,
  status: string,
  updatedAt?: string,
  droppedAt?: string,
  lastPlayedAt: string | undefined = updatedAt
) =>
  ({
    igdbId,
    status,
    updatedAt,
    createdAt: updatedAt,
    droppedAt,
    lastPlayedAt,
  }) as UserGameEntry

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

  it('orders a dropped game by when it was dropped, not by its last edit', () => {
    const merged = mergeQueue(
      [game(1, 'BACKLOG', '2026-11-10T00:00:00Z')],
      [game(2, 'DROPPED', '2026-11-15T00:00:00Z', '2026-09-01T00:00:00Z')],
      10
    )

    expect(ids(merged)).toEqual([1, 2])
  })

  it('puts a game dropped yesterday above older backlog games', () => {
    const merged = mergeQueue(
      [game(1, 'BACKLOG', '2026-11-10T00:00:00Z')],
      [game(2, 'DROPPED', '2026-11-01T00:00:00Z', '2026-11-17T00:00:00Z')],
      10
    )

    expect(ids(merged)).toEqual([2, 1])
  })

  it('falls back to the last edit for a dropped game without a dropped date', () => {
    const merged = mergeQueue(
      [game(1, 'BACKLOG', '2026-11-10T00:00:00Z')],
      [game(2, 'DROPPED', '2026-11-12T00:00:00Z')],
      10
    )

    expect(ids(merged)).toEqual([2, 1])
  })

  it('ignores a dropped date on a game that is not dropped', () => {
    const merged = mergeQueue(
      [game(1, 'BACKLOG', '2026-11-01T00:00:00Z', '2026-11-30T00:00:00Z')],
      [game(2, 'DROPPED', '2026-11-12T00:00:00Z')],
      10
    )

    expect(ids(merged)).toEqual([2, 1])
  })

  it('keeps the backend order when a date cannot be read', () => {
    const merged = mergeQueue(
      [
        game(1, 'BACKLOG', 'not a date'),
        game(2, 'BACKLOG', '2026-11-10T00:00:00Z'),
      ],
      [game(3, 'DROPPED', '2026-11-12T00:00:00Z')],
      10
    )

    expect(ids(merged)).toEqual([1, 2, 3])
  })

  it('puts opened games first by last activity, then never-opened by entry date', () => {
    const merged = mergeQueue(
      [
        game(1, 'BACKLOG', '2026-11-10T00:00:00Z', undefined, ''),
        game(
          2,
          'BACKLOG',
          '2026-11-01T00:00:00Z',
          undefined,
          '2026-09-01T00:00:00Z'
        ),
        game(
          3,
          'BACKLOG',
          '2026-11-05T00:00:00Z',
          undefined,
          '2026-10-01T00:00:00Z'
        ),
      ],
      [],
      10
    )

    expect(ids(merged)).toEqual([3, 2, 1])
  })
})
