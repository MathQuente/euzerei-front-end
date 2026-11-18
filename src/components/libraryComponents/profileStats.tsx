import { Clock, Gamepad2, LayoutGrid, Library, Play } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { focusRing } from '../../styles/focus'
import type { TotalPerStatus } from '../../types/games'
import {
  formatHoursCompact,
  formatHoursSpoken,
  playedWord,
} from '../../utils/hours'

interface ProfileStatsProps {
  gamesAmount: number
  totalHoursPlayed: number
  totalPerStatus?: TotalPerStatus[]
  onRetry?: () => unknown
  queueIncludesDropped?: boolean
  /**
   * rail: números ao lado do avatar (telas largas); strip: faixa abaixo do
   * cabeçalho (telas estreitas); retry: só o aviso de erro com o botão.
   */
  variant?: 'rail' | 'strip' | 'retry'
}

function RailCell({
  value,
  label,
  spoken,
}: {
  value: string
  label: string
  spoken: string
}) {
  return (
    <li className="border-l border-dark-border px-4 first:border-l-0 first:pl-0 last:pr-0">
      <span className="flex flex-col items-center gap-1" aria-hidden="true">
        <b className="font-display text-xl font-bold leading-none tracking-tight tabular-nums text-white">
          {value}
        </b>
        <span className="text-[10px] uppercase tracking-widest text-gray-400">
          {label}
        </span>
      </span>
      <span className="sr-only">{spoken}</span>
    </li>
  )
}

function Cell({
  icon,
  value,
  label,
  spoken,
}: {
  icon: ReactNode
  value: string
  label: string
  spoken: string
}) {
  return (
    <li className="flex items-center gap-1.5 text-sm text-gray-400">
      <span className="text-primary-link" aria-hidden="true">
        {icon}
      </span>
      <span className="flex items-baseline gap-1" aria-hidden="true">
        <b className="font-display font-bold tabular-nums text-white">
          {value}
        </b>
        <span>{label}</span>
      </span>
      <span className="sr-only">{spoken}</span>
    </li>
  )
}

const iconClass = 'size-4'

export function ProfileStats({
  gamesAmount,
  totalHoursPlayed,
  totalPerStatus,
  onRetry,
  queueIncludesDropped = false,
  variant = 'strip',
}: ProfileStatsProps) {
  const failed = onRetry !== undefined
  const [retrying, setRetrying] = useState(false)
  const retry = async () => {
    setRetrying(true)
    try {
      await onRetry?.()
    } finally {
      setRetrying(false)
    }
  }
  const countOf = (status: string) =>
    totalPerStatus
      ? (totalPerStatus.find(t => t.status === status)?.totalGames ?? 0)
      : null

  const fmt = (n: number | null) =>
    n === null ? '—' : n.toLocaleString('pt-BR')
  const spokenCount = (n: number | null, one: string, many = one) =>
    n === null
      ? `${many}: ${failed ? 'indisponível' : 'carregando'}`
      : `${fmt(n)} ${n === 1 ? one : many}`

  const played = countOf('PLAYED')
  const playing = countOf('PLAYING')
  const pending = countOf('BACKLOG')
  const backlog =
    pending === null || !queueIncludesDropped
      ? pending
      : pending + (countOf('DROPPED') ?? 0)

  if (variant === 'rail') {
    return (
      <ul
        aria-label="Estatísticas da biblioteca"
        className="m-0 flex list-none items-end p-0"
      >
        <RailCell
          value={fmt(gamesAmount)}
          label="Jogos"
          spoken={`${fmt(gamesAmount)} ${gamesAmount === 1 ? 'jogo' : 'jogos'}`}
        />
        <RailCell
          value={fmt(played)}
          label="Zerados"
          spoken={spokenCount(played, 'zerado', 'zerados')}
        />
        <RailCell
          value={fmt(playing)}
          label="Jogando"
          spoken={spokenCount(playing, 'jogando')}
        />
        <RailCell
          value={fmt(backlog)}
          label="Na fila"
          spoken={spokenCount(backlog, 'na fila')}
        />
        <RailCell
          value={formatHoursCompact(totalHoursPlayed)}
          label="Horas"
          spoken={`${formatHoursSpoken(totalHoursPlayed)} ${playedWord(totalHoursPlayed)}`}
        />
      </ul>
    )
  }

  const retryBlock = onRetry && (
    <div className="flex flex-wrap items-center gap-x-3 border-t border-dark-border px-4 py-1 text-sm text-gray-300 sm:px-6">
      <output>Não foi possível carregar zerados, jogando e na fila.</output>
      <button
        type="button"
        onClick={retry}
        disabled={retrying}
        className={`min-h-11 rounded-sm px-1 text-primary-link underline underline-offset-4 transition-colors hover:text-white disabled:opacity-50 ${focusRing}`}
      >
        {retrying ? 'Tentando…' : 'Tentar de novo'}
      </button>
    </div>
  )

  if (variant === 'retry') return <>{retryBlock}</>

  return (
    <>
      <ul
        aria-label="Estatísticas da biblioteca"
        className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-2 border-t border-dark-border px-4 py-3 sm:px-6"
      >
        <Cell
          icon={<LayoutGrid className={iconClass} />}
          value={fmt(gamesAmount)}
          label="Jogos"
          spoken={`${fmt(gamesAmount)} ${gamesAmount === 1 ? 'jogo' : 'jogos'}`}
        />
        <Cell
          icon={<Gamepad2 className={iconClass} />}
          value={fmt(played)}
          label="Zerados"
          spoken={spokenCount(played, 'zerado', 'zerados')}
        />
        <Cell
          icon={<Play className={iconClass} />}
          value={fmt(playing)}
          label="Jogando"
          spoken={spokenCount(playing, 'jogando')}
        />
        <Cell
          icon={<Library className={iconClass} />}
          value={fmt(backlog)}
          label="Na fila"
          spoken={spokenCount(backlog, 'na fila')}
        />
        <Cell
          icon={<Clock className={iconClass} />}
          value={formatHoursCompact(totalHoursPlayed)}
          label="Horas"
          spoken={`${formatHoursSpoken(totalHoursPlayed)} ${playedWord(totalHoursPlayed)}`}
        />
      </ul>
    </>
  )
}
