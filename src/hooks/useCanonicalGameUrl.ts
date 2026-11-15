import { useEffect } from 'react'
import { type NavigationType, useLocation, useNavigate } from 'react-router-dom'
import { gamePath } from '../utils/gamePath'
import { isValidIgdbId } from '../utils/isValidIgdbId'

interface CanonicalState {
  canonical: true
  igdbId: string
}

function readCanonicalState(state: unknown): CanonicalState | null {
  if (typeof state !== 'object' || state === null) return null
  const { canonical, igdbId } = state as Partial<CanonicalState>
  return canonical === true &&
    typeof igdbId === 'string' &&
    isValidIgdbId(igdbId)
    ? { canonical, igdbId }
    : null
}

export function canonicalGameId(state: unknown): string | undefined {
  return readCanonicalState(state)?.igdbId
}

export function isCanonicalReplace(
  navigationType: NavigationType,
  state: unknown
) {
  return navigationType === 'REPLACE' && readCanonicalState(state) !== null
}

export const useCanonicalGameUrl = (
  game: { igdbId: number; slug?: string | null } | undefined,
  { reviews = false }: { reviews?: boolean } = {}
) => {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()

  const slug = game?.slug
  const igdbId = game?.igdbId

  useEffect(() => {
    if (igdbId === undefined || !slug) return
    const target = gamePath({ igdbId, slug }, { reviews })
    if (target === pathname) return
    if (target === gamePath({ igdbId }, { reviews })) return
    const state: CanonicalState = { canonical: true, igdbId: String(igdbId) }
    navigate({ pathname: target, search, hash }, { replace: true, state })
  }, [igdbId, slug, reviews, pathname, search, hash, navigate])
}
