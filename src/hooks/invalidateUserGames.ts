import type { QueryClient } from '@tanstack/react-query'
import { PUBLIC_USER_PROFILE_KEY } from './useCanonicalUserUrl'

export const invalidateUserGames = (
  queryClient: QueryClient,
  userId: string | undefined
) => {
  queryClient.invalidateQueries({ queryKey: ['userGames', userId] })
  queryClient.invalidateQueries({ queryKey: ['publicUserGames', userId] })
  queryClient.invalidateQueries({ queryKey: [PUBLIC_USER_PROFILE_KEY, userId] })
  // A página do perfil guarda pelo que está na URL (id ou handle): acha o
  // perfil deste usuário pelo conteúdo, qualquer que seja a chave.
  queryClient.invalidateQueries({
    predicate: query =>
      query.queryKey[0] === PUBLIC_USER_PROFILE_KEY &&
      (query.state.data as { user?: { id?: string } } | undefined)?.user?.id ===
        userId,
  })
  queryClient.invalidateQueries({ queryKey: ['favoriteGames', userId] })
}
