import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { RouletteResponse, UserGameEntry } from '../types/games'
import { WHEEL_MAX } from '../utils/roulette'
import { api } from './useApi'
import { useAuth } from './useAuth'

const NO_GAMES: UserGameEntry[] = []

export const useRoulette = ({
  nonce,
  exclude,
}: {
  nonce: number
  exclude?: number
}) => {
  const { user } = useAuth()
  const userId = user?.id

  const query = useQuery<RouletteResponse>({
    queryKey: ['roulette', userId, nonce, exclude ?? null],
    queryFn: () => api.getRoulette(WHEEL_MAX, exclude),
    enabled: Boolean(userId),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: keepPreviousData,
  })

  return {
    total: query.data?.total ?? 0,
    games: query.data?.games ?? NO_GAMES,
    hasData: query.data !== undefined,
    isLoading: query.isLoading,
    isError: query.isError && query.data === undefined,
    isFetching: query.isFetching,
    isReplacing: query.isPlaceholderData,
    refetch: query.refetch,
  }
}
