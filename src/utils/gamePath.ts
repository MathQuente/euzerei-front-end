import { isValidIgdbId } from './isValidIgdbId'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/i
const MAX_SLUG_LENGTH = 100

function isSlugText(text: string): boolean {
  return (
    text.length <= MAX_SLUG_LENGTH &&
    SLUG_PATTERN.test(text) &&
    !/^\d+$/.test(text)
  )
}

export type GameRef =
  | { kind: 'id'; id: string }
  | { kind: 'slug'; slug: string }
  | { kind: 'invalid' }

export function parseGameRef(param: string | undefined): GameRef {
  if (param === undefined || param === '') return { kind: 'invalid' }
  const isSlug = isSlugText(param)
  const slug = param.toLowerCase()
  if (isValidIgdbId(param)) return { kind: 'id', id: param }
  return isSlug ? { kind: 'slug', slug } : { kind: 'invalid' }
}

interface GamePathTarget {
  igdbId: number | string
  slug?: string | null
}

interface GamePathOptions {
  reviews?: boolean
  search?: string
  hash?: string
}

export function gamePath(
  game: GamePathTarget,
  { reviews = false, search = '', hash = '' }: GamePathOptions = {}
): string {
  const ref =
    game.slug && isSlugText(game.slug) ? game.slug : String(game.igdbId)
  return `/games/${encodeURIComponent(ref)}${reviews ? '/reviews' : ''}${search}${hash}`
}
