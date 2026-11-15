import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ERROR_MESSAGES } from '../constants/messages'
import type { IsFollowingResponse } from '../types/follow'
import { notify } from '../utils/notify'
import { api } from './useApi'

export const useFollow = (userId: string | undefined) => {
  const queryClient = useQueryClient()
  const queryKey = ['followStatus', userId]

  const { data, isLoading } = useQuery<IsFollowingResponse>({
    queryKey,
    queryFn: () => api.getFollowStatus(userId as string),
    enabled: Boolean(userId),
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey })
    queryClient.invalidateQueries({ queryKey: ['followers'] })
    queryClient.invalidateQueries({ queryKey: ['following'] })
    queryClient.invalidateQueries({ queryKey: ['publicUserProfile'] })
    queryClient.invalidateQueries({ queryKey: ['userProfile'] })
  }

  const follow = useMutation({
    mutationFn: () => api.followUser(userId as string),
    onSuccess: invalidateAll,
    onError: (err: unknown) => notify.failure(err, ERROR_MESSAGES.follow),
  })

  const unfollow = useMutation({
    mutationFn: () => api.unfollowUser(userId as string),
    onSuccess: invalidateAll,
    onError: (err: unknown) => notify.failure(err, ERROR_MESSAGES.unfollow),
  })

  return {
    isFollowing: data?.isFollowing ?? false,
    isLoading,
    follow: () => follow.mutateAsync(),
    unfollow: () => unfollow.mutateAsync(),
    isMutating: follow.isPending || unfollow.isPending,
  }
}
