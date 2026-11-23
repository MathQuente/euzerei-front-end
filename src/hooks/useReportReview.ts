import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SUCCESS_MESSAGES } from '../constants/messages'
import type { GetCommunityReviewsResponse, ReportReason } from '../types/review'
import { notify } from '../utils/notify'
import { classifyReportError } from '../utils/reportErrors'
import { markReviewReported } from '../utils/reportedCache'
import { api } from './useApi'
import { useAuth } from './useAuth'

export interface ReportResult {
  closed: boolean
  error: string | null
}

export const useReportReview = (igdbId: string | undefined) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const listKey = ['communityReviews', igdbId]

  const mutation = useMutation({
    mutationFn: ({
      authorId,
      reason,
    }: {
      authorId: string
      reason: ReportReason
    }) => api.reportReview(igdbId, authorId, reason),
  })

  function markReported(authorId: string) {
    const viewerId = user?.id ?? 'anon'
    queryClient.setQueriesData<GetCommunityReviewsResponse>(
      {
        queryKey: listKey,
        predicate: query => query.queryKey[4] === viewerId,
      },
      data => markReviewReported(data, authorId)
    )
  }

  async function report(
    authorId: string,
    reason: ReportReason
  ): Promise<ReportResult> {
    try {
      await mutation.mutateAsync({ authorId, reason })
      markReported(authorId)
      notify.success(SUCCESS_MESSAGES.reviewReported)
      return { closed: true, error: null }
    } catch (error) {
      const failure = classifyReportError(error)
      switch (failure.outcome) {
        case 'already':
          markReported(authorId)
          notify.info(failure.message)
          return { closed: true, error: null }
        case 'gone':
          await queryClient.invalidateQueries({ queryKey: listKey })
          notify.info(failure.message)
          return { closed: true, error: null }
        case 'own':
          notify.error(failure.message)
          return { closed: true, error: null }
        case 'session':
          return { closed: true, error: null }
        default:
          return { closed: false, error: failure.message }
      }
    }
  }

  return { report, isReporting: mutation.isPending }
}
