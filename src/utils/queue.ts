import { GameStatusEnum, type UserGameEntry } from '../types/games'

export const QUEUE_FILTER = 'QUEUE'

/** Os status que o filtro QUEUE reúne (Na fila + Larguei). */
export const QUEUE_STATUSES: GameStatusEnum[] = [
  GameStatusEnum.Backlog,
  GameStatusEnum.Dropped,
]

/**
 * A data que posiciona um jogo na fila: um largado vale pela data em que foi
 * largado (editar um largado não o devolve ao topo); os demais, pela última
 * vez que foram abertos, ou pela entrada na conta se nunca foram abertos. Sem a data (backend antigo) cai para `updatedAt`.
 */
function queueMoment(game: UserGameEntry) {
  return game.status === GameStatusEnum.Dropped
    ? (game.droppedAt ?? game.updatedAt)
    : game.lastPlayedAt || game.createdAt || game.updatedAt
}

export function mergeQueue(
  backlog: UserGameEntry[],
  dropped: UserGameEntry[],
  limit: number
): UserGameEntry[] {
  const all = [...backlog, ...dropped].map((game, index) => {
    const moment = queueMoment(game)
    return {
      game,
      index,
      neverOpened:
        game.status !== GameStatusEnum.Dropped && !game.lastPlayedAt ? 1 : 0,
      time: moment ? Date.parse(moment) : Number.NaN,
    }
  })
  // Sem data, ou com uma data que não dá para ler, a ordem do backend vale.
  if (all.some(item => Number.isNaN(item.time))) {
    return all.map(item => item.game).slice(0, limit)
  }

  return all
    .sort(
      (a, b) =>
        a.neverOpened - b.neverOpened || b.time - a.time || a.index - b.index
    )
    .slice(0, limit)
    .map(({ game }) => game)
}
