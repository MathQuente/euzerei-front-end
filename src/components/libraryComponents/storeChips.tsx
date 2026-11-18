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

export function StoreChips({ stores }: { stores?: StoreAccounts }) {
  const linked = STORES.flatMap(s => {
    const handles = stores?.[s.key] ?? []
    return handles.length > 0 ? [{ ...s, handles }] : []
  })

  if (linked.length === 0) return null

  return (
    <ul
      aria-label="Lojas conectadas"
      className="m-0 flex list-none flex-wrap gap-2 p-0"
    >
      {linked.map(({ key, label, handles }) => (
        <li key={key} title={handles.join(', ')}>
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
          <span className="sr-only">
            {label},{' '}
            {handles.length === 1 ? '1 conta' : `${handles.length} contas`}
          </span>
        </li>
      ))}
    </ul>
  )
}
