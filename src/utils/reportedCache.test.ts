import { describe, expect, it } from 'vitest'
import type {
  CommunityReview,
  GetCommunityReviewsResponse,
} from '../types/review'
import { markReviewReported } from './reportedCache'

function review(userId: string, reportedByMe?: boolean): CommunityReview {
  return {
    userId,
    userName: userId,
    profilePicture: null,
    rating: null,
    hoursPlayed: 0,
    completions: 0,
    text: 'texto',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...(reportedByMe === undefined ? {} : { reportedByMe }),
  }
}

describe('markReviewReported', () => {
  it('marks only the reported author, leaving the others untouched', () => {
    const data: GetCommunityReviewsResponse = {
      reviews: [review('a', false), review('b', false), review('c')],
      total: 3,
    }

    const next = markReviewReported(data, 'b')

    expect(next?.reviews.map(r => r.reportedByMe)).toEqual([
      false,
      true,
      undefined,
    ])
    expect(next?.reviews[0]).toBe(data.reviews[0])
    expect(next?.reviews[2]).toBe(data.reviews[2])
    expect(next?.total).toBe(3)
  })

  it('also marks a row the server answered without the field (lib not deployed yet)', () => {
    const data = { reviews: [review('a')], total: 1 }

    expect(markReviewReported(data, 'a')?.reviews[0].reportedByMe).toBe(true)
  })

  it('returns the same object when the author is not in the page or already marked', () => {
    const data = { reviews: [review('a', true)], total: 1 }

    expect(markReviewReported(data, 'zzz')).toBe(data)
    expect(markReviewReported(data, 'a')).toBe(data)
  })

  it('passes undefined (no cached page) through', () => {
    expect(markReviewReported(undefined, 'a')).toBeUndefined()
  })
})
