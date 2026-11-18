import type { InvalidateOptions, QueryClient } from '@tanstack/react-query'

const GAME_LIST_QUERY_KEYS = [
  'games',
  'gameSearch',
  'comingSoon',
  'gamesFeatured',
  'similarGames',
] as const

const invalidateKeys = (
  queryClient: QueryClient,
  keys: readonly string[],
  options?: InvalidateOptions
) => {
  for (const key of keys) {
    queryClient.invalidateQueries({ queryKey: [key] }, options)
  }
}

export const invalidateGameLists = (queryClient: QueryClient) =>
  invalidateKeys(queryClient, GAME_LIST_QUERY_KEYS)

// O relógio do aparelho pode estar adiantado: a primeira busca, feita no zero
// dele, cai antes de o servidor virar o dia e devolve a lista de ontem. A
// segunda, alguns segundos depois, pega a lista já virada.
export const RELEASE_REFRESH_DELAY_MS = 8000

const RELEASE_LIST_QUERY_KEYS = ['comingSoon', 'gamesFeatured'] as const

const retryScheduled = new WeakSet<QueryClient>()

/**
 * Um lançamento chegou a zero com a página aberta: refaz "Em breve" na página
 * própria e na home (`gamesFeatured`), e de novo depois de um instante. A
 * primeira busca aproveita uma que já esteja em andamento (várias linhas
 * zeram juntas); a segunda sempre refaz, para não devolver a resposta velha
 * de uma busca que começou antes da virada do servidor. Só um retorno fica
 * agendado por vez; o timer fica solto de propósito, pois invalidar uma
 * consulta sem uso só a marca como velha.
 */
export const refreshAfterRelease = (queryClient: QueryClient) => {
  invalidateKeys(queryClient, RELEASE_LIST_QUERY_KEYS, {
    cancelRefetch: false,
  })
  if (retryScheduled.has(queryClient)) return
  retryScheduled.add(queryClient)
  setTimeout(() => {
    retryScheduled.delete(queryClient)
    invalidateKeys(queryClient, RELEASE_LIST_QUERY_KEYS, {
      cancelRefetch: true,
    })
  }, RELEASE_REFRESH_DELAY_MS)
}
