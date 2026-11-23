import dayjs from 'dayjs'
import { Check, Flag } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useReportReview } from '../hooks/useReportReview'
import type { ReportReason } from '../types/review'
import { plainExcerpt } from '../utils/plainExcerpt'
import { Button } from './button'
import { ReportReviewDialog } from './reportReviewDialog'

export function ReportReviewButton({
  igdbId,
  authorId,
  authorName,
  reviewText,
  createdAt,
  reportedByMe,
}: {
  igdbId: string
  authorId: string
  authorName: string
  reviewText: string
  createdAt: string
  reportedByMe: boolean
}) {
  const { user } = useAuth()
  const { report, isReporting } = useReportReview(igdbId)
  const [open, setOpen] = useState(false)

  if (!user?.id || user.id === authorId) return null

  const className =
    'text-gray-400 aria-disabled:cursor-default aria-disabled:hover:bg-transparent aria-disabled:hover:text-gray-400 aria-disabled:active:scale-100'

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className={className}
          aria-disabled={reportedByMe || undefined}
          aria-haspopup={reportedByMe ? undefined : 'dialog'}
          aria-label={
            reportedByMe
              ? `Denunciado: análise de ${authorName}`
              : `Denunciar a análise de ${authorName}`
          }
          onClick={() => {
            if (!reportedByMe) setOpen(true)
          }}
        >
          {reportedByMe ? (
            <Check className="mr-1.5 size-4" aria-hidden="true" />
          ) : (
            <Flag className="mr-1.5 size-4" aria-hidden="true" />
          )}
          {reportedByMe ? 'Denunciado' : 'Denunciar'}
        </Button>
      </div>
      <ReportReviewDialog
        open={open}
        onOpenChange={setOpen}
        onReport={(reason: ReportReason) => report(authorId, reason)}
        isReporting={isReporting}
        authorName={authorName}
        dateLabel={dayjs(createdAt).format('DD/MM/YYYY')}
        excerpt={open ? plainExcerpt(reviewText) : ''}
      />
    </>
  )
}
