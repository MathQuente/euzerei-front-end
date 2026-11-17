import { Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { focusRing } from '../../styles/focus'
import type { AchievementStats } from '../../types/user'
import type { StoreAccounts } from './storeChips'

type StoreKey = keyof AchievementStats

interface StoreCell {
  key: StoreKey
  name: string
  value: string
  unit: string
  note?: string
  spoken: string
}

const n = (value: number) => value.toLocaleString('pt-BR')

function cellFor(key: StoreKey, stats: AchievementStats): StoreCell | null {
  if (key === 'steam' && stats.steam) {
    const { achievements } = stats.steam
    return {
      key,
      name: 'Steam',
      value: n(achievements),
      unit: achievements === 1 ? 'conquista' : 'conquistas',
      note: 'em jogos verificados',
      spoken: `Steam: ${n(achievements)} ${achievements === 1 ? 'conquista' : 'conquistas'} em jogos verificados na importação`,
    }
  }
  if (key === 'xbox' && stats.xbox) {
    const { gamerscore } = stats.xbox
    return {
      key,
      name: 'Xbox',
      value: n(gamerscore),
      unit: 'G de gamerscore',
      spoken: `Xbox: ${n(gamerscore)} de gamerscore`,
    }
  }
  if (key === 'psn' && stats.psn) {
    const { trophies, platinum } = stats.psn
    const trophyWord = trophies === 1 ? 'troféu' : 'troféus'
    const platinumText = `${n(platinum)} ${platinum === 1 ? 'platina' : 'platinas'}`
    return {
      key,
      name: 'PlayStation',
      value: n(trophies),
      unit: `${trophyWord} · ${platinumText}`,
      spoken: `PlayStation: ${n(trophies)} ${trophyWord}, ${platinumText}`,
    }
  }
  return null
}

const STORES: { key: StoreKey; label: string }[] = [
  { key: 'steam', label: 'Steam' },
  { key: 'xbox', label: 'Xbox' },
  { key: 'psn', label: 'PlayStation' },
]

const STORE_ACCOUNT_KEY = {
  steam: 'steam',
  xbox: 'xbox',
  psn: 'playstation',
} as const satisfies Record<StoreKey, keyof StoreAccounts>

const COLUMNS = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
} as const

const cellClass =
  'flex items-center gap-2.5 bg-dark-bg px-4 py-3 text-sm text-gray-400 sm:px-6'

export function StoreStats({
  stats,
  stores,
  isOwn,
}: {
  stats?: AchievementStats
  stores?: StoreAccounts
  isOwn: boolean
}) {
  const linkedStores = STORES.filter(
    ({ key }) => (stores?.[STORE_ACCOUNT_KEY[key]]?.length ?? 0) > 0
  )
  const cells = linkedStores.flatMap(({ key }) => {
    const cell = stats ? cellFor(key, stats) : null
    return cell ? [cell] : []
  })
  // Só o dono precisa saber que falta importar; visitantes não veem aviso.
  const missing = isOwn
    ? linkedStores.filter(({ key }) => !cells.some(c => c.key === key))
    : []

  if (cells.length === 0 && missing.length === 0) return null

  return (
    <>
      {cells.length > 0 && (
        <ul
          aria-label="Conquistas por loja"
          className={`m-0 grid list-none grid-cols-1 gap-px border-t border-dark-border bg-dark-border p-0 ${COLUMNS[cells.length as 1 | 2 | 3]}`}
        >
          {cells.map(cell => (
            <li key={cell.key} className={cellClass}>
              <Trophy
                className="size-[18px] flex-none text-gray-400"
                aria-hidden="true"
              />
              <span
                className="flex min-w-0 flex-wrap items-baseline gap-x-1.5"
                aria-hidden="true"
              >
                <span className="text-gray-300">{cell.name}</span>
                <b className="font-display text-base font-bold tabular-nums text-white">
                  {cell.value}
                </b>
                <span>{cell.unit}</span>
                {cell.note && <span className="text-xs">{cell.note}</span>}
              </span>
              <span className="sr-only">{cell.spoken}</span>
            </li>
          ))}
        </ul>
      )}
      {missing.length > 0 && (
        <p className="m-0 flex flex-wrap items-center gap-x-2 border-t border-dark-border bg-dark-bg px-4 py-1 text-sm text-gray-400 sm:px-6">
          <span>
            Conquistas de {joinNames(missing.map(m => m.label))} aparecem depois
            de importar de novo.
          </span>
          <Link
            to="/configuracoes/importar"
            className={`inline-flex min-h-11 items-center rounded-sm text-primary-link underline underline-offset-4 transition-colors hover:text-white ${focusRing}`}
          >
            Importar
          </Link>
        </p>
      )}
    </>
  )
}

function joinNames(names: string[]) {
  if (names.length < 2) return names.join('')
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}
