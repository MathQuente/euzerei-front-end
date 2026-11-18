import * as Popover from '@radix-ui/react-popover'
import { ChevronRight, Users } from 'lucide-react'
import { focusRing } from '../../styles/focus'
import type { UserGamePlatformEntry } from '../../types/platform'
import { hasAccountBreakdown } from '../../utils/accountHours'
import { formatHours } from '../../utils/hours'
import { getLibraryPlatform } from '../../utils/libraryPlatforms'
import { entryDisplayName, entryKey } from '../../utils/platformConsoles'

/** Mais que isso e o resto vira "+N plataformas" (mostra MAX_LINES - 1). */
const MAX_LINES = 4

const valueClass = 'font-display font-extrabold tabular-nums'

function Icon({
  entry,
  muted,
}: {
  entry: UserGamePlatformEntry
  muted?: boolean
}) {
  const option = getLibraryPlatform(entry.platform)
  if (!option) return null
  const Glyph = option.icon
  return (
    <Glyph
      className={`size-3.5 shrink-0 ${muted ? 'text-gray-500' : 'text-gray-300'}`}
      aria-hidden
    />
  )
}

function nameOf(entry: UserGamePlatformEntry) {
  const option = getLibraryPlatform(entry.platform)
  return option ? entryDisplayName(entry, option.label) : entry.platform
}

function hasHours(entry: UserGamePlatformEntry) {
  return Boolean(entry.hoursPlayed && entry.hoursPlayed > 0)
}

function hoursText(entry: UserGamePlatformEntry) {
  return hasHours(entry) ? formatHours(entry.hoursPlayed ?? 0) : 'sem horas'
}

const popoverClass =
  'z-[70] w-[min(18.5rem,calc(100vw-2rem))] rounded-xl border border-dark-border bg-dark-bg-light p-3 shadow-xl shadow-black/50'

function AccountsPopover({ entry }: { entry: UserGamePlatformEntry }) {
  const count = entry.accountHours.length
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={`${nameOf(entry)}: ${count} contas. Ver horas por conta`}
        className={`inline-flex items-center gap-1 rounded-full border border-dark-border px-2 py-px text-xs text-primary-link transition-colors hover:text-white data-[state=open]:border-primary-light/60 ${focusRing}`}
      >
        <span aria-hidden="true">{count}</span>
        <Users className="size-3" aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className={popoverClass}
        >
          <p className="mb-2 flex items-center gap-1.5 text-xs text-gray-400">
            <Icon entry={entry} />
            {nameOf(entry)}: horas por conta
          </p>
          <ul className="m-0 grid list-none gap-1.5 p-0">
            {entry.accountHours.map((account, index) => (
              <li
                key={`${account.accountName}-${index}`}
                className="flex items-baseline justify-between gap-4 text-[13px] text-gray-300"
              >
                <span className="break-all">{account.accountName}</span>
                <span className={`${valueClass} whitespace-nowrap text-white`}>
                  {formatHours(account.hoursPlayed)}
                </span>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function OverflowPopover({
  hidden,
  onSeeDetails,
}: {
  hidden: UserGamePlatformEntry[]
  onSeeDetails?: () => void
}) {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={`Mais ${hidden.length} plataformas. Ver horas`}
        className={`inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-primary-link transition-colors hover:text-white ${focusRing}`}
      >
        +{hidden.length} plataformas
        <ChevronRight className="size-3.5" aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className={popoverClass}
        >
          <ul className="m-0 grid list-none gap-1.5 p-0">
            {hidden.map(entry => (
              <li
                key={entryKey(entry)}
                className="flex items-center justify-between gap-4 text-[13px]"
              >
                <span className="inline-flex items-center gap-1.5 text-gray-200">
                  <Icon entry={entry} />
                  {nameOf(entry)}
                </span>
                <span
                  className={
                    entry.hoursPlayed && entry.hoursPlayed > 0
                      ? `${valueClass} whitespace-nowrap text-white`
                      : 'text-gray-500'
                  }
                >
                  {hoursText(entry)}
                </span>
              </li>
            ))}
          </ul>
          {onSeeDetails && (
            <button
              type="button"
              onClick={onSeeDetails}
              className={`mt-2.5 inline-flex min-h-8 items-center gap-0.5 rounded-sm text-[13px] font-medium text-primary-light hover:text-white ${focusRing}`}
            >
              Ver tudo na página do jogo
              <ChevronRight className="size-3.5" aria-hidden />
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

const rowGrid = 'col-span-3 grid grid-cols-subgrid items-center'

function PlatformRow({ entry }: { entry: UserGamePlatformEntry }) {
  const filled = hasHours(entry)
  return (
    <li className={rowGrid}>
      <span className="flex min-w-0 items-center gap-2">
        <Icon entry={entry} muted={!filled} />
        <span className={filled ? 'text-gray-200' : 'text-gray-500'}>
          {nameOf(entry)}
        </span>
      </span>
      <span
        className={`justify-self-end whitespace-nowrap ${
          filled ? `${valueClass} text-white` : 'text-gray-500'
        }`}
      >
        {hoursText(entry)}
      </span>
      <span className="justify-self-start">
        {hasAccountBreakdown(entry) && <AccountsPopover entry={entry} />}
      </span>
    </li>
  )
}

/**
 * Lista de plataformas do jogo: nome, tempo e selo de contas em colunas
 * alinhadas, uma linha por plataforma (uma plataforma é uma lista de uma).
 * Passando de MAX_LINES, o resto vira "+N plataformas" com popover.
 */
export function PlatformList({
  platforms,
  onSeeDetails,
}: {
  platforms: UserGamePlatformEntry[]
  onSeeDetails?: () => void
}) {
  if (platforms.length === 0) {
    return <span className="text-[13px] text-gray-500">Nenhuma registrada</span>
  }
  const sorted = [...platforms].sort(
    (a, b) => (b.hoursPlayed ?? 0) - (a.hoursPlayed ?? 0)
  )
  const shown =
    sorted.length > MAX_LINES ? sorted.slice(0, MAX_LINES - 1) : sorted
  const hidden = sorted.slice(shown.length)

  return (
    <ul
      aria-label="Horas por plataforma"
      className="m-0 grid w-fit max-w-full list-none grid-cols-[auto_auto_auto] gap-x-4 gap-y-1 p-0 text-[13px]"
    >
      {shown.map(entry => (
        <PlatformRow key={entryKey(entry)} entry={entry} />
      ))}
      {hidden.length > 0 && (
        <li className="col-span-3">
          <OverflowPopover hidden={hidden} onSeeDetails={onSeeDetails} />
        </li>
      )}
    </ul>
  )
}
