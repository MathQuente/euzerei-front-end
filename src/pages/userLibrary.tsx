import { useQueryClient } from '@tanstack/react-query'
import { CircleAlert } from 'lucide-react'
import { inlineAction, sectionTitle } from '../components/homeComponents/styles'
import { EmptyLibrary } from '../components/libraryComponents/emptyLibrary'
import { FavoriteGamesSection } from '../components/libraryComponents/favoriteGamesSection'
import { LibraryShelves } from '../components/libraryComponents/libraryShelves'
import { UserProfileDisplay } from '../components/userGamesComponents/userProfileDisplay'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePlatformLinkResult } from '../hooks/usePlatformLinkResult'
import { useUserGames } from '../hooks/useUserGames'

const SKELETON_SHELVES = ['a', 'b', 'c']

export function UserLibrary() {
  useDocumentTitle('Minha biblioteca')
  usePlatformLinkResult()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const {
    UserGamesResponse,
    isErrorUserGames,
    refetchUserGames,
    gamesByStatus,
    totalPerStatus,
  } = useUserGames(undefined, undefined, undefined, 'desc', 'completedAt')

  const isEmpty = UserGamesResponse?.total === 0
  const libraryFailed = !UserGamesResponse && isErrorUserGames

  // Um aviso só para tudo: refaz a biblioteca e os favoritos juntos.
  const retryAll = () => {
    refetchUserGames()
    queryClient.invalidateQueries({ queryKey: ['favoriteGames'] })
  }

  return (
    <>
      <UserProfileDisplay
        totalPerStatus={UserGamesResponse ? totalPerStatus : undefined}
      />

      {user?.id && (
        <FavoriteGamesSection
          userId={user.id}
          editable
          hideError={libraryFailed}
        />
      )}

      {!UserGamesResponse &&
        (isErrorUserGames ? (
          <section className="mt-8 border-t border-dark-border pt-6">
            <h2 className={`flex items-center gap-2 ${sectionTitle}`}>
              <CircleAlert
                className="size-5 shrink-0 text-gray-400 opacity-60"
                aria-hidden="true"
              />
              Não foi possível carregar sua biblioteca
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              As estatísticas, os favoritos e as prateleiras dependem da mesma
              conexão.{' '}
              <button type="button" onClick={retryAll} className={inlineAction}>
                Tentar de novo
              </button>
            </p>
          </section>
        ) : (
          <div className="mt-8 flex flex-col gap-8" aria-busy="true">
            {SKELETON_SHELVES.map(key => (
              <div key={key} className="h-56 rounded-lg bg-dark-bg-light" />
            ))}
          </div>
        ))}

      {UserGamesResponse &&
        (isEmpty ? (
          <EmptyLibrary />
        ) : (
          <LibraryShelves
            games={gamesByStatus}
            totalPerStatus={totalPerStatus}
          />
        ))}
    </>
  )
}
