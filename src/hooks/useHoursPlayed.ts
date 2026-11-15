import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { USER_GAME_STATUS_ID as STATUS } from '../constants/gameStatus'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import type { GameHoursResponse } from '../types/user'
import { notify } from '../utils/notify'
import { invalidateGameLists } from './invalidateGameLists'
import { invalidateUserGames } from './invalidateUserGames'
import { api } from './useApi'
import { useAuth } from './useAuth'
import { useGameStatus } from './useGameStatus'

const getGameHoursQueryKey = (userId: string, igdbId: string) => [
  'gameHours',
  userId,
  igdbId,
]

export const useHoursPlayed = (igdbId: string) => {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()

  const { gameStatus } = useGameStatus(igdbId)
  const isWishlist = gameStatus?.userGameStatus?.id === STATUS.WISHLIST

  const queryKey = getGameHoursQueryKey(userId, igdbId)

  const {
    data: hoursData,
    isLoading: isFetchingHours,
    isError: isErrorHours,
  } = useQuery<GameHoursResponse>({
    queryKey,
    queryFn: () => api.getGameHours(igdbId),
    enabled: Boolean(igdbId && userId && !isWishlist),
    staleTime: 1000 * 60 * 5,
  })

  const updateHoursPlayed = useMutation({
    mutationFn: (hoursPlayed: number) =>
      api.updateHoursPlayed(igdbId, hoursPlayed),
    onMutate: async hoursPlayed => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<GameHoursResponse>(queryKey)
      queryClient.setQueryData<GameHoursResponse>(queryKey, { hoursPlayed })

      return { previousData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      invalidateUserGames(queryClient, userId)
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      invalidateGameLists(queryClient)
      notify.success(SUCCESS_MESSAGES.hoursSaved, {
        id: 'game-hours-feedback',
      })
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      notify.failure(error, ERROR_MESSAGES.saveHours)
    },
  })

  return {
    hoursPlayed: hoursData?.hoursPlayed ?? 0,
    isFetchingHours,
    isErrorHours,
    updateHoursPlayed: (hoursPlayed: number) =>
      updateHoursPlayed.mutateAsync(hoursPlayed),
    isLoading: updateHoursPlayed.isPending,
  }
}
