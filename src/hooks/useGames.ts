import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect } from 'react'
import type { SortField, SortOrder } from '../interfaces/games'
import type { GamesFromHomePageResponse, UseGamesProps } from '../types/games'
import { api } from './useApi'

export const useGames = (
  page: number,
  search: string | undefined,
  sortBy: SortField,
  sortOrder: SortOrder,
  limit?: number,
  options?: { prefetchNext?: boolean }
) => {
  const queryClient = useQueryClient()
  const queryKey = ['games', page, search, sortBy, sortOrder, limit]

  const {
    data: GamesResponse,
    isLoading,
    isError,
    isPlaceholderData,
  } = useQuery<UseGamesProps>({
    queryKey: queryKey,
    queryFn: async () => api.getGames(page, search, sortBy, sortOrder, limit),
    placeholderData: keepPreviousData,
  })

  const total = GamesResponse?.total
  const prefetchNext = options?.prefetchNext === true
  useEffect(() => {
    if (!prefetchNext || isPlaceholderData || !limit || !total) return
    if (page * limit >= total) return
    queryClient.prefetchQuery({
      queryKey: ['games', page + 1, search, sortBy, sortOrder, limit],
      queryFn: () => api.getGames(page + 1, search, sortBy, sortOrder, limit),
      staleTime: 1000 * 60,
    })
  }, [
    prefetchNext,
    isPlaceholderData,
    page,
    limit,
    total,
    search,
    sortBy,
    sortOrder,
    queryClient,
  ])

  const { data: ComingSoon } = useQuery<UseGamesProps>({
    queryKey: ['comingSoon', page, search, sortBy, sortOrder, limit],
    queryFn: async () =>
      api.getComingSoon(page, search, sortOrder, sortBy, limit),
    placeholderData: keepPreviousData,
  })

  const {
    data: gamesFeatured,
    isLoading: isLoadingFeatured,
    isError: isErrorFeatured,
  } = useQuery<GamesFromHomePageResponse>({
    queryKey: ['gamesFeatured'],
    queryFn: async () => api.getGamesFeatured(),
    placeholderData: keepPreviousData,
  })

  return {
    GamesResponse,
    ComingSoon,
    gamesFeatured,
    isLoadingFeatured,
    isErrorFeatured,
    isLoading,
    isError,
    isChangingPage: isPlaceholderData,
  }
}
