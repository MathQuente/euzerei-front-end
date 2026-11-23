import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

// Margem à direita de cada capa (mr-3). Não usar `gap` na lista: o Embla lê a
// margem do último slide para fechar a emenda do loop, e o `gap` não conta.
const GAP_PX = 12
// Embla só faz o loop se a faixa for bem maior que a janela; abaixo disso,
// a lista é repetida até passar de duas janelas.
const MIN_TRACK_RATIO = 2

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
  const [copies, setCopies] = useState(1)
  const rootRef = useRef<HTMLDivElement>(null)
  const plugins = useMemo(
    () =>
      prefersReducedMotion()
        ? []
        : [
            Autoplay({
              delay: 2200,
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
    emblaApi.on('select', sync).on('reInit', sync)
    return () => {
      emblaApi.off('select', sync).off('reInit', sync)
    }
  }, [emblaApi, sync])

  useEffect(() => {
    const root = rootRef.current
    if (!root || games.length === 0) return

    const measure = () => {
      const item = root.querySelector('li')
      if (!item) return
      const setWidth = games.length * (item.offsetWidth + GAP_PX)
      const next = Math.max(
        1,
        Math.ceil((root.clientWidth * MIN_TRACK_RATIO) / setWidth)
      )
      setCopies(next)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [games.length])

  // O Firefox só arredonda a posição fracionária da faixa quando o movimento
  // acaba, e as capas dão um pulinho. Arredondar a cada quadro evita isso.
  useEffect(() => {
    if (!emblaApi) return
    const track = emblaApi.containerNode()
    const snapToPixel = () => {
      const match = /translate3d\((-?[\d.]+)px/.exec(track.style.transform)
      if (!match) return
      track.style.transform = `translate3d(${Math.round(Number(match[1]))}px, 0px, 0px)`
    }
    emblaApi.on('scroll', snapToPixel).on('settle', snapToPixel)
    return () => {
      emblaApi.off('scroll', snapToPixel).off('settle', snapToPixel)
    }
  }, [emblaApi])

  // biome-ignore lint/correctness/useExhaustiveDependencies(games.length): a quantidade de jogos e de cópias muda a largura total; o carrossel recalcula
  // biome-ignore lint/correctness/useExhaustiveDependencies(copies): idem
  useEffect(() => {
    emblaApi?.reInit()
  }, [emblaApi, games.length, copies])

  return (
    <div
      ref={rootRef}
      className={twMerge('relative', bleedClassName, className)}
    >
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
        <ul className="flex touch-pan-y">
          {Array.from({ length: copies }, (_, copy) => copy).flatMap(copy =>
            games.map(game => (
              <li
                key={`${copy}-${game.igdbId}`}
                aria-hidden={copy > 0 || undefined}
                className={twMerge(
                  'mr-3 w-28 flex-none sm:w-40',
                  itemClassName
                )}
              >
                <Link
                  to={gamePath(game)}
                  className={coverLink}
                  tabIndex={copy > 0 ? -1 : undefined}
                >
                  <GameCard
                    game={game}
                    size="medium"
                    interactive={false}
                    hoverEffects={false}
                    eager
                  />
                  <p className="mt-2 line-clamp-2 text-sm leading-snug text-white">
                    {game.name}
                  </p>
                  {renderMeta?.(game)}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
