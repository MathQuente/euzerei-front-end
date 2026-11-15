import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { USER_GAME_STATUS_ID as STATUS } from '../constants/gameStatus'
import { ERROR_MESSAGES } from '../constants/messages'
import type { GameStatsResponse } from '../types/user'
import { notify } from '../utils/notify'
import { invalidateGameLists } from './invalidateGameLists'
import { invalidateUserGames } from './invalidateUserGames'
import { api } from './useApi'
import { useAuth } from './useAuth'
import { useGameStatus } from './useGameStatus'

const getGameStatsQueryKey = (userId: string, igdbId: string) => [
  'gameStats',
  userId,
  igdbId,
]

export const usePlayedCount = (igdbId: string) => {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()

  const { gameStatus } = useGameStatus(igdbId)
  const statusId = gameStatus?.userGameStatus?.id
  const isPlayed = statusId === STATUS.PLAYED
  const tracksCompletions =
    statusId !== undefined && statusId !== STATUS.WISHLIST

  const queryKey = getGameStatsQueryKey(userId, igdbId)

  const {
    data: completionsData,
    isLoading: isFetchingCompletions,
    isError: isErrorCompletions,
  } = useQuery<GameStatsResponse>({
    queryKey: queryKey,
    queryFn: () => api.getGameStats(igdbId),
    enabled: Boolean(igdbId && userId && tracksCompletions),
    staleTime: 1000 * 60 * 5,
  })

  const updatePlayedCount = useMutation({
    mutationFn: (incrementValue: number) => {
      return api.updateCompletionCount(igdbId, incrementValue)
    },
    onMutate: async incrementValue => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<GameStatsResponse>(queryKey)

      if (previousData) {
        const newCompletions = Math.max(
          (previousData.playedCount || 0) + incrementValue,
          isPlayed ? 1 : 0
        )
        queryClient.setQueryData<GameStatsResponse>(queryKey, {
          ...previousData,
          playedCount: newCompletions,
        })
      }

      return { previousData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({
        queryKey: ['gamesStatus', userId, igdbId],
      })
      invalidateUserGames(queryClient, userId)
      invalidateGameLists(queryClient)
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      notify.failure(error, ERROR_MESSAGES.updatePlayedCount)
    },
  })

  return {
    completions: completionsData?.playedCount ?? 0,
    isFetchingCompletions,
    isErrorCompletions,
    updatePlayedCount: (incrementValue: number) =>
      updatePlayedCount.mutateAsync(incrementValue),
    isLoading: updatePlayedCount.isPending,
  }
}
