import { Star } from 'lucide-react'
import { useRating } from '../hooks/useRating'
import { RatingChart } from './ratingChart'

const STARS = [1, 2, 3, 4, 5]

export function ReviewSummary({ igdbId }: { igdbId: string }) {
  const { average, allRatingsResponse } = useRating(igdbId)

  const total =
    allRatingsResponse?.reduce((sum, item) => sum + item.count, 0) ?? 0
  const averageValue: number | null | undefined = average?.average

  if (!total || averageValue == null) return null

  const displayValue = (Math.floor(averageValue * 10) / 10).toLocaleString(
    'pt-BR',
    { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  )
  const fullStars = Math.floor(averageValue)

  return (
    <section
      aria-label="Resumo das notas"
      className="bg-dark-bg-light border border-dark-border rounded-lg p-5 grid gap-6 sm:grid-cols-[minmax(0,200px)_minmax(0,360px)] sm:justify-center sm:gap-12 items-center"
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Média da comunidade
        </p>
        <p className="text-5xl font-semibold leading-none text-white">
          {displayValue}
          <span className="text-base font-normal text-gray-400"> de 5</span>
        </p>
        <div
          // biome-ignore lint/a11y/useSemanticElements: role="img" com aria-label agrupa as estrelas; <img> não aceita filhos
          className="flex gap-0.5 text-primary-light"
          role="img"
          aria-label={`Nota média ${displayValue} de 5`}
        >
          {STARS.map(star => (
            <Star
              key={star}
              className={`size-[18px] ${star <= fullStars ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="text-sm text-gray-400">
          {total} {total === 1 ? 'nota' : 'notas'}
        </p>
      </div>

      <RatingChart igdbId={igdbId} tall />
    </section>
  )
}
