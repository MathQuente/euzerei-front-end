import { Monitor, Smartphone } from 'lucide-react'
import { SiNintendoswitch, SiPlaystation, SiXbox } from 'react-icons/si'
import type { PlatformOption } from '../interfaces/games'

/** Famílias de plataforma do filtro de `/games`; o backend as traduz em nomes do IGDB. */
export type CatalogPlatform =
  | 'pc'
  | 'playstation'
  | 'xbox'
  | 'nintendo'
  | 'mobile'

export const CATALOG_PLATFORMS: PlatformOption[] = [
  { value: 'pc', label: 'PC', icon: Monitor },
  { value: 'playstation', label: 'PlayStation', icon: SiPlaystation },
  { value: 'xbox', label: 'Xbox', icon: SiXbox },
  { value: 'nintendo', label: 'Nintendo', icon: SiNintendoswitch },
  { value: 'mobile', label: 'Celular', icon: Smartphone },
]

const KNOWN = new Set<string>(CATALOG_PLATFORMS.map(option => option.value))

/** Lê `?platforms=pc,xbox`: só famílias conhecidas, sem repetir. */
export function parseCatalogPlatforms(param: string | null | undefined) {
  if (!param) return []
  const values = param
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(value => KNOWN.has(value))
  return [...new Set(values)]
}
