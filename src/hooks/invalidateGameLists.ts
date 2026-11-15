import type { QueryClient } from '@tanstack/react-query'

const GAME_LIST_QUERY_KEYS = [
  'games',
  'gameSearch',
  'comingSoon',
  'gamesFeatured',
  'similarGames',
] as const

export const invalidateGameLists = (queryClient: QueryClient) => {
  for (const key of GAME_LIST_QUERY_KEYS) {
    queryClient.invalidateQueries({ queryKey: [key] })
  }
}
