import { SiPlaystation, SiSteam, SiXbox } from 'react-icons/si'

// Ladrilhos sólidos na cor da marca, com o logo em branco.
const TILE_BG: Record<keyof StoreAccounts, string> = {
  steam: '#1b2838',
  xbox: '#107c10',
  playstation: '#0070d1',
}

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
        <li
          key={key}
          title={handles.join(', ')}
          style={{ backgroundColor: TILE_BG[key] }}
          className="relative inline-flex size-7 items-center justify-center rounded-md ring-1 ring-white/10"
        >
          {key === 'steam' ? (
            <SiSteam className="size-4 text-white" aria-hidden="true" />
          ) : key === 'xbox' ? (
            <SiXbox className="size-4 text-white" aria-hidden="true" />
          ) : (
            <SiPlaystation className="size-4 text-white" aria-hidden="true" />
          )}
          {handles.length > 1 && (
            <span
              className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 font-display text-[10px] font-bold leading-none text-black"
              aria-hidden="true"
            >
              {handles.length}
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
