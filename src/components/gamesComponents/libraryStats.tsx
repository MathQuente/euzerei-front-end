import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import { useCompletedAt } from '../../hooks/useCompletedAt'
import { useGamePlatforms } from '../../hooks/useGamePlatforms'
import { useGameStatus } from '../../hooks/useGameStatus'
import { useHoursPlayed } from '../../hooks/useHoursPlayed'
import { usePlayedCount } from '../../hooks/usePlayedCount'
import { useRating } from '../../hooks/useRating'
import type { GameCardData } from '../../types/games'
import { formatHours, playedWord } from '../../utils/hours'
import { formatReleaseLabel } from '../../utils/releaseDate'
import { RatingAverage } from '../ratingAverage'
import { PlatformList } from './platformList'

const valueClass = 'font-display font-extrabold tabular-nums'
const rowGrid = 'grid grid-cols-[84px_minmax(0,1fr)] gap-x-3'

function Row({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className={`${rowGrid} items-baseline`}>
      <span className="text-xs text-gray-400">{label}</span>
      <div>{children}</div>
    </div>
  )
}

/**
 * Bloco abaixo dos botões de status. Uma gramática só, sempre na mesma ordem:
 * Tempo → Plataformas → Zerado/Lançamento → Nota. O estado do jogo só omite
 * linhas, nunca troca a ordem; uma plataforma é uma lista de uma.
 */
export function LibraryStats({
  game,
  onSeeDetails,
}: {
  game: GameCardData
  onSeeDetails?: () => void
}) {
  const igdbId = game.igdbId.toString()
  const { platforms, totals, isLoading } = useGamePlatforms(igdbId, true)
  const { hoursPlayed } = useHoursPlayed(igdbId)
  const { completions } = usePlayedCount(igdbId)
  const { completedAt } = useCompletedAt(igdbId)
  const { gameStatus } = useGameStatus(igdbId)
  const { userRating, isLoading: ratingIsLoading } = useRating(igdbId)

  if (isLoading) {
    return <div className="h-20 rounded-lg bg-dark-bg animate-pulse" />
  }

  const hasPlatforms = platforms.length > 0
  const hours = hasPlatforms ? (totals?.hoursPlayed ?? 0) : hoursPlayed
  const times = hasPlatforms ? (totals?.completions ?? 0) : completions
  const doneAt = hasPlatforms
    ? totals?.completedAt
    : completions > 0
      ? completedAt
      : null

  const isReleased = game.releaseDate
    ? new Date() > new Date(game.releaseDate * 1000)
    : false

  const dateText = (value: string) => (
    <b className={`${valueClass} text-[13px] text-white`}>{value}</b>
  )
  const doneDate = doneAt ? dayjs(doneAt).format('DD/MM/YYYY') : null
  const upcomingDate =
    !isReleased && game.releaseDate
      ? formatReleaseLabel(game.releaseDate, game.releaseDatePrecision)
      : null
  const factLabel = upcomingDate
    ? 'Lançamento'
    : times > 0
      ? 'Zerado'
      : doneDate
        ? 'Finalizado'
        : null
  const factValue = upcomingDate ? (
    dateText(upcomingDate)
  ) : (
    <>
      {times > 0 && (
        <>
          {dateText(String(times))} {times === 1 ? 'vez' : 'vezes'}
        </>
      )}
      {times > 0 && doneDate && (
        <>
          {times === 1 ? ' em ' : <span aria-hidden="true"> · </span>}
          {times > 1 && <span>última em </span>}
        </>
      )}
      {doneDate && dateText(doneDate)}
    </>
  )

  const droppedDate = gameStatus?.droppedAt
    ? dayjs(gameStatus.droppedAt).format('DD/MM/YYYY')
    : null

  const ratingLabel =
    !ratingIsLoading && userRating == null ? 'Dê uma nota' : 'Nota'

  return (
    <div className="flex flex-col gap-1.5">
      {hours > 0 && (
        <Row label="Tempo">
          <span className={`${valueClass} text-[15px] text-primary-light`}>
            {formatHours(hours)}
          </span>{' '}
          <span className="text-[13px] text-gray-400">{playedWord(hours)}</span>
        </Row>
      )}
      <Row label="Plataformas">
        <PlatformList platforms={platforms} onSeeDetails={onSeeDetails} />
      </Row>
      {factLabel && (
        <Row label={factLabel}>
          <span className="text-[13px] text-gray-400">{factValue}</span>
        </Row>
      )}
      {droppedDate && (
        <Row label="Largado">
          <span className="text-[13px] text-gray-400">
            em {dateText(droppedDate)}
          </span>
        </Row>
      )}
      {isReleased && (
        <div className={`${rowGrid} min-h-11 items-center`}>
          <span className="text-xs text-gray-400">{ratingLabel}</span>
          <RatingAverage game={game} isForGamePage showValue />
        </div>
      )}
    </div>
  )
}
