import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useCallback, useEffect, useRef } from 'react'
import {
  Link,
  useNavigationType,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { BackButton } from '../components/backButton'
import { Button } from '../components/button'
import { CommunityReviewCard } from '../components/communityReviewCard'
import { OwnReviewCard } from '../components/ownReviewCard'
import { Pagination } from '../components/pagination'
import { ReviewSummary } from '../components/reviewSummary'
import { StatusLink, StatusMessage } from '../components/statusMessage'
import { api } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { useCanonicalGameUrl } from '../hooks/useCanonicalGameUrl'
import { useCommunityReviews } from '../hooks/useCommunityReviews'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { DETAIL_STALE_MS } from '../hooks/useGame'
import { useGameRef } from '../hooks/useGameRef'
import { useReview } from '../hooks/useReview'
import { focusRing } from '../styles/focus'
import type { GameResponse } from '../types/games'
import { gamePath } from '../utils/gamePath'
import { hiResCover } from '../utils/hiResCover'
import { parsePage } from '../utils/parsePage'

const PAGE_SIZE = 10

export function GameReviewsPage() {
  const { gameRef } = useParams<{ gameRef: string }>()
  const { user } = useAuth()
  const ref = useGameRef(gameRef)
  const igdbId = ref.igdbId
  const isValidId = igdbId !== undefined
  const listRef = useRef<HTMLDivElement>(null)
  const navigationType = useNavigationType()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))

  const setPage = useCallback(
    (next: number) => {
      setSearchParams(
        prev => {
          const params = new URLSearchParams(prev)
          if (next <= 1) params.delete('page')
          else params.set('page', String(next))
          return params
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const { data: gameData, error: gameError } = useQuery<GameResponse>({
    queryKey: ['game', igdbId],
    queryFn: () => api.getGame(igdbId),
    staleTime: DETAIL_STALE_MS,
    enabled: isValidId,
  })
  const game = gameData?.game
  useCanonicalGameUrl(game, { reviews: true })

  const { review: ownReview } = useReview(isValidId ? igdbId : undefined)

  const { reviews, total, isLoading, isError, refetch } = useCommunityReviews(
    isValidId ? igdbId : undefined,
    page - 1,
    PAGE_SIZE
  )
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  // biome-ignore lint/correctness/useExhaustiveDependencies: só a troca de jogo (igdbId) rola ao topo; navigationType é lido na hora e não pode disparar o efeito
  useEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0)
  }, [igdbId])

  useEffect(() => {
    if (total > 0 && page > totalPages) setPage(totalPages)
  }, [total, page, totalPages, setPage])

  function handlePageChange(next: number) {
    setPage(next)
    listRef.current?.scrollIntoView({ block: 'start' })
  }

  const isGameNotFound =
    isAxiosError(gameError) && gameError.response?.status === 404

  useDocumentTitle(
    ref.isNotFound || isGameNotFound
      ? undefined
      : game
        ? `Resenhas de ${game.name}`
        : 'Resenhas da comunidade'
  )

  if (ref.isNotFound || isGameNotFound) {
    return (
      <>
        <BackButton className="mt-4" />
        <StatusMessage
          variant="not-found"
          title="Jogo não encontrado"
          description="Não há resenhas porque esse jogo não existe no catálogo."
          primaryAction={<StatusLink to="/games">Ver catálogo</StatusLink>}
        />
      </>
    )
  }

  if (ref.isFailed) {
    return (
      <>
        <BackButton className="mt-4" />
        <StatusMessage
          variant="error"
          icon="offline"
          title="Não foi possível carregar o jogo"
          description="A conexão falhou ou o servidor não respondeu. Tente de novo em instantes."
          primaryAction={
            <Button variant="secondary" size="md" onClick={() => ref.refetch()}>
              Tentar novamente
            </Button>
          }
        />
      </>
    )
  }

  if (igdbId === undefined) {
    return (
      <div className="w-full max-w-[960px] mx-auto flex flex-col gap-5">
        <BackButton className="mt-4" />
        <div className="h-40 rounded-lg border border-dark-border bg-dark-bg-light animate-pulse" />
      </div>
    )
  }

  const hasOwn = Boolean(ownReview)
  const others = reviews.filter(review => review.userId !== user?.id)
  const othersTotal = Math.max(total - (hasOwn ? 1 : 0), 0)

  return (
    <div className="w-full max-w-[960px] mx-auto flex flex-col gap-5">
      <BackButton className="mt-4" />

      <div className="flex items-center gap-4">
        {game?.coverUrl ? (
          <img
            src={hiResCover(game.coverUrl)}
            alt=""
            className="w-14 h-[76px] shrink-0 rounded-md object-cover border border-dark-border"
          />
        ) : (
          <div
            className="w-14 h-[76px] shrink-0 rounded-md border border-dark-border bg-dark-bg-lighter flex items-center justify-center text-[11px] text-gray-400"
            aria-hidden="true"
          >
            capa
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-white text-balance">
            Resenhas da comunidade
          </h1>
          {game ? (
            <p className="text-sm text-gray-400">
              <Link
                to={gamePath(game)}
                className={`text-primary-link hover:text-white transition-colors rounded-sm ${focusRing}`}
              >
                {game.name}
              </Link>{' '}
              · voltar para a página do jogo
            </p>
          ) : (
            <div className="mt-1 h-4 w-40 rounded bg-dark-bg-lighter animate-pulse" />
          )}
        </div>
      </div>

      <ReviewSummary igdbId={igdbId} />

      {game && <OwnReviewCard igdbId={igdbId} game={game} />}

      <section
        aria-labelledby="community-reviews-title"
        className="mt-3 flex flex-col gap-4"
      >
        <h2
          id="community-reviews-title"
          className="flex items-center gap-4 text-center text-[13px] font-normal uppercase tracking-[0.08em] text-gray-400 before:h-px before:flex-1 before:bg-dark-border after:h-px after:flex-1 after:bg-dark-border"
        >
          Resenhas da comunidade
        </h2>
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }, (_, i) => `sk${i}`).map(k => (
                <div
                  key={k}
                  className="h-32 rounded-lg border border-dark-border bg-dark-bg-light animate-pulse"
                />
              ))}
            </div>
          ) : isError ? (
            // biome-ignore lint/a11y/useSemanticElements: role="alert" explícito, não há elemento nativo equivalente (<output> é status, não alert)
            <div
              role="alert"
              className="flex items-center justify-between gap-4 rounded-lg border border-dark-border bg-dark-bg-light px-4 py-3"
            >
              <div>
                <p className="text-red-400 text-sm">
                  Não foi possível carregar as resenhas
                </p>
                <p className="text-gray-400 text-xs">
                  Verifique a conexão e tente de novo.
                </p>
              </div>
              <Button variant="secondary" size="md" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : total === 0 ? (
            <div className="flex flex-col items-center gap-1 py-4 text-center">
              <p className="text-sm font-medium text-gray-200">
                Ninguém publicou uma resenha desse jogo.
              </p>
              <p className="text-sm text-gray-400">
                Quando alguém publicar, aparece aqui. A sua pode ser a primeira.
              </p>
            </div>
          ) : others.length === 0 ? (
            <>
              <p className="text-sm text-gray-400">
                {page === 1
                  ? 'Ninguém mais publicou uma resenha desse jogo.'
                  : 'Não há outras resenhas nesta página.'}
              </p>
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={othersTotal}
                  itemsPerPage={0}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-gray-400">
                {othersTotal} {othersTotal === 1 ? 'resenha' : 'resenhas'}
                {hasOwn ? ' de outras pessoas' : ''}
              </p>
              <div ref={listRef} className="flex flex-col gap-3 scroll-mt-6">
                {others.map(review => (
                  <CommunityReviewCard
                    key={review.userId}
                    review={review}
                    expandable
                  />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={othersTotal}
                itemsPerPage={others.length}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </section>
    </div>
  )
}
