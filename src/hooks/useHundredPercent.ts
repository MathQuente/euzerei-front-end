import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ERROR_MESSAGES } from '../constants/messages'
import type { GameStatusResponse } from '../types/games'
import { notify } from '../utils/notify'
import { invalidateUserGames } from './invalidateUserGames'
import { api } from './useApi'
import { useAuth } from './useAuth'
import { useGameStatus } from './useGameStatus'

export const useHundredPercent = (igdbId: string | undefined) => {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()
  const { gameStatus } = useGameStatus(igdbId)

  const queryKey = ['gamesStatus', userId, igdbId]

  const updateHundredPercent = useMutation({
    mutationFn: (hundredPercent: boolean) =>
      api.setHundredPercent(igdbId, hundredPercent),
    onMutate: async hundredPercent => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<GameStatusResponse>(queryKey)
      if (previous) {
        queryClient.setQueryData<GameStatusResponse>(queryKey, {
          ...previous,
          hundredPercent,
        })
      }
      return { previous }
    },
    onError: (error, _hundredPercent, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
      notify.failure(error, ERROR_MESSAGES.updateHundredPercent)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      invalidateUserGames(queryClient, userId)
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
    },
  })

  return {
    hundredPercent: gameStatus?.hundredPercent ?? false,
    setHundredPercent: (hundredPercent: boolean) =>
      updateHundredPercent.mutateAsync(hundredPercent),
    isLoading: updateHundredPercent.isPending,
  }
}
