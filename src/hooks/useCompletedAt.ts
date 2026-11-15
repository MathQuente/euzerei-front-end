import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { USER_GAME_STATUS_ID as STATUS } from '../constants/gameStatus'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import type { GameCompletedAtResponse } from '../types/user'
import { notify } from '../utils/notify'
import { invalidateUserGames } from './invalidateUserGames'
import { api } from './useApi'
import { useAuth } from './useAuth'
import { useGameStatus } from './useGameStatus'

const getCompletedAtQueryKey = (userId: string, igdbId: string) => [
  'gameCompletedAt',
  userId,
  igdbId,
]

export const useCompletedAt = (igdbId: string) => {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()

  const { gameStatus } = useGameStatus(igdbId)
  const statusId = gameStatus?.userGameStatus?.id
  const inLibrary = statusId !== undefined && statusId !== STATUS.WISHLIST

  const queryKey = getCompletedAtQueryKey(userId, igdbId)

  const {
    data,
    isLoading: isFetchingCompletedAt,
    isError: isErrorCompletedAt,
  } = useQuery<GameCompletedAtResponse>({
    queryKey,
    queryFn: () => api.getGameCompletedAt(igdbId),
    enabled: Boolean(igdbId && userId && inLibrary),
    staleTime: 1000 * 60 * 5,
  })

  const updateCompletedAt = useMutation({
    mutationFn: (completedAt: string) =>
      api.updateCompletedAt(igdbId, completedAt),
    onMutate: async completedAt => {
      await queryClient.cancelQueries({ queryKey })

      const previousData =
        queryClient.getQueryData<GameCompletedAtResponse>(queryKey)
      queryClient.setQueryData<GameCompletedAtResponse>(queryKey, {
        completedAt,
      })

      return { previousData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      invalidateUserGames(queryClient, userId)
      notify.success(SUCCESS_MESSAGES.completedAtSaved, {
        id: 'game-completed-at-feedback',
      })
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      notify.failure(error, ERROR_MESSAGES.saveCompletedAt)
    },
  })

  return {
    completedAt: data?.completedAt ?? null,
    isFetchingCompletedAt,
    isErrorCompletedAt,
    updateCompletedAt: (completedAt: string) =>
      updateCompletedAt.mutateAsync(completedAt),
    isLoading: updateCompletedAt.isPending,
  }
}
