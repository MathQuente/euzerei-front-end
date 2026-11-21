import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useCallback, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../components/backButton'
import { GameListPage } from '../components/gameListPage'
import { LIBRARY_STATUS_BADGES } from '../components/gamesComponents/gameCard'
import { StatusMessage } from '../components/statusMessage'
import { api } from '../hooks/useApi'
import { PUBLIC_USER_PROFILE_KEY } from '../hooks/useCanonicalUserUrl'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { SortField, SortOrder, StatusTab } from '../interfaces/games'
import { GameStatusEnum } from '../types/games'
import type { GameListData, UserGamesResponse } from '../types/games'
import { parsePlatforms } from '../utils/listFilters'
import { defaultSortFieldFor, sortFieldsFor } from '../utils/listSort'
import { QUEUE_FILTER, QUEUE_STATUSES } from '../utils/queue'
import { userPath } from '../utils/userPath'

const ITEMS_PER_PAGE = 48

// Largados só aparecem para o dono, então não há aba nem rota para eles.
const ROUTE_TO_STATUS: Record<string, GameStatusEnum> = {
  playedGames: GameStatusEnum.Played,
  playingGames: GameStatusEnum.Playing,
  pausedGames: GameStatusEnum.Paused,
  backlogGames: GameStatusEnum.Backlog,
  wishlistGames: GameStatusEnum.Wishlist,
}

const STATUS_TO_ROUTE = Object.fromEntries(
  Object.entries(ROUTE_TO_STATUS).map(([route, status]) => [status, route])
) as Record<string, string>

const STATUS_TITLES: Record<string, string> = {
  [GameStatusEnum.Played]: 'Zerados',
  [GameStatusEnum.Playing]: 'Jogando',
  [GameStatusEnum.Paused]: 'Pausados',
  [GameStatusEnum.Backlog]: 'Na fila',
  [GameStatusEnum.Wishlist]: 'Lista de desejos',
}

const TAB_LABELS: Record<string, string> = {
  ...STATUS_TITLES,
  [GameStatusEnum.Wishlist]: 'Desejos',
}

export function PublicUserGamesPage() {
  const { userId: ref, status } = useParams<{
    userId: string
    status: string
  }>()
  const navigate = useNavigate()

  const currentStatus = status ? ROUTE_TO_STATUS[status] : undefined

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [sort, setSort] = useState<{ field?: SortField; order: SortOrder }>({
    order: 'desc',
  })

  const listContext =
    currentStatus === GameStatusEnum.Played
      ? 'played'
      : currentStatus === GameStatusEnum.Wishlist
        ? 'wishlist'
        : 'library'
  const sortFields = sortFieldsFor(listContext)
  const defaultField = defaultSortFieldFor(listContext)
  const sortOffered =
    sort.field !== undefined && sortFields.includes(sort.field)
  const sortField: SortField = sortOffered ? sort.field! : defaultField
  const sortOrder: SortOrder = sortOffered ? sort.order : 'desc'

  const platformFilterApplies = currentStatus !== GameStatusEnum.Wishlist
  const libraryPlatforms = platformFilterApplies
    ? parsePlatforms(platforms.join(','))
    : []

  const profile = useQuery({
    queryKey: [PUBLIC_USER_PROFILE_KEY, ref],
    queryFn: () => api.getUserProfile(ref ?? null),
    enabled: !!ref && !!currentStatus,
  })

  const filter =
    currentStatus === GameStatusEnum.Backlog ? QUEUE_FILTER : currentStatus

  const list = useQuery<UserGamesResponse>({
    queryKey: [
      'publicUserGamesPage',
      ref,
      filter,
      page,
      search,
      sortField,
      sortOrder,
      libraryPlatforms,
    ],
    queryFn: () =>
      api.getPublicUserGamesPage(ref ?? null, {
        page,
        search,
        filter: filter!,
        sortBy: sortField,
        sortOrder,
        platforms: libraryPlatforms,
      }),
    placeholderData: keepPreviousData,
    enabled: !!ref && !!filter && profile.isSuccess,
  })

  const profileBase = ref ? userPath({ id: ref, userName: ref }) : '/'
  const name = profile.data?.user.userName ?? 'Perfil'
  const title = currentStatus ? STATUS_TITLES[currentStatus] : undefined
  useDocumentTitle(title ? `${title} · ${name}` : undefined)

  const refine = useCallback(() => setPage(1), [])

  if (!ref || !currentStatus) {
    return <Navigate to={ref ? userPath({ id: ref }) : '/'} replace />
  }

  const httpStatus = isAxiosError(profile.error)
    ? profile.error.response?.status
    : undefined
  if (profile.isError && (httpStatus === 400 || httpStatus === 404)) {
    return (
      <>
        <BackButton className="mt-4" />
        <StatusMessage
          variant="not-found"
          icon="not-found"
          title="Perfil não encontrado"
          description="Essa pessoa não existe ou mudou de endereço. Tente buscar pelo nome."
          showSearch
        />
      </>
    )
  }

  const totals = list.data?.totalPerStatus ?? []
  const countOf = (...statuses: string[]) =>
    totals
      .filter(t => statuses.includes(t.status))
      .reduce((sum, t) => sum + t.totalGames, 0)

  const statusTabs: StatusTab[] = Object.values(ROUTE_TO_STATUS).map(value => ({
    value,
    label: TAB_LABELS[value],
    href: `${profileBase}/${STATUS_TO_ROUTE[value]}`,
    countClass: LIBRARY_STATUS_BADGES[value]?.iconColor,
    count: totals.length
      ? value === GameStatusEnum.Backlog
        ? countOf(...QUEUE_STATUSES.filter(s => s !== GameStatusEnum.Dropped))
        : countOf(value)
      : undefined,
  }))

  const games: GameListData = {
    games: list.data?.games[currentStatus] ?? [],
    total: list.data?.total ?? 0,
  }

  return (
    <>
      <BackButton className="mt-4" />
      <h1 className="sr-only">
        {title} de {name}
      </h1>
      {list.data && (
        <GameListPage
          games={games}
          page={page}
          pageSize={ITEMS_PER_PAGE}
          setPage={setPage}
          sortOrder={sortOrder}
          setSortOrder={order => setSort({ field: sortField, order })}
          sortField={sortField}
          setSortField={field => setSort(prev => ({ ...prev, field }))}
          defaultSort={{ field: defaultField, order: 'desc' }}
          currentStatus={currentStatus}
          filterField={currentStatus}
          isChangingPage={list.isPlaceholderData}
          onFilterChange={value => {
            refine()
            setSearch('')
            setSort({ order: 'desc' })
            navigate(`${profileBase}/${STATUS_TO_ROUTE[value]}`)
          }}
          isUserLibrary
          sortFields={sortFields}
          search={search}
          setSearch={setSearch}
          searchPlaceholder={`Buscar na biblioteca de ${name}`}
          statusTabs={statusTabs}
          platforms={platformFilterApplies ? platforms : undefined}
          setPlatforms={platformFilterApplies ? setPlatforms : undefined}
        />
      )}
    </>
  )
}
