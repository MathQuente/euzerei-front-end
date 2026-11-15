import { Star } from 'lucide-react'
import { useState } from 'react'
import { useRating } from '../hooks/useRating'
import { focusRing } from '../styles/focus'

const BINS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
const MIN_RATINGS_FOR_CHART = 6
const nf = new Intl.NumberFormat('pt-BR')

const GHOST_HEIGHTS = [30, 45, 38, 60, 52, 75, 62, 88, 70, 95]
const GHOST_STRIPES =
  'repeating-linear-gradient(135deg, rgba(255,255,255,.07) 0 6px, rgba(255,255,255,.03) 6px 12px)'

function missingMessage(total: number) {
  if (total === 0) return 'Ninguém avaliou ainda.'
  const missing = MIN_RATINGS_FOR_CHART - total
  return missing === 1
    ? 'Falta 1 avaliação para mostrar o gráfico.'
    : `Faltam ${missing} avaliações para mostrar o gráfico.`
}

function FewRatings({ total, tall }: { total: number; tall?: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div
        className={`flex items-end gap-[3px] ${tall ? 'h-24' : 'h-16'}`}
        aria-hidden="true"
      >
        {GHOST_HEIGHTS.map((height, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: lista fixa de dez barras decorativas
            key={i}
            className="flex-1 rounded-t border border-b-0 border-dashed border-dark-border"
            style={{ height: `${height}%`, background: GHOST_STRIPES }}
          />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <p
          className={`font-semibold text-white ${tall ? 'text-[15px]' : 'text-[13px]'}`}
        >
          {missingMessage(total)}
        </p>
        {tall && (
          <p className="text-[13px] text-gray-400">
            O gráfico mostra como as notas se dividem de 0,5 a 5.
          </p>
        )}
      </div>
    </div>
  )
}

export function RatingChart({
  igdbId,
  tall,
}: {
  igdbId: string
  tall?: boolean
}) {
  const { allRatingsResponse, userRating } = useRating(igdbId)

  const [active, setActive] = useState<number | null>(null)

  if (!allRatingsResponse) return null

  const byValue = new Map<number, number>(
    allRatingsResponse.map(r => [Number(r.rating), r.count])
  )
  const counts = BINS.map(b => byValue.get(b) ?? 0)
  const total = counts.reduce((a, b) => a + b, 0)
  const max = Math.max(...counts)
  const activeCount = active === null ? 0 : counts[BINS.indexOf(active)]
  const plural = total === 1 ? 'avaliação' : 'avaliações'

  if (total < MIN_RATINGS_FOR_CHART) {
    return <FewRatings total={total} tall={tall} />
  }

  return (
    <figure className="flex flex-col gap-1.5 [container-type:inline-size]">
      <p className="min-h-4 text-xs text-gray-300" aria-hidden="true">
        {active !== null &&
          `${nf.format(active)}★: ${nf.format(activeCount)} ${activeCount === 1 ? 'avaliação' : 'avaliações'} · ${Math.round((activeCount / total) * 100)}%`}
      </p>
      <div className={`flex items-end gap-0.5 ${tall ? 'h-28' : 'h-24'}`}>
        {BINS.map((bin, i) => (
          <button
            key={bin}
            type="button"
            aria-label={`${nf.format(bin)} ${bin === 1 ? 'estrela' : 'estrelas'}: ${nf.format(counts[i])} ${counts[i] === 1 ? 'avaliação' : 'avaliações'}`}
            onPointerEnter={e => e.pointerType === 'mouse' && setActive(bin)}
            onPointerLeave={e => e.pointerType === 'mouse' && setActive(null)}
            onFocus={() => setActive(bin)}
            onBlur={() => setActive(null)}
            className={`flex h-full flex-1 items-end rounded-t ${focusRing}`}
          >
            <span
              className={`block w-full rounded-t ${
                userRating === bin || active === bin
                  ? 'bg-primary-hover-light'
                  : 'bg-primary-light'
              }`}
              style={{
                height: `${Math.max(counts[i] > 0 ? 4 : 1, (counts[i] / max) * 100)}%`,
              }}
            />
          </button>
        ))}
      </div>
      <div
        className="flex gap-0.5 text-xs font-medium text-gray-300"
        aria-hidden="true"
      >
        {BINS.map(bin => (
          <span
            key={bin}
            className={`flex flex-1 items-center justify-center gap-0.5 [@container(max-width:359px)]:flex-col [@container(max-width:359px)]:gap-0 ${active === bin ? 'font-bold text-white' : ''}`}
          >
            {nf.format(bin)}
            <Star className="size-3 fill-current" />
          </span>
        ))}
      </div>
      <p className="mt-0.5 border-t border-dark-border pt-2 text-center text-sm text-gray-300">
        <span className="text-lg font-bold text-white">{nf.format(total)}</span>{' '}
        {plural}
      </p>
    </figure>
  )
}
