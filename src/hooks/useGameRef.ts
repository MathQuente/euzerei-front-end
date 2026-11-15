import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import type { GameResponse } from '../types/games'
import { parseGameRef } from '../utils/gamePath'
import { api } from './useApi'
import { canonicalGameId } from './useCanonicalGameUrl'

export const useGameRef = (param: string | undefined) => {
  const queryClient = useQueryClient()
  const { state } = useLocation()
  const ref = useMemo(() => parseGameRef(param), [param])
  const slug = ref.kind === 'slug' ? ref.slug : undefined
  const knownId = slug === undefined ? undefined : canonicalGameId(state)

  const {
    data,
    error,
    refetch: refetchSlug,
  } = useQuery<GameResponse>({
    queryKey: ['gameBySlug', slug],
    queryFn: async () => {
      const response: GameResponse = await api.getGameBySlug(slug as string)
      queryClient.setQueryData(['game', String(response.game.igdbId)], response)
      return response
    },
    enabled: slug !== undefined && knownId === undefined,
  })

  const slugNotFound = isAxiosError(error) && error.response?.status === 404

  let igdbId: string | undefined
  if (ref.kind === 'id') igdbId = ref.id
  else if (knownId !== undefined) igdbId = knownId
  else if (data) igdbId = String(data.game.igdbId)

  return {
    igdbId,
    isNotFound: ref.kind === 'invalid' || slugNotFound,
    isFailed: slug !== undefined && Boolean(error) && !slugNotFound && !data,
    refetch: refetchSlug,
  }
}
