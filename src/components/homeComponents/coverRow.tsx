import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { focusRing } from '../../styles/focus'
import type { GameCardData } from '../../types/games'
import { GameCard } from '../gamesComponents/gameCard'
import { coverLink } from './styles'

interface CoverRowProps<T extends GameCardData> {
  games: T[]
  renderMeta?: (game: T) => ReactNode
  className?: string
  itemClassName?: string
}

const arrowClass = `absolute top-[calc(50%-1.75rem)] z-10 hidden size-9 place-items-center rounded-full border border-dark-border bg-dark-bg/90 text-white shadow-lg shadow-black/40 transition-opacity hover:border-primary-light disabled:pointer-events-none disabled:opacity-0 motion-reduce:transition-none sm:grid ${focusRing}`

export function CoverRow<T extends GameCardData>({
  games,
  renderMeta,
  className,
  itemClassName,
}: CoverRowProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const sync = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    sync()
    emblaApi.on('select', sync).on('reInit', sync).on('scroll', sync)
    return () => {
      emblaApi.off('select', sync).off('reInit', sync).off('scroll', sync)
    }
  }, [emblaApi, sync])

  // biome-ignore lint/correctness/useExhaustiveDependencies(games.length): a quantidade de jogos muda a largura total; o carrossel recalcula
  useEffect(() => {
    emblaApi?.reInit()
  }, [emblaApi, games.length])

  return (
    <div className={twMerge('relative -mx-4 sm:-mx-6', className)}>
      <button
        type="button"
        aria-label="Capas anteriores"
        disabled={!canPrev}
        onClick={() => emblaApi?.scrollPrev()}
        className={`${arrowClass} left-1.5`}
      >
        <ChevronLeft className="size-[18px]" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Próximas capas"
        disabled={!canNext}
        onClick={() => emblaApi?.scrollNext()}
        className={`${arrowClass} right-1.5`}
      >
        <ChevronRight className="size-[18px]" aria-hidden="true" />
      </button>

      <div ref={emblaRef} className="-my-1 overflow-hidden px-4 py-1 sm:px-6">
        <ul className="flex gap-3 touch-pan-y">
          {games.map(game => (
            <li
              key={game.igdbId}
              className={twMerge('w-28 flex-none sm:w-40', itemClassName)}
            >
              <Link
                to={`/games/${encodeURIComponent(game.igdbId)}`}
                className={coverLink}
              >
                <GameCard game={game} size="medium" interactive={false} />
                <p className="mt-2 line-clamp-2 text-sm leading-snug text-white">
                  {game.name}
                </p>
                {renderMeta?.(game)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
