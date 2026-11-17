import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { FavoriteGamesResponse, GameCardData } from '../types/games'

export type FavoriteGame = GameCardData & { isMain: boolean }
import { api } from './useApi'

export const useFavoriteGames = (
  userId: string | undefined,
  paused = false
) => {
  const { data, isLoading, isError, refetch } = useQuery<FavoriteGamesResponse>(
    {
      queryKey: ['favoriteGames', userId],
      queryFn: () => api.getUserFavorites(userId ?? null),
      enabled: Boolean(userId),
      refetchOnWindowFocus: !paused,
      refetchOnReconnect: !paused,
    }
  )

  const favorites = useMemo(
    (): FavoriteGame[] =>
      (data?.games ?? []).map(game => ({
        ...game,
        status: game.status ?? undefined,
      })),
    [data]
  )

  return { favorites, isLoading, isError: isError && !data, refetch }
}
