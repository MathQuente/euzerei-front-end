const COUNTING_STATUSES = new Set([
  'PLAYED',
  'PLAYING',
  'PAUSED',
  'BACKLOG',
  'DROPPED',
])

const MAX_COUNT = 99

export function countsCompletions(status: string | undefined) {
  return status !== undefined && COUNTING_STATUSES.has(status)
}

/** "N×" só a partir de 2: uma zerada é o normal e não merece selo. */
export function replayBadgeCount(
  status: string | undefined,
  completions: number | undefined
): string | null {
  if (!countsCompletions(status)) return null
  if (!completions || completions < 2) return null
  return completions > MAX_COUNT ? `${MAX_COUNT}+` : `${completions}×`
}

export function isHundredPercent(
  game: { hundredPercent?: boolean; status?: string | null } | null | undefined
) {
  return game?.hundredPercent === true && game?.status === 'PLAYED'
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
  hundredPercent?: boolean
  favorite?: boolean
  platforms?: string[]
  /** Data do lançamento, só para jogo que ainda não saiu. */
  releasing?: string | null
  /** Data do lançamento de jogo que já saiu. */
  released?: string | null
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
  hundredPercent,
  favorite,
  platforms,
  releasing,
  released,
}: CardSummaryInput) {
  const parts: string[] = []
  if (tag) parts.push(tag)
  if (statusLabel) parts.push(statusLabel)
  if (rating != null) parts.push(`nota ${formatRating(rating)}`)
  if (completions && completions > 0) parts.push(completionsText(completions))
  if (endless) parts.push('Infinito')
  if (hundredPercent) parts.push('concluído a 100%')
  if (favorite) parts.push('favorito')
  if (platforms && platforms.length > 0) {
    parts.push(`jogado em ${platforms.join(', ')}`)
  }
  if (releasing) parts.push(`lança em ${releasing}`)
  if (released) parts.push(`lançado em ${released}`)
  return parts.join(', ')
}
