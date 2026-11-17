import { Link } from 'react-router-dom'
import { focusRing } from '../../styles/focus'
import type { AchievementStats } from '../../types/user'
import { StoreBrandIcon } from '../storeBrand'
import type { StoreAccounts } from './storeChips'

type StoreKey = keyof AchievementStats

const BRAND = { steam: 'steam', xbox: 'xbox', psn: 'playstation' } as const

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
          className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-2 border-t border-dark-border px-4 py-3 text-sm text-gray-400 sm:px-6"
        >
          {cells.map(cell => (
            <li key={cell.key} className="flex items-center gap-1.5">
              <StoreBrandIcon store={BRAND[cell.key]} className="size-4" />
              <span
                className="flex flex-wrap items-baseline gap-x-1"
                aria-hidden="true"
              >
                <b className="font-display font-bold tabular-nums text-white">
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
        <p className="m-0 flex flex-wrap items-center gap-x-2 border-t border-dark-border px-4 py-1 text-sm text-gray-400 sm:px-6">
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
