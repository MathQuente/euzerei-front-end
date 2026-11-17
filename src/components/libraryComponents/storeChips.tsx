import type { IconType } from 'react-icons'
import { SiPlaystation, SiSteam, SiXbox } from 'react-icons/si'

export interface StoreAccounts {
  steam?: string[]
  playstation?: string[]
  xbox?: string[]
}

const STORES: { key: keyof StoreAccounts; label: string; icon: IconType }[] = [
  { key: 'steam', label: 'Steam', icon: SiSteam },
  { key: 'xbox', label: 'Xbox', icon: SiXbox },
  { key: 'playstation', label: 'PlayStation', icon: SiPlaystation },
]

export function hasStoreAccounts(stores?: StoreAccounts) {
  return STORES.some(s => (stores?.[s.key]?.length ?? 0) > 0)
}

export function StoreChips({ stores }: { stores?: StoreAccounts }) {
  const linked = STORES.flatMap(s => {
    const handles = stores?.[s.key] ?? []
    return handles.length > 0 ? [{ ...s, handles }] : []
  })

  if (linked.length === 0) return null

  return (
    <ul
      aria-label="Lojas conectadas"
      className="m-0 flex list-none flex-wrap gap-1.5 p-0"
    >
      {linked.map(({ key, label, icon: Icon, handles }) => (
        <li
          key={key}
          title={handles.join(', ')}
          className="inline-flex min-h-7 items-center gap-1.5 rounded-md border border-dark-border bg-dark-bg-darker/85 px-2 text-sm text-gray-300"
        >
          <Icon className="size-4" aria-hidden="true" />
          {handles.length > 1 && (
            <span
              className="font-display text-xs font-semibold text-gray-400"
              aria-hidden="true"
            >
              ×{handles.length}
            </span>
          )}
          <span className="sr-only">
            {label},{' '}
            {handles.length === 1 ? '1 conta' : `${handles.length} contas`}
          </span>
        </li>
      ))}
    </ul>
  )
}
