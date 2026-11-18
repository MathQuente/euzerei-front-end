import { GameStatusEnum, type UserGameEntry } from '../types/games'

export const QUEUE_FILTER = 'QUEUE'

/** Os status que o filtro QUEUE reúne (Na fila + Larguei). */
export const QUEUE_STATUSES: GameStatusEnum[] = [
  GameStatusEnum.Backlog,
  GameStatusEnum.Dropped,
]

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
