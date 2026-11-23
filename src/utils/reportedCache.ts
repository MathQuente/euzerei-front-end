import type { GetCommunityReviewsResponse } from '../types/review'

export function markReviewReported(
  data: GetCommunityReviewsResponse | undefined,
  authorId: string
): GetCommunityReviewsResponse | undefined {
  if (!data) return data
  let changed = false
  const reviews = data.reviews.map(review => {
    if (review.userId !== authorId || review.reportedByMe === true)
      return review
    changed = true
    return { ...review, reportedByMe: true }
  })
  return changed ? { ...data, reviews } : data
}
