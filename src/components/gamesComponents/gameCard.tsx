import {
  CircleX,
  Gamepad2,
  Gem,
  Gift,
  Infinity as InfinityIcon,
  Library,
  Pause,
  Play,
  RotateCcw,
  Star,
} from 'lucide-react'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { useGameModal } from '../../hooks/useGameModal'
import type { GameCardProps } from '../../interfaces/games'
import { focusRing } from '../../styles/focus'
import {
  cardSummary,
  formatRating,
  replayBadgeCount,
} from '../../utils/cardBadges'
import { hiResCover } from '../../utils/hiResCover'
import { getLibraryPlatform } from '../../utils/libraryPlatforms'

export const LIBRARY_STATUS_BADGES: Record<
  string,
  { icon: typeof Gift; barColor: string; iconColor: string; label: string }
> = {
  WISHLIST: {
    icon: Gift,
    barColor: 'bg-pink-400',
    iconColor: 'text-pink-400',
    label: 'Lista de desejos',
  },
  PLAYING: {
    icon: Play,
    barColor: 'bg-emerald-400',
    iconColor: 'text-emerald-400',
    label: 'Jogando',
  },
  PAUSED: {
    icon: Pause,
    barColor: 'bg-sky-400',
    iconColor: 'text-sky-400',
    label: 'Pausado',
  },
  DROPPED: {
    icon: CircleX,
    barColor: 'bg-red-400',
    iconColor: 'text-red-400',
    label: 'Larguei',
  },
  BACKLOG: {
    icon: Library,
    barColor: 'bg-slate-400',
    iconColor: 'text-slate-400',
    label: 'Na fila',
  },
  PLAYED: {
    icon: Gamepad2,
    barColor: 'bg-amber-400',
    iconColor: 'text-amber-400',
    label: 'Jogado',
  },
}

const MAX_CARD_PLATFORMS = 3

const capsuleClass =
  'inline-flex h-5 items-stretch overflow-hidden rounded-full border border-dark-border bg-dark-bg/90 shadow-sm shadow-black/40 sm:h-6 [&>*+*]:border-l [&>*+*]:border-dark-border'

const sizes = {
  small: 'w-14 h-16',
  medium: 'aspect-[7/10] w-full',
  compact: 'w-32 h-44',
  larger: 'w-44 h-56',
  row: 'aspect-[7/10] w-11',
  feature: 'aspect-[7/10] w-[92px]',
}

const CATEGORY_TAGS: Record<number, string> = {
  1: 'DLC',
  2: 'Expansão',
  3: 'Bundle',
  4: 'Expansão Standalone',
  6: 'Episódio',
  7: 'Temporada',
  8: 'Remake',
  9: 'Remaster',
  10: 'Edição Expandida',
  11: 'Port',
  13: 'Pacote',
  14: 'Atualização',
}

const TEXT_HINTS: Array<{ pattern: RegExp; tag: string }> = [
  { pattern: /\bremake\b|reimagin/i, tag: 'Remake' },
  { pattern: /\bremaster/i, tag: 'Remaster' },
  { pattern: /\bport\b/i, tag: 'Port' },
  {
    pattern:
      /definitive edition|enhanced edition|goty|game of the year edition|anniversary edition/i,
    tag: 'Edição Especial',
  },
]

export function getGameTag(
  name: string,
  summary: string | undefined,
  category: number | undefined,
  parentGameId: number | null | undefined
) {
  if (parentGameId == null) return null
  if (category !== undefined && CATEGORY_TAGS[category]) {
    return CATEGORY_TAGS[category]
  }

  for (const { pattern, tag } of TEXT_HINTS) {
    if (pattern.test(name) || (summary && pattern.test(summary))) return tag
  }

  return 'DLC/Edição'
}

export function GameCard({
  game,
  className,
  size = 'medium',
  enableModal,
  interactive = true,
}: GameCardProps) {
  const openGame = useGameModal()
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const coverSrc = game?.coverUrl ? hiResCover(game.coverUrl) : null
  const coverLoaded = coverSrc !== null && loadedSrc === coverSrc
  const coverFailed = coverSrc !== null && failedSrc === coverSrc
  const bare = size === 'small' || size === 'row' || size === 'feature'
  const tag =
    game && !bare
      ? getGameTag(game.name, game.summary, game.category, game.parentGameId)
      : null

  const showRating = !bare && game?.rating != null
  const ratingText = game?.rating != null ? formatRating(game.rating) : ''
  const showEndless = !bare && game?.endless === true
  const showHundred =
    !bare && game?.hundredPercent === true && game?.status === 'PLAYED'
  const replayCount = bare
    ? null
    : replayBadgeCount(game?.status, game?.completions)
  const statusBadge =
    !bare && game?.status ? LIBRARY_STATUS_BADGES[game.status] : undefined
  const accentColor = statusBadge?.iconColor ?? 'text-primary'
  const playedOn = !bare
    ? (game?.playedOn ?? [])
        .map(getLibraryPlatform)
        .filter(p => p !== undefined)
    : []
  const visiblePlatforms = playedOn.slice(0, MAX_CARD_PLATFORMS)
  const hiddenPlatformCount = playedOn.length - visiblePlatforms.length

  const summaryText = bare
    ? ''
    : cardSummary({
        tag,
        statusLabel: statusBadge?.label,
        rating: showRating ? game?.rating : null,
        completions: replayCount ? game?.completions : 0,
        endless: showEndless,
        hundredPercent: showHundred,
        platforms: playedOn.map(platform => platform.label),
      })

  const lifts = !bare
  const cardClassName = twMerge(
    'group relative rounded-lg overflow-hidden',
    lifts &&
      'hover:ring-1 ring-primary/40 transition-transform duration-200 hover:scale-[1.02] [container-type:inline-size]',
    showHundred && 'hundred-frame hover:ring-0',
    interactive && focusRing,
    size === 'medium' ? 'block w-full' : sizes[size]
  )

  const cardContent = (
    <>
      {statusBadge && !showHundred && (
        <span
          className={`absolute top-0 inset-x-0 h-0.5 z-10 ${statusBadge.barColor}`}
          aria-hidden="true"
        />
      )}

      {(tag || statusBadge) && (
        <div
          className="absolute left-1.5 right-2 top-2 z-10 flex items-start gap-1"
          aria-hidden="true"
        >
          <span className="min-w-0">
            {tag && (
              <span className="block max-w-full truncate rounded border border-dark-border bg-dark-bg/90 px-1 py-0.5 text-[8px] font-medium text-gray-300 sm:px-1.5 sm:text-[10px]">
                {tag}
              </span>
            )}
          </span>
          {statusBadge && (
            <span className={`ml-auto ${capsuleClass}`}>
              {replayCount && (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 text-[10px] font-bold tabular-nums text-gray-100 sm:px-2"
                  title={`Zerado ${game?.completions}×`}
                >
                  <RotateCcw
                    className="size-3 overflow-visible text-primary-light sm:size-3.5"
                    strokeWidth={2.5}
                  />
                  {replayCount}
                </span>
              )}
              <span
                className="inline-flex aspect-square items-center justify-center"
                title={statusBadge.label}
              >
                {showHundred ? (
                  <Gem
                    className="size-3 overflow-visible fill-current text-[#dbe6ff] sm:size-3.5"
                    strokeWidth={2.5}
                  />
                ) : (
                  <statusBadge.icon
                    className={`size-3 overflow-visible sm:size-3.5 ${statusBadge.iconColor}`}
                    strokeWidth={2.5}
                  />
                )}
              </span>
            </span>
          )}
        </div>
      )}

      {(showRating || showEndless || visiblePlatforms.length > 0) && (
        <div
          className="absolute bottom-2 left-2 z-10 max-w-[calc(100%-1rem)]"
          aria-hidden="true"
        >
          <span className={capsuleClass}>
            {showRating && (
              <span
                className="inline-flex items-center gap-1 px-1.5 text-[9px] font-medium leading-none text-gray-200 sm:px-2 sm:text-[11px]"
                title="Nota"
              >
                <Star
                  className={`size-2.5 overflow-visible fill-current sm:size-3 ${accentColor}`}
                />
                {ratingText}
              </span>
            )}
            {showEndless && (
              <span
                className="inline-flex items-center px-1.5 sm:px-2"
                title="Infinito"
              >
                <InfinityIcon className="size-2.5 text-primary-light sm:size-3" />
              </span>
            )}
            {visiblePlatforms.length > 0 && (
              <span
                className="inline-flex items-center gap-1 px-1.5 text-[9px] font-medium leading-none text-gray-200 sm:px-2 sm:text-[11px]"
                title={playedOn.map(platform => platform.label).join(', ')}
              >
                {visiblePlatforms.map(({ value, icon: Icon }, index) => (
                  <Icon
                    key={value}
                    className={`size-2.5 shrink-0 overflow-visible text-gray-200 sm:size-3 ${index > 0 ? 'hidden [@container(min-width:160px)]:block' : ''}`}
                  />
                ))}
                {playedOn.length > 1 && (
                  <span className="[@container(min-width:160px)]:hidden">
                    +{playedOn.length - 1}
                  </span>
                )}
                {hiddenPlatformCount > 0 && (
                  <span className="hidden [@container(min-width:160px)]:inline">
                    +{hiddenPlatformCount}
                  </span>
                )}
              </span>
            )}
          </span>
        </div>
      )}

      {coverSrc && !coverFailed ? (
        <>
          {!coverLoaded && (
            <div
              className="absolute inset-0 animate-pulse rounded-lg bg-dark-bg-lighter motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          <img
            ref={el => {
              if (el?.complete && el.naturalWidth > 0) setLoadedSrc(coverSrc)
            }}
            className={twMerge(
              sizes[size],
              'rounded-lg object-cover transition-opacity duration-200',
              !coverLoaded && 'opacity-0',
              !bare && coverLoaded && 'group-hover:opacity-20'
            )}
            src={coverSrc}
            loading="lazy"
            alt={game?.name ?? ''}
            onLoad={() => setLoadedSrc(coverSrc)}
            onError={() => setFailedSrc(coverSrc)}
          />
        </>
      ) : (
        <div
          className={twMerge(
            sizes[size],
            'rounded-lg bg-dark-bg-lighter flex items-center justify-center'
          )}
        >
          <span className="sr-only">{game?.name}</span>
          <span className="text-gray-400 text-xs text-center px-1">
            Sem capa
          </span>
        </div>
      )}

      {summaryText && <span className="sr-only">, {summaryText}</span>}

      {!bare && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <span className="text-white font-semibold text-center px-3 text-sm md:text-base translate-y-2 group-hover:translate-y-0 transition-transform duration-200 drop-shadow-lg">
            {game?.name}
          </span>
        </div>
      )}
    </>
  )

  return (
    <>
      <div className={twMerge('flex justify-center', className)}>
        {interactive ? (
          <button
            type="button"
            data-game-id={game?.igdbId}
            onClick={event =>
              enableModal && game && openGame(game, event.currentTarget)
            }
            className={cardClassName}
          >
            {cardContent}
          </button>
        ) : (
          <div className={cardClassName}>{cardContent}</div>
        )}
      </div>
    </>
  )
}
