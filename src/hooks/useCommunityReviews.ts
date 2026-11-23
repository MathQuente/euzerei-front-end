import { useQuery } from '@tanstack/react-query'
import type { GetCommunityReviewsResponse } from '../types/review'
import { api } from './useApi'
import { useAuth } from './useAuth'

export const useCommunityReviews = (
  igdbId: string | undefined,
  pageIndex: number,
  limit?: number
) => {
  const { user } = useAuth()
  const viewerId = user?.id ?? 'anon'
  const { data, isLoading, isError, refetch } =
    useQuery<GetCommunityReviewsResponse>({
      queryKey: ['communityReviews', igdbId, pageIndex, limit, viewerId],
      queryFn: () => api.getCommunityReviews(igdbId, pageIndex, limit),
      enabled: Boolean(igdbId),
      placeholderData: (previous, previousQuery) =>
        previousQuery?.queryKey[1] === igdbId &&
        previousQuery?.queryKey[4] === viewerId
          ? previous
          : undefined,
    })

  return {
    reviews: data?.reviews ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError,
    refetch,
  }
}
