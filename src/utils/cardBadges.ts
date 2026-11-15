const COUNTING_STATUSES = new Set([
  'PLAYED',
  'PLAYING',
  'PAUSED',
  'BACKLOG',
  'DROPPED',
])

const MAX_COUNT = 99

export function replayBadgeCount(
  status: string | undefined,
  completions: number | undefined
): string | null {
  if (!status || !COUNTING_STATUSES.has(status)) return null
  if (!completions || completions < 1) return null
  if (status === 'PLAYED' && completions < 2) return null
  return completions > MAX_COUNT ? `${MAX_COUNT}+` : `${completions}×`
}

export function completionsText(completions: number) {
  return `zerado ${completions} ${completions === 1 ? 'vez' : 'vezes'}`
}

interface CardSummaryInput {
  tag?: string | null
  statusLabel?: string
  rating?: number | null
  completions?: number
  endless?: boolean
  platforms?: string[]
}

const ratingFormat = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

export function formatRating(rating: number) {
  return ratingFormat.format(rating)
}

export function cardSummary({
  tag,
  statusLabel,
  rating,
  completions,
  endless,
  platforms,
}: CardSummaryInput) {
  const parts: string[] = []
  if (tag) parts.push(tag)
  if (statusLabel) parts.push(statusLabel)
  if (rating != null) parts.push(`nota ${formatRating(rating)}`)
  if (completions && completions > 0) parts.push(completionsText(completions))
  if (endless) parts.push('Infinito')
  if (platforms && platforms.length > 0) {
    parts.push(`jogado em ${platforms.join(', ')}`)
  }
  return parts.join(', ')
}
