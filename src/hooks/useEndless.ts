import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ERROR_MESSAGES } from '../constants/messages'
import type { GameStatusResponse } from '../types/games'
import { notify } from '../utils/notify'
import { invalidateUserGames } from './invalidateUserGames'
import { api } from './useApi'
import { useAuth } from './useAuth'
import { useGameStatus } from './useGameStatus'

export const useEndless = (igdbId: string | undefined) => {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()
  const { gameStatus } = useGameStatus(igdbId)

  const queryKey = ['gamesStatus', userId, igdbId]

  const updateEndless = useMutation({
    mutationFn: (endless: boolean) => api.setEndless(igdbId, endless),
    onMutate: async endless => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<GameStatusResponse>(queryKey)
      if (previous) {
        queryClient.setQueryData<GameStatusResponse>(queryKey, {
          ...previous,
          endless,
        })
      }
      return { previous }
    },
    onError: (error, _endless, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
      notify.failure(error, ERROR_MESSAGES.updateEndless)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      invalidateUserGames(queryClient, userId)
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
    },
  })

  return {
    endless: gameStatus?.endless ?? false,
    setEndless: (endless: boolean) => updateEndless.mutateAsync(endless),
    isLoading: updateEndless.isPending,
  }
}
