import type { ReactNode } from 'react'
import { SiPlaystation, SiSteam, SiXbox } from 'react-icons/si'
import { SteamLogo } from './steamLogo'

export type BrandStore = 'steam' | 'xbox' | 'playstation'

// Cores dos logos oficiais: o Xbox é verde e o PlayStation é azul; a Steam
// desenha o próprio disco com degradê (ver steamLogo.tsx).
const XBOX_GREEN = '#107c10'
const PLAYSTATION_BLUE = '#0070d1'

export function StoreBrandIcon({
  store,
  className = 'size-4',
}: {
  store: BrandStore
  className?: string
}) {
  if (store === 'steam') return <SteamLogo className={className} />
  if (store === 'xbox') {
    return (
      <SiXbox
        className={className}
        style={{ color: XBOX_GREEN }}
        aria-hidden="true"
      />
    )
  }
  return (
    <SiPlaystation
      className={className}
      style={{ color: PLAYSTATION_BLUE }}
      aria-hidden="true"
    />
  )
}

// Ladrilho sólido na cor da marca, com o logo em branco. Usado no perfil e na
// página de importação.
const TILE_BG: Record<BrandStore, string> = {
  steam: '#1b2838',
  xbox: '#107c10',
  playstation: '#0070d1',
}

const TILE_SIZE = {
  xs: { box: 'size-6 rounded-md', glyph: 'size-3.5' },
  sm: { box: 'size-7 rounded-md', glyph: 'size-4' },
  lg: { box: 'size-10 rounded-lg', glyph: 'size-6' },
} as const

export function StoreTile({
  store,
  size = 'sm',
  className = '',
  children,
}: {
  store: BrandStore
  size?: keyof typeof TILE_SIZE
  className?: string
  children?: ReactNode
}) {
  const { box, glyph } = TILE_SIZE[size]
  const Glyph =
    store === 'steam' ? SiSteam : store === 'xbox' ? SiXbox : SiPlaystation
  return (
    <span
      style={{ backgroundColor: TILE_BG[store] }}
      className={`relative inline-grid shrink-0 place-items-center ring-1 ring-white/10 ${box} ${className}`}
    >
      <Glyph className={`${glyph} text-white`} aria-hidden="true" />
      {children}
    </span>
  )
}
