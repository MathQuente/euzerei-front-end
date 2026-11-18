import { Link } from 'react-router-dom'
import { focusRing } from '../../styles/focus'
import type { AchievementStats } from '../../types/user'
import {
  type StoreAchievement,
  storeAchievement,
} from '../../utils/achievementStats'
import { StoreTile } from '../storeBrand'

export interface StoreAccounts {
  steam?: string[]
  playstation?: string[]
  xbox?: string[]
}

const STORES: { key: keyof StoreAccounts; label: string }[] = [
  { key: 'steam', label: 'Steam' },
  { key: 'xbox', label: 'Xbox' },
  { key: 'playstation', label: 'PlayStation' },
]

export function hasStoreAccounts(stores?: StoreAccounts) {
  return STORES.some(s => (stores?.[s.key]?.length ?? 0) > 0)
}

function Achievement({
  achievement,
  isOwn,
}: {
  achievement: StoreAchievement | null
  isOwn: boolean
}) {
  if (achievement) {
    return (
      <span className="flex flex-col leading-none" aria-hidden="true">
        <b className="font-display text-[15px] font-bold tabular-nums text-white">
          {achievement.countText}
        </b>
        <span className="mt-[3px] whitespace-nowrap text-[11px] text-gray-400">
          {achievement.caption}
        </span>
      </span>
    )
  }

  // Só o dono precisa saber que falta importar; o visitante vê só o ladrilho.
  if (!isOwn) return null
  return (
    <span className="flex flex-col leading-none">
      <span
        className="font-display text-[15px] font-bold text-gray-400"
        aria-hidden="true"
      >
        —
      </span>
      <Link
        to="/configuracoes/importar"
        className={`relative mt-[3px] whitespace-nowrap rounded-sm text-[11px] text-primary-link transition-colors before:absolute before:-inset-x-1 before:-inset-y-3 before:content-[''] hover:text-white ${focusRing}`}
      >
        importe de novo
      </Link>
    </span>
  )
}

export function StoreChips({
  stores,
  achievementStats,
  isOwn = false,
}: {
  stores?: StoreAccounts
  achievementStats?: AchievementStats
  isOwn?: boolean
}) {
  const linked = STORES.flatMap(s => {
    const handles = stores?.[s.key] ?? []
    return handles.length > 0 ? [{ ...s, handles }] : []
  })

  if (linked.length === 0) return null

  return (
    <ul
      aria-label="Lojas conectadas"
      className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0"
    >
      {linked.map(({ key, label, handles }) => {
        const achievement = storeAchievement(key, achievementStats)
        return (
          <li
            key={key}
            className={`flex items-center ${handles.length > 1 ? 'gap-3.5' : 'gap-2'}`}
            title={[
              handles.join(', '),
              achievement?.note ? `Conquistas: ${achievement.note}` : null,
            ]
              .filter(Boolean)
              .join('\n')}
          >
            <StoreTile store={key}>
              {handles.length > 1 && (
                <span
                  className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 font-display text-[10px] font-bold leading-none text-black"
                  aria-hidden="true"
                >
                  {handles.length}
                </span>
              )}
            </StoreTile>
            <Achievement achievement={achievement} isOwn={isOwn} />
            <span className="sr-only">
              {label},{' '}
              {handles.length === 1 ? '1 conta' : `${handles.length} contas`}
              {achievement ? `, ${achievement.spoken}` : ''}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
