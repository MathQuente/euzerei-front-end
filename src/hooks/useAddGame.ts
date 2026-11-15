import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import type { GameBase } from '../types/games'
import { notify } from '../utils/notify'
import { invalidateUserGames } from './invalidateUserGames'
import { api } from './useApi'
import { useAuth } from './useAuth'

export const useAddGame = (igdbId?: string) => {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()

  const addGame = useMutation({
    mutationFn: (data: { statusIds: number }) =>
      api.addGame(igdbId, data.statusIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['gamesStatus', userId, igdbId],
      })
      notify.success(SUCCESS_MESSAGES.gameAdded)
    },
    onError: error => {
      notify.failure(error, ERROR_MESSAGES.addGame)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      invalidateUserGames(queryClient, userId)
      queryClient.invalidateQueries({
        queryKey: ['gamesStatus', userId, igdbId],
      })
      queryClient.invalidateQueries({ queryKey: ['rating', userId, igdbId] })
    },
  })

  const removeGame = useMutation({
    mutationFn: () => api.removeGame(igdbId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['games'] })
      await queryClient.cancelQueries({
        queryKey: ['gamesStatus', userId, igdbId],
      })

      const previousGames = queryClient.getQueryData(['games'])
      const previousGameStatus = queryClient.getQueryData([
        'gamesStatus',
        userId,
        igdbId,
      ])
      const previousRating = queryClient.getQueryData([
        'rating',
        userId,
        igdbId,
      ])

      queryClient.setQueryData(['games'], (old: GameBase[] | undefined) =>
        old ? old.filter(g => g.igdbId !== Number(igdbId)) : []
      )
      queryClient.setQueryData(['gamesStatus', userId, igdbId], null)
      queryClient.setQueryData(['rating', userId, igdbId], null)

      return { previousGames, previousGameStatus, previousRating }
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['gamesStatus', userId, igdbId] })
      queryClient.invalidateQueries({ queryKey: ['gameStats', userId, igdbId] })
      notify.success(SUCCESS_MESSAGES.gameRemoved)
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData(['games'], context?.previousGames)
      queryClient.setQueryData(
        ['gamesStatus', userId, igdbId],
        context?.previousGameStatus
      )
      queryClient.setQueryData(
        ['rating', userId, igdbId],
        context?.previousRating
      )
      notify.failure(err, ERROR_MESSAGES.removeGame)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['gamesStatus'] })
      queryClient.invalidateQueries({ queryKey: ['rating', userId, igdbId] })
      invalidateUserGames(queryClient, userId)
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      queryClient.invalidateQueries({ queryKey: ['gameSearch'] })
      queryClient.invalidateQueries({ queryKey: ['comingSoon'] })
      queryClient.invalidateQueries({ queryKey: ['gamesFeatured'] })
      queryClient.invalidateQueries({ queryKey: ['similarGames'] })
    },
  })

  const removeUserGame = useMutation({
    mutationFn: () => api.removeGame(igdbId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['userGames', userId] })
      await queryClient.cancelQueries({
        queryKey: ['gamesStatus', userId, igdbId],
      })

      const previousGames = queryClient.getQueryData(['userGames', userId])
      const previousGameStatus = queryClient.getQueryData([
        'gamesStatus',
        userId,
        igdbId,
      ])

      return { previousGames, previousGameStatus }
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['gamesStatus', userId, igdbId] })
      invalidateUserGames(queryClient, userId)
      queryClient.invalidateQueries({ queryKey: ['gamesStatus'] })
      notify.success(SUCCESS_MESSAGES.gameRemoved)
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData(['userGames', userId], context?.previousGames)
      queryClient.setQueryData(
        ['gamesStatus', userId, igdbId],
        context?.previousGameStatus
      )
      notify.failure(err, ERROR_MESSAGES.removeGame)
    },
    onSettled: () => {
      invalidateUserGames(queryClient, userId)
      queryClient.invalidateQueries({ queryKey: ['gamesStatus'] })
      queryClient.invalidateQueries({ queryKey: ['rating', userId, igdbId] })
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['gameSearch'] })
      queryClient.invalidateQueries({ queryKey: ['comingSoon'] })
      queryClient.invalidateQueries({ queryKey: ['gamesFeatured'] })
      queryClient.invalidateQueries({ queryKey: ['similarGames'] })
    },
  })

  return {
    addGame: addGame.mutateAsync,
    removeGame: removeGame.mutateAsync,
    removeUserGame: removeUserGame.mutateAsync,
  }
}
