import { useEffect, useMemo } from 'react'

import { GameListSection } from '../components/gameListSection'
import { CoverRow } from '../components/homeComponents/coverRow'
import { Greeting } from '../components/homeComponents/greeting'
import { LibrarySummary } from '../components/homeComponents/librarySummary'
import { LoggedOutHero } from '../components/homeComponents/loggedOutHero'
import { NextUp } from '../components/homeComponents/nextUp'
import { PlayingNow } from '../components/homeComponents/playingNow'
import { sectionTitle } from '../components/homeComponents/styles'
import { Welcome } from '../components/homeComponents/welcome'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useGames } from '../hooks/useGames'
import { useStartCelebration } from '../hooks/useStartCelebration'
import { useUserGames } from '../hooks/useUserGames'
import type { GamesFromHomePageResponse } from '../types/games'

const WALL_LIMIT = 60

const SKELETON_COVERS = ['a', 'b', 'c', 'd', 'e', 'f']

const MANY_PLAYING_KEY = 'home:many-playing'

function readManyPlaying() {
  try {
    return localStorage.getItem(MANY_PLAYING_KEY) !== '0'
  } catch {
    return true
  }
}

function saveManyPlaying(many: boolean) {
  try {
    localStorage.setItem(MANY_PLAYING_KEY, many ? '1' : '0')
  } catch {}
}

function LoggedInTop() {
  const { user } = useAuth()
  const {
    UserGamesResponse,
    isLoadingUserGames,
    isErrorUserGames,
    GamesToDisplay,
    isLoadingRecommendation,
    gamesByStatus,
    totalPerStatus,
  } = useUserGames()

  const libraryIds = useMemo(
    () => new Set(UserGamesResponse?.libraryIgdbIds ?? []),
    [UserGamesResponse]
  )

  const celebration = useStartCelebration()
  const playingCount = gamesByStatus.PLAYING.length
  const hasResponse = Boolean(UserGamesResponse)
  useEffect(() => {
    if (hasResponse) saveManyPlaying(playingCount > 1)
  }, [hasResponse, playingCount])

  if (!UserGamesResponse) {
    if (isErrorUserGames) {
      return (
        <>
          <h1 className="sr-only">Início</h1>
          <p className="mt-4 text-gray-400">
            Não foi possível carregar sua biblioteca agora.
          </p>
        </>
      )
    }

    const manyPlaying = readManyPlaying()

    return (
      <>
        <h1 className="sr-only">Início</h1>
        <div
          className={`mt-2 grid grid-cols-1 gap-10 lg:gap-14 ${
            manyPlaying
              ? 'lg:grid-cols-[auto_minmax(0,880px)] lg:justify-start'
              : 'lg:grid-cols-[7fr_5fr]'
          }`}
          aria-busy={isLoadingUserGames}
        >
          <div
            className={`h-56 rounded-lg bg-dark-bg-light lg:h-80 ${
              manyPlaying ? 'lg:w-[528px] xl:w-[576px]' : ''
            }`}
          />
          <div className="h-56 rounded-lg bg-dark-bg-light lg:h-80" />
        </div>
      </>
    )
  }

  const playing = [...gamesByStatus.PLAYING].sort(
    (a, b) => Number(a.endless) - Number(b.endless)
  )
  const backlog = gamesByStatus.BACKLOG
  const nextUpQueue = [...gamesByStatus.PAUSED, ...backlog]
  const backlogTotal =
    totalPerStatus.find(t => t.status === 'BACKLOG')?.totalGames ?? 0
  const playingTotal =
    totalPerStatus.find(t => t.status === 'PLAYING')?.totalGames ??
    playing.length

  if (UserGamesResponse.total === 0) {
    const hasSuggestion =
      !!GamesToDisplay?.game && !libraryIds.has(GamesToDisplay.game.igdbId)

    return (
      <div className="mt-2 grid grid-cols-1 gap-10 lg:grid-cols-[7fr_5fr] lg:gap-14">
        <Welcome name={user?.userName} />
        {(hasSuggestion || celebration.celebrate) && (
          <NextUp
            backlog={backlog}
            libraryIds={libraryIds}
            suggestion={GamesToDisplay}
            title="Uma sugestão para começar"
            showEmptyNote={false}
            wide={false}
            celebrate={celebration.celebrate}
            celebrationFinished={celebration.finished}
            onStarted={celebration.start}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <Greeting
        name={user?.userName}
        playing={playingTotal}
        backlog={backlogTotal}
      />
      <div
        className={`mt-6 grid grid-cols-1 gap-10 lg:gap-14 ${
          playing.length > 1
            ? 'lg:grid-cols-[auto_minmax(0,880px)] lg:justify-start'
            : 'lg:grid-cols-[7fr_5fr]'
        }`}
      >
        <PlayingNow games={playing} total={playingTotal} />
        <NextUp
          backlog={nextUpQueue}
          libraryIds={libraryIds}
          suggestion={GamesToDisplay}
          loadingSuggestion={isLoadingRecommendation}
          showRoulette={backlogTotal >= 2}
          celebrate={celebration.celebrate}
          celebrationFinished={celebration.finished}
          onStarted={celebration.start}
        />
      </div>
      <LibrarySummary totalPerStatus={totalPerStatus} />
    </>
  )
}

function Discovery({
  featured,
  isLoading,
}: {
  featured: GamesFromHomePageResponse | undefined
  isLoading: boolean
}) {
  if (!featured) {
    if (!isLoading) {
      return (
        <p className="mt-12 text-gray-400">
          Não foi possível carregar os jogos agora. Recarregue a página para
          tentar de novo.
        </p>
      )
    }

    return (
      <div className="mt-12" aria-busy="true">
        <h2 className={sectionTitle}>Lançamentos recentes</h2>
        <div className="mt-4 flex gap-3 overflow-hidden lg:gap-4">
          {SKELETON_COVERS.map(key => (
            <div
              key={key}
              className="aspect-[7/10] w-28 flex-none rounded-lg bg-dark-bg-light sm:w-36 lg:w-40"
            />
          ))}
        </div>
      </div>
    )
  }

  const recentGames = featured.recentGames

  return (
    <>
      <section className="mt-12 min-w-0">
        <h2 className={sectionTitle}>Lançamentos recentes</h2>
        {recentGames.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">
            Nenhum jogo disponível no momento.
          </p>
        ) : (
          <CoverRow
            games={recentGames}
            className="mt-4"
            itemClassName="xl:w-44"
          />
        )}
      </section>

      <div className="mt-12 grid w-full grid-cols-1 gap-10 border-t border-dark-border pt-8 lg:grid-cols-3 lg:gap-12">
        <GameListSection
          type="coming"
          games={featured.futureGames}
          title="Em breve"
        />
        <GameListSection
          type="trending"
          games={featured.trendingGames}
          title="Em alta"
        />
        <GameListSection
          type="rateds"
          games={featured.mostRatedGames}
          title="Mais avaliados"
        />
      </div>
    </>
  )
}

export function Home() {
  useDocumentTitle('')
  const { user } = useAuth()
  const isLogged = !!user?.id

  const { GamesResponse, gamesFeatured, isLoadingFeatured } = useGames(
    1,
    '',
    'rating',
    'desc',
    isLogged ? undefined : WALL_LIMIT
  )

  const wallCovers = useMemo(() => {
    const games = [
      ...(GamesResponse?.games ?? []),
      ...(gamesFeatured?.mostRatedGames ?? []),
      ...(gamesFeatured?.trendingGames ?? []),
      ...(gamesFeatured?.recentGames ?? []),
      ...(gamesFeatured?.futureGames ?? []),
    ]
    const byId = new Map<number, string>()
    for (const game of games) {
      if (game.coverUrl && !byId.has(game.igdbId)) {
        byId.set(game.igdbId, game.coverUrl)
      }
    }
    return [...byId.values()]
  }, [GamesResponse, gamesFeatured])

  return (
    <>
      {isLogged ? <LoggedInTop /> : <LoggedOutHero covers={wallCovers} />}

      <Discovery featured={gamesFeatured} isLoading={isLoadingFeatured} />
    </>
  )
}
