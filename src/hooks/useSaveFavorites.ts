import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import type { FavoriteGamesResponse } from '../types/games'
import { notify } from '../utils/notify'
import { api } from './useApi'

export const useSaveFavorites = (userId: string | undefined) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      igdbIds,
      mainIgdbId,
    }: {
      igdbIds: number[]
      mainIgdbId: number | null
    }) => api.setFavorites(igdbIds, mainIgdbId),
    onSuccess: async data => {
      await queryClient.cancelQueries({ queryKey: ['favoriteGames', userId] })
      queryClient.setQueryData<FavoriteGamesResponse>(
        ['favoriteGames', userId],
        data
      )
      notify.success(SUCCESS_MESSAGES.favoritesSaved)
    },
    onError: error => notify.failure(error, ERROR_MESSAGES.saveFavorites),
  })

  return { save: mutation.mutateAsync, isSaving: mutation.isPending }
}
