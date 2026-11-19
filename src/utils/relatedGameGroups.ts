import type { GameBase } from '../types/games'

const VERSION_CATEGORIES = [8, 9, 10, 11]

export function splitRelatedGames(relatedGames: GameBase[]) {
  const versions: GameBase[] = []
  const dlcs: GameBase[] = []
  for (const game of relatedGames) {
    if (VERSION_CATEGORIES.includes(game.category)) versions.push(game)
    else dlcs.push(game)
  }
  return { dlcs, versions }
}
