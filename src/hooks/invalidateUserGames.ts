import type { QueryClient } from '@tanstack/react-query'

export const invalidateUserGames = (
  queryClient: QueryClient,
  userId: string | undefined
) => {
  queryClient.invalidateQueries({ queryKey: ['userGames', userId] })
  queryClient.invalidateQueries({ queryKey: ['publicUserGames', userId] })
  queryClient.invalidateQueries({ queryKey: ['publicUserProfile', userId] })
  queryClient.invalidateQueries({ queryKey: ['favoriteGames', userId] })
}
