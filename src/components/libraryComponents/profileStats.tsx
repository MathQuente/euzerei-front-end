import { Clock, Gamepad2, LayoutGrid, Library, Play } from 'lucide-react'
import type { ReactNode } from 'react'
import type { TotalPerStatus } from '../../types/games'
import { formatHoursCompact, formatHoursSpoken } from '../../utils/hours'

interface ProfileStatsProps {
  gamesAmount: number
  totalHoursPlayed: number
  totalPerStatus?: TotalPerStatus[]
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
    <li className="flex flex-col items-center gap-0.5 [&:nth-child(n+4)]:border-b-0 border-b border-r border-dark-border px-1.5 py-3 text-center text-xs text-gray-400 [&:nth-child(3n)]:border-r-0 sm:[&:nth-child(3n)]:border-r [&:last-child]:col-span-2 sm:[&:last-child]:col-span-1 [&:last-child]:border-r-0 sm:border-b-0 lg:flex-row lg:justify-center lg:gap-2 lg:px-2 lg:py-3.5 lg:text-sm">
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

// Com 5 células o último ocupa 2 colunas no celular; ao entrar "A 100%" (6) remova o col-span-2.
const iconClass = 'size-[18px]'

export function ProfileStats({
  gamesAmount,
  totalHoursPlayed,
  totalPerStatus,
}: ProfileStatsProps) {
  const countOf = (status: string) =>
    totalPerStatus
      ? (totalPerStatus.find(t => t.status === status)?.totalGames ?? 0)
      : null

  const fmt = (n: number | null) =>
    n === null ? '—' : n.toLocaleString('pt-BR')
  const spokenCount = (n: number | null, one: string, many = one) =>
    n === null ? `${many}: carregando` : `${fmt(n)} ${n === 1 ? one : many}`

  const played = countOf('PLAYED')
  const playing = countOf('PLAYING')
  const backlog = countOf('BACKLOG')

  return (
    <ul
      aria-label="Estatísticas da biblioteca"
      className="m-0 grid list-none grid-cols-3 border-t border-dark-border bg-dark-bg p-0 sm:grid-cols-5"
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
        spoken={`${formatHoursSpoken(totalHoursPlayed)} jogadas`}
      />
    </ul>
  )
}
