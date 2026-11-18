import type { LibraryPlatform } from '../types/platform'
import { getLibraryPlatform } from './libraryPlatforms'

/** Lê `?platforms=STEAM,XBOX`: só plataformas conhecidas, sem repetir. */
export function parsePlatforms(param: string | null | undefined) {
  if (!param) return []
  const values = param
    .split(',')
    .map(value => value.trim())
    .filter(value => getLibraryPlatform(value) !== undefined)
  return [...new Set(values)] as LibraryPlatform[]
}

/** O valor de `?platforms=`; `undefined` quando não há filtro. */
export function platformsParam(platforms: LibraryPlatform[]) {
  return platforms.length > 0 ? platforms.join(',') : undefined
}
