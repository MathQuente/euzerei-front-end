import { SiPlaystation, SiXbox } from 'react-icons/si'
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
