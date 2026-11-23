import * as RadioGroup from '@radix-ui/react-radio-group'
import { Flag } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import type { ReportResult } from '../hooks/useReportReview'
import { focusRing } from '../styles/focus'
import { REPORT_REASONS, type ReportReason } from '../types/review'
import { ConfirmDialog } from './confirmDialog'

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

const REASON_TEXT: Record<ReportReason, { label: string; help: string }> = {
  OFFENSE: {
    label: 'Ofensiva ou desrespeitosa',
    help: 'Ataques, ofensas ou discurso de ódio.',
  },
  SPAM: {
    label: 'Spam ou propaganda',
    help: 'Links, divulgação ou texto repetido.',
  },
  SPOILER: {
    label: 'Spoiler sem aviso',
    help: 'Revela a história sem avisar antes.',
  },
  OTHER: {
    label: 'Outro motivo',
    help: 'Algo que não se encaixa nos anteriores.',
  },
}

const DISABLED_SEND =
  'disabled:opacity-100 disabled:bg-[#33343F] disabled:text-[#9094A3] disabled:font-semibold'

export function ReportReviewDialog({
  open,
  onOpenChange,
  onReport,
  isReporting,
  authorName,
  dateLabel,
  excerpt,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReport: (reason: ReportReason) => Promise<ReportResult>
  isReporting: boolean
  authorName: string
  dateLabel: string
  excerpt: string
}) {
  const legendId = useId()
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setReason(null)
      setError(null)
    }
  }, [open])

  async function handleConfirm() {
    if (!reason) return
    setError(null)
    const result = await onReport(reason)
    if (result.closed) onOpenChange(false)
    else setError(result.error)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Denunciar esta análise?"
      titleIcon={<Flag className="size-[18px]" />}
      titleIconTone="primary"
      description="Quem escreveu não é avisado e nossa equipe analisa a denúncia."
      confirmLabel="Enviar denúncia"
      confirmVariant="primary"
      confirmClassName={isReporting ? undefined : DISABLED_SEND}
      onConfirm={handleConfirm}
      confirmDisabled={!reason}
      isLoading={isReporting}
      lockWhileLoading
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5 rounded-lg border border-dark-border bg-dark-bg px-3 py-2.5">
          <p className="text-xs font-semibold text-white">
            {authorName}
            <span className="font-normal text-gray-400"> · {dateLabel}</span>
          </p>
          {excerpt && (
            <p className="line-clamp-2 break-words text-[13.5px] text-gray-300">
              {excerpt}
            </p>
          )}
        </div>
        <p id={legendId} className="sr-only">
          Motivo da denúncia
        </p>
        <RadioGroup.Root
          aria-labelledby={legendId}
          value={reason ?? ''}
          onValueChange={value => setReason(value as ReportReason)}
          onKeyDown={event => {
            if (!ARROW_KEYS.includes(event.key)) return
            setTimeout(() => {
              const focused = document.activeElement
              if (
                focused instanceof HTMLButtonElement &&
                focused.getAttribute('role') === 'radio'
              ) {
                setReason(focused.value as ReportReason)
              }
            }, 0)
          }}
          className="flex flex-col gap-1"
        >
          {REPORT_REASONS.map(value => {
            const itemId = `report-reason-${value}`
            const helpId = `${itemId}-help`
            return (
              <label
                key={value}
                htmlFor={itemId}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2.5 py-2 transition-colors hover:bg-[#2D2E39] has-[[data-state=checked]]:border-primary-light has-[[data-state=checked]]:bg-primary/15 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-light"
              >
                <RadioGroup.Item
                  id={itemId}
                  value={value}
                  aria-describedby={helpId}
                  className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border-2 border-gray-500 data-[state=checked]:border-primary-light ${focusRing}`}
                >
                  <RadioGroup.Indicator className="size-2 rounded-full bg-primary-light" />
                </RadioGroup.Item>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium leading-snug text-white">
                    {REASON_TEXT[value].label}
                  </span>
                  <span
                    id={helpId}
                    data-help
                    className={`text-[12.5px] leading-snug text-gray-400 ${reason === value ? '' : 'sr-only'}`}
                  >
                    {REASON_TEXT[value].help}
                  </span>
                </span>
              </label>
            )
          })}
        </RadioGroup.Root>
        {error && (
          // biome-ignore lint/a11y/useSemanticElements: role="alert" explícito, não há elemento nativo equivalente (<output> é status, não alert)
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </ConfirmDialog>
  )
}
