import { useQuery } from '@tanstack/react-query'
import type { UserGamesResponse } from '../types/games'
import { api } from './useApi'

const EMPTY_GROUPS: UserGamesResponse['games'] = {
  PLAYED: [],
  PLAYING: [],
  PAUSED: [],
  BACKLOG: [],
  WISHLIST: [],
  DROPPED: [],
}

export const usePublicUserGames = (
  userId: string | undefined,
  enabled: boolean
) => {
  const { data, isLoading, isError, refetch } = useQuery<UserGamesResponse>({
    queryKey: ['publicUserGames', userId],
    queryFn: () => api.getPublicUserGames(userId ?? null),
    enabled: Boolean(userId) && enabled,
  })

  return {
    games: data?.games ?? EMPTY_GROUPS,
    totalPerStatus: data?.totalPerStatus ?? [],
    hasData: Boolean(data),
    isLoading,
    isError,
    refetch,
  }
}
