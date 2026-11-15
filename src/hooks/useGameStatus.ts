import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import type { GameStatusResponse } from '../types/games'
import { notify } from '../utils/notify'
import { invalidateGameLists } from './invalidateGameLists'
import { invalidateUserGames } from './invalidateUserGames'
import { api } from './useApi'
import { useAuth } from './useAuth'

const getGameStatusQueryKey = (userId: string, igdbId: string | undefined) => [
  'gamesStatus',
  userId,
  igdbId,
]

export const useGameStatus = (igdbId: string | undefined) => {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()

  const queryKey = getGameStatusQueryKey(userId, igdbId)

  const { data: gameStatusResponse, isLoading: isLoadingStatus } =
    useQuery<GameStatusResponse>({
      queryKey,
      queryFn: () => api.getGameStatus(igdbId),
      enabled: Boolean(userId && igdbId),
      staleTime: 1000 * 60 * 5,
    })

  const updateGameStatus = useMutation({
    mutationFn: (data: { statusIds: number }) =>
      api.updateGameStatus(igdbId, data.statusIds),
    onMutate: async statusIds => {
      await queryClient.cancelQueries({ queryKey })
      return { statusIds }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['gameStats', userId, igdbId] })
      queryClient.invalidateQueries({ queryKey: ['gameHours', userId, igdbId] })
      queryClient.invalidateQueries({
        queryKey: ['gameCompletedAt', userId, igdbId],
      })
      queryClient.invalidateQueries({
        queryKey: ['gamePlatforms', userId, igdbId],
      })
      invalidateUserGames(queryClient, userId)
      queryClient.invalidateQueries({ queryKey: ['rating', userId, igdbId] })
      queryClient.invalidateQueries({ queryKey: ['ratings', igdbId] })
      queryClient.invalidateQueries({
        predicate: query =>
          String(query.queryKey[0]) === igdbId &&
          query.queryKey[2] === 'averageRating',
      })
      notify.success(SUCCESS_MESSAGES.statusUpdated, {
        id: 'game-status-feedback',
      })
    },
    onError: error => {
      notify.failure(error, ERROR_MESSAGES.updateStatus)
    },
    onSettled: () => {
      invalidateGameLists(queryClient)
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
    },
  })

  return {
    gameStatus: gameStatusResponse,
    isLoadingStatus,
    updateGameStatus: (data: { statusIds: number }) =>
      updateGameStatus.mutateAsync(data),
  }
}
