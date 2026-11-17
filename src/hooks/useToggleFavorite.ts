import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ERROR_MESSAGES } from '../constants/messages'
import type { FavoriteGamesResponse } from '../types/games'
import {
  FAVORITE_SLOTS,
  type FavoriteList,
  canAddFavorite,
  withFavorite,
  withoutFavorite,
} from '../utils/favorites'
import { notify } from '../utils/notify'
import { api } from './useApi'
import { useAuth } from './useAuth'
import { useFavoriteGames } from './useFavoriteGames'

const toList = (response: FavoriteGamesResponse): FavoriteList => ({
  ids: response.games.map(game => game.igdbId),
  main: response.games.find(game => game.isMain)?.igdbId ?? null,
})

export const useToggleFavorite = (igdbId: number) => {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()
  const queryKey = ['favoriteGames', userId]
  const { favorites, isLoading, isError } = useFavoriteGames(userId)

  const mutation = useMutation({
    mutationFn: async (on: boolean) => {
      const latest = await queryClient.fetchQuery({
        queryKey,
        queryFn: () => api.getUserFavorites(userId ?? null),
        staleTime: 0,
      })
      const current = toList(latest)
      if (on && !canAddFavorite(current, igdbId)) return latest

      const next = on
        ? withFavorite(current, igdbId)
        : withoutFavorite(current, igdbId)
      if (next === current) return latest

      return api.setFavorites(next.ids, next.main)
    },
    onSuccess: async data => {
      await queryClient.cancelQueries({ queryKey })
      queryClient.setQueryData<FavoriteGamesResponse>(queryKey, data)
    },
    onError: error => notify.failure(error, ERROR_MESSAGES.toggleFavorite),
  })

  const index = favorites.findIndex(game => game.igdbId === igdbId)
  const isFavorite = index !== -1

  return {
    isFavorite,
    slot: isFavorite ? index + 1 : null,
    isMain: isFavorite && favorites[index].isMain,
    freeSlots: Math.max(0, FAVORITE_SLOTS - favorites.length),
    isFull: !isFavorite && favorites.length >= FAVORITE_SLOTS,
    isLoading,
    isError,
    isSaving: mutation.isPending,
    setFavorite: (on: boolean) => mutation.mutateAsync(on),
  }
}
