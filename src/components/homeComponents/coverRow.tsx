import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { prefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { focusRing } from '../../styles/focus'
import type { GameCardData } from '../../types/games'
import { gamePath } from '../../utils/gamePath'
import { GameCard } from '../gamesComponents/gameCard'
import { coverLink } from './styles'

interface CoverRowProps<T extends GameCardData> {
  games: T[]
  renderMeta?: (game: T) => ReactNode
  className?: string
  itemClassName?: string
  /** Quanto a faixa sangra para fora do contêiner (padrão: a margem da página). */
  bleedClassName?: string
  /** Recuo interno que alinha as capas com o conteúdo do contêiner. */
  edgeClassName?: string
}

const arrowClass = `absolute top-[calc(50%-1.75rem)] z-10 grid size-9 place-items-center rounded-full border border-dark-border bg-dark-bg/90 text-white shadow-lg shadow-black/40 transition-opacity hover:border-primary-light disabled:pointer-events-none disabled:opacity-0 motion-reduce:transition-none ${focusRing}`

export function CoverRow<T extends GameCardData>({
  games,
  renderMeta,
  className,
  itemClassName,
  bleedClassName = '-mx-4 sm:-mx-6',
  edgeClassName = 'px-4 sm:px-6',
}: CoverRowProps<T>) {
  const [scrollable, setScrollable] = useState(true)
  const plugins = useMemo(
    () =>
      prefersReducedMotion()
        ? []
        : [
            Autoplay({
              delay: 3500,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ],
    []
  )
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      dragFree: true,
      loop: true,
      watchDrag: scrollable,
    },
    plugins
  )
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const sync = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
    setScrollable(emblaApi.canScrollPrev() || emblaApi.canScrollNext())
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
    <div className={twMerge('relative', bleedClassName, className)}>
      {scrollable && (
        <>
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
        </>
      )}

      <div
        ref={emblaRef}
        className={twMerge('-my-1 overflow-hidden py-1', edgeClassName)}
      >
        <ul className="flex gap-3 touch-pan-y">
          {games.map(game => (
            <li
              key={game.igdbId}
              className={twMerge('w-28 flex-none sm:w-40', itemClassName)}
            >
              <Link to={gamePath(game)} className={coverLink}>
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
