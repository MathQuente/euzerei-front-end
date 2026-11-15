import { Link } from 'react-router-dom'
import { useCommunityReviews } from '../hooks/useCommunityReviews'
import { focusRing } from '../styles/focus'
import { gamePath } from '../utils/gamePath'
import { CommunityReviewCard } from './communityReviewCard'
import { SectionHeading } from './sectionHeading'

const PREVIEW_LIMIT = 3

export function CommunityReviewsSection({
  igdbId,
  slug,
}: {
  igdbId: string | undefined
  slug?: string | null
}) {
  const { reviews, total, isLoading } = useCommunityReviews(
    igdbId,
    0,
    PREVIEW_LIMIT
  )

  if (igdbId === undefined) return null

  if (isLoading) {
    return (
      <div className="h-40 rounded-lg border border-dark-border bg-dark-bg-light animate-pulse" />
    )
  }

  if (total === 0) return null

  return (
    <div className="bg-dark-bg-light border border-dark-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <SectionHeading className="mb-0">Resenhas da comunidade</SectionHeading>
        <Link
          to={gamePath({ igdbId, slug }, { reviews: true })}
          className={`text-xs text-gray-400 hover:text-primary transition-colors ${focusRing} rounded-sm`}
        >
          Ver todas
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {reviews.map(review => (
          <CommunityReviewCard key={review.userId} review={review} expandable />
        ))}
      </div>
    </div>
  )
}
