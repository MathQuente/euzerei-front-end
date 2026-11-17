import type { UserGameEntry } from '../types/games'

export const QUEUE_FILTER = 'QUEUE'

export function mergeQueue(
  backlog: UserGameEntry[],
  dropped: UserGameEntry[],
  limit: number
): UserGameEntry[] {
  const all = [...backlog, ...dropped]
  if (all.some(game => !game.updatedAt)) return all.slice(0, limit)

  return all
    .map((game, index) => ({ game, index }))
    .sort(
      (a, b) =>
        Date.parse(b.game.updatedAt as string) -
          Date.parse(a.game.updatedAt as string) || a.index - b.index
    )
    .slice(0, limit)
    .map(({ game }) => game)
}
