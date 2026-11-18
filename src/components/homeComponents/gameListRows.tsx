import { useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { refreshAfterRelease } from '../../hooks/invalidateGameLists'
import { useRating } from '../../hooks/useRating'
import { useReleaseCountdown } from '../../hooks/useReleaseCountdown'
import type { SectionType } from '../../interfaces/games'
import type { GameBase } from '../../types/games'
import { gamePath } from '../../utils/gamePath'
import { shortPlatforms } from '../../utils/platformLabel'
import {
  countdownSpoken,
  formatCountdown,
  formatReleaseDayMonth,
  formatReleaseLabel,
  isFarAway,
  releaseYear,
  shortCountdown,
  shortReleaseLabel,
} from '../../utils/releaseDate'
import { GameCard } from '../gamesComponents/gameCard'
import { rowLink } from './styles'

const SCORE_FORMAT = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const SOON_DAYS = 7

type ScoreVariant = 'meta' | 'row' | 'feature'

export function RatedScore({
  igdbId,
  variant = 'meta',
}: {
  igdbId: number
  variant?: ScoreVariant
}) {
  const { average, isAverageLoading, isAverageError } = useRating(
    igdbId.toString()
  )

  const score =
    isAverageLoading || isAverageError || !average || average.average == null
      ? null
      : SCORE_FORMAT.format(average.average)

  if (score === null) {
    return (
      <p className="text-xs text-gray-400">
        {isAverageLoading ? '—' : 'Sem avaliações'}
      </p>
    )
  }

  if (variant === 'feature') {
    return (
      <p className="flex items-baseline gap-1 text-white">
        <Star
          className="size-5 self-center fill-current text-gray-300"
          aria-hidden="true"
        />
        <span className="font-display text-2xl font-extrabold tracking-tight tabular-nums">
          {score}
        </span>
        <span className="text-xs text-gray-400">/5</span>
      </p>
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center gap-1 ${variant === 'meta' ? 'mt-0.5' : ''}`}
    >
      <Star className="size-3 fill-gray-300 text-gray-300" aria-hidden="true" />
      <span className="text-xs font-medium tabular-nums text-gray-300">
        {score}
      </span>
      <span className="text-xs text-gray-400">/5</span>
    </div>
  )
}

function CountdownColumn({ game }: { game: GameBase }) {
  const queryClient = useQueryClient()
  const countdown = useReleaseCountdown(
    game.releaseDate,
    game.releaseDatePrecision,
    {
      granularity: 'minute',
      onRelease: () => refreshAfterRelease(queryClient),
    }
  )
  const ts = game.releaseDate

  const column = (spoken: string, visual: ReactNode) => (
    <span className="flex w-10 shrink-0 flex-col items-center leading-none">
      <span className="sr-only">{spoken}</span>
      <span aria-hidden="true" className="flex flex-col items-center">
        {visual}
      </span>
    </span>
  )

  if (countdown.kind === 'later' && !isFarAway(countdown.days)) {
    const tone =
      countdown.days <= SOON_DAYS ? 'text-primary-link' : 'text-gray-300'
    return column(
      `em ${countdown.days} dias`,
      <>
        <span
          className={`font-display text-xl font-extrabold tabular-nums ${tone}`}
        >
          {countdown.days}
        </span>
        <span className="mt-1 text-[10px] tracking-wide text-gray-400">
          dias
        </span>
      </>
    )
  }

  if (countdown.kind === 'last-day') {
    const short = shortCountdown(countdown.ms)
    return column(
      `faltam ${countdownSpoken(countdown.ms)}`,
      <>
        <span className="font-display text-xl font-extrabold tabular-nums text-amber-400">
          {short.value}
        </span>
        <span className="mt-1 text-[10px] tracking-wide text-gray-400">
          {short.unit}
        </span>
      </>
    )
  }

  if (countdown.kind === 'today') {
    return column(
      'chegou o dia',
      <span className="text-xs font-semibold text-amber-400">saiu!</span>
    )
  }

  return (
    <span className="w-10 shrink-0 text-center text-xs tabular-nums text-gray-400">
      {ts ? shortReleaseLabel(ts, game.releaseDatePrecision) : '—'}
    </span>
  )
}

function platformsText(game: GameBase) {
  const { visible, hidden } = shortPlatforms(game.platforms)
  if (visible.length === 0) return ''
  return visible.join(' · ') + (hidden > 0 ? ` +${hidden}` : '')
}

function supportText(game: GameBase, type: SectionType) {
  const parts: Array<string | undefined> = []

  if (type === 'coming') {
    parts.push(
      game.releaseDate
        ? formatReleaseLabel(game.releaseDate, game.releaseDatePrecision)
        : undefined
    )
  } else {
    if (type === 'trending' && game.releaseDate) {
      parts.push(String(releaseYear(game.releaseDate)))
    }
    parts.push(game.genres?.[0])
  }

  parts.push(platformsText(game))
  return parts.filter(Boolean).join(' · ')
}

function featureLines(game: GameBase, type: SectionType) {
  const year = !game.releaseDate
    ? ''
    : type === 'coming'
      ? formatReleaseLabel(game.releaseDate, game.releaseDatePrecision)
      : type === 'trending'
        ? String(releaseYear(game.releaseDate))
        : ''
  const genres =
    type === 'coming' ? '' : (game.genres ?? []).slice(0, 2).join(', ')
  return {
    lineA: [year, genres].filter(Boolean).join(' · '),
    lineB: platformsText(game),
  }
}

function FeaturedCountdown({ game }: { game: GameBase }) {
  const queryClient = useQueryClient()
  const countdown = useReleaseCountdown(
    game.releaseDate,
    game.releaseDatePrecision,
    {
      granularity: 'second',
      onRelease: () => refreshAfterRelease(queryClient),
    }
  )
  const big = 'font-display text-2xl font-extrabold tracking-tight tabular-nums'

  if (countdown.kind === 'later' && !isFarAway(countdown.days)) {
    const tone =
      countdown.days <= SOON_DAYS ? 'text-primary-link' : 'text-gray-300'
    return (
      <p className="flex items-baseline gap-2">
        <span className="sr-only">em {countdown.days} dias</span>
        <span aria-hidden="true" className={`${big} ${tone}`}>
          {countdown.days}
        </span>
        <span aria-hidden="true" className="text-sm text-gray-400">
          dias
        </span>
      </p>
    )
  }

  if (countdown.kind === 'last-day') {
    return (
      <p>
        <span className="sr-only">faltam {countdownSpoken(countdown.ms)}</span>
        <span aria-hidden="true" className={`${big} text-amber-400`}>
          {formatCountdown(countdown.ms)}
        </span>
      </p>
    )
  }

  if (countdown.kind === 'today') {
    return (
      <p>
        <span className="sr-only">chegou o dia</span>
        <span aria-hidden="true" className={`${big} text-amber-400`}>
          saiu!
        </span>
      </p>
    )
  }

  return (
    <p className={`${big} text-white`}>
      {game.releaseDate
        ? countdown.kind === 'uncertain'
          ? formatReleaseLabel(game.releaseDate, game.releaseDatePrecision)
          : formatReleaseDayMonth(game.releaseDate)
        : '—'}
    </p>
  )
}

export function GameRow({
  game,
  type,
  rank,
}: {
  game: GameBase
  type: SectionType
  rank?: number
}) {
  return (
    <Link to={gamePath(game)} className={rowLink}>
      {rank !== undefined && (
        <span
          className="w-5 shrink-0 text-right font-display text-lg font-extrabold tabular-nums text-gray-400"
          aria-hidden="true"
        >
          {rank}
        </span>
      )}
      {type === 'coming' && <CountdownColumn game={game} />}
      <GameCard game={game} size="row" interactive={false} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-white">{game.name}</p>
        <p className="truncate text-xs text-gray-400">
          {supportText(game, type)}
        </p>
      </div>
      {type === 'rateds' && <RatedScore igdbId={game.igdbId} variant="row" />}
    </Link>
  )
}

export function FeaturedGameRow({
  game,
  type,
}: {
  game: GameBase
  type: SectionType
}) {
  const { lineA, lineB } = featureLines(game, type)

  return (
    <Link to={gamePath(game)} className={`${rowLink} items-start gap-4`}>
      <GameCard game={game} size="feature" interactive={false} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {type === 'coming' && <FeaturedCountdown game={game} />}
        {type === 'trending' && (
          <p
            className="font-display text-2xl font-extrabold tracking-tight tabular-nums text-white"
            aria-hidden="true"
          >
            1
          </p>
        )}
        {type === 'rateds' && (
          <RatedScore igdbId={game.igdbId} variant="feature" />
        )}
        <p className="line-clamp-2 text-[17px] font-semibold leading-tight text-white">
          {game.name}
        </p>
        {lineA && <p className="text-xs text-gray-400">{lineA}</p>}
        {lineB && <p className="text-xs text-gray-400">{lineB}</p>}
      </div>
    </Link>
  )
}
