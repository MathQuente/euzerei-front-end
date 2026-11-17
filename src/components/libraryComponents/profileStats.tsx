import { Clock, Gamepad2, Gem, LayoutGrid, Library, Play } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { focusRing } from '../../styles/focus'
import type { TotalPerStatus } from '../../types/games'
import { formatHoursCompact, formatHoursSpoken } from '../../utils/hours'

interface ProfileStatsProps {
  gamesAmount: number
  totalHoursPlayed: number
  totalPerStatus?: TotalPerStatus[]
  hundredPercentCount?: number
  onRetry?: () => unknown
  queueIncludesDropped?: boolean
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
    <li className="flex flex-col items-center gap-0.5 bg-dark-bg px-1.5 py-3 text-center text-xs text-gray-400 lg:flex-row lg:justify-center lg:gap-2 lg:px-2 lg:py-3.5 lg:text-sm">
      <span className="text-gray-400" aria-hidden="true">
        {icon}
      </span>
      <span
        className="flex flex-col items-center gap-0.5 lg:flex-row lg:items-baseline lg:gap-1.5"
        aria-hidden="true"
      >
        <b className="font-display text-base font-bold tabular-nums text-white lg:text-lg">
          {value}
        </b>
        <span>{label}</span>
      </span>
      <span className="sr-only">{spoken}</span>
    </li>
  )
}

const iconClass = 'size-[18px]'

export function ProfileStats({
  gamesAmount,
  totalHoursPlayed,
  totalPerStatus,
  hundredPercentCount,
  onRetry,
  queueIncludesDropped = false,
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
  const hasHundred = hundredPercentCount !== undefined
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

  return (
    <>
      <ul
        aria-label="Estatísticas da biblioteca"
        className={`m-0 grid list-none grid-cols-3 gap-px border-t border-dark-border bg-dark-border p-0 ${hasHundred ? 'sm:grid-cols-6' : 'sm:grid-cols-5 max-sm:[&>li:last-child]:col-span-2'}`}
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
        {hasHundred && (
          <Cell
            icon={<Gem className={iconClass} />}
            value={fmt(hundredPercentCount)}
            label="A 100%"
            spoken={`${fmt(hundredPercentCount)} ${hundredPercentCount === 1 ? 'jogo' : 'jogos'} a 100%`}
          />
        )}
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
          spoken={`${formatHoursSpoken(totalHoursPlayed)} jogadas`}
        />
      </ul>
      {onRetry && (
        <div className="flex flex-wrap items-center gap-x-3 border-t border-dark-border bg-dark-bg px-4 py-1 text-sm text-gray-300 sm:px-6">
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
      )}
    </>
  )
}
