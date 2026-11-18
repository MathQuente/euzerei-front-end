import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../components/backButton'
import { GameListPage } from '../components/gameListPage'
import { LIBRARY_STATUS_BADGES } from '../components/gamesComponents/gameCard'
import { INFO_MESSAGES } from '../constants/messages'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useUserGames } from '../hooks/useUserGames'
import type { SortField, SortOrder, StatusTab } from '../interfaces/games'
import { GameStatusEnum } from '../types/games'
import type { GameListData } from '../types/games'
import { parsePlatforms, platformsParam } from '../utils/listFilters'
import { sortFieldsFor } from '../utils/listSort'
import { notify } from '../utils/notify'
import { parsePage } from '../utils/parsePage'
import { QUEUE_FILTER, QUEUE_STATUSES } from '../utils/queue'

const ITEMS_PER_PAGE = 48

export function UserGamesPageByStatus() {
  const { status } = useParams<{ status: string }>()
  const navigate = useNavigate()

  const enumToRouteMap: Record<GameStatusEnum, string> = {
    [GameStatusEnum.Played]: 'playedGames',
    [GameStatusEnum.Playing]: 'playingGames',
    [GameStatusEnum.Paused]: 'pausedGames',
    [GameStatusEnum.Backlog]: 'backlogGames',
    [GameStatusEnum.Wishlist]: 'wishlistGames',
    [GameStatusEnum.Dropped]: 'droppedGames',
  }

  const routeToEnumMap: Record<string, GameStatusEnum> = {
    playedGames: GameStatusEnum.Played,
    playingGames: GameStatusEnum.Playing,
    pausedGames: GameStatusEnum.Paused,
    backlogGames: GameStatusEnum.Backlog,
    wishlistGames: GameStatusEnum.Wishlist,
    droppedGames: GameStatusEnum.Dropped,
  }

  const [page, setPage] = useState(() => {
    const url = new URL(window.location.toString())

    return parsePage(url.searchParams.get('page'))
  })

  const startsOnPlayed =
    (status && routeToEnumMap[status]) === GameStatusEnum.Played

  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    const url = new URL(window.location.toString())
    const v = url.searchParams.get('sortOrder')
    if (v === 'asc' || v === 'desc') return v
    return 'desc'
  })

  const [sortField, setSortField] = useState<SortField>(() => {
    const url = new URL(window.location.toString())
    const v = url.searchParams.get('sortField')
    const offered = sortFieldsFor(startsOnPlayed ? 'played' : 'library')
    const requested = offered.find(field => field === v)
    return requested ?? (startsOnPlayed ? 'completedAt' : 'dateAdded')
  })

  const [platforms, setPlatforms] = useState(() =>
    parsePlatforms(
      new URL(window.location.toString()).searchParams.get('platforms')
    )
  )

  const [search, setSearch] = useState(() => {
    const url = new URL(window.location.toString())
    return url.searchParams.get('search') ?? ''
  })

  const platformsValue = platformsParam(platforms)
  const platformsQuery = platformsValue ? `?platforms=${platformsValue}` : ''

  function handleFilterChange(newFilter: GameStatusEnum) {
    if (newFilter === currentEnumStatus) return
    setSearch('')
    setPage(1)
    const newRoute = enumToRouteMap[newFilter]
    navigate(`/userLibrary/${newRoute}${platformsQuery}`)
    if (newFilter === GameStatusEnum.Played) {
      setSortField('completedAt')
      setSortOrder('desc')
    } else if (sortField === 'completedAt') {
      setSortField('dateAdded')
      setSortOrder('desc')
    }
  }

  const currentEnumStatus =
    status && status in routeToEnumMap
      ? routeToEnumMap[status]
      : GameStatusEnum.Played

  // Desejos não tem plataformas registradas (mover para lá as apaga), então o
  // filtro não vale ali: o controle some e o filtro volta nas outras abas.
  const platformFilterApplies = currentEnumStatus !== GameStatusEnum.Wishlist
  const platformFilter = platformFilterApplies ? platforms : undefined

  const { UserGamesResponse, totalPerStatus, isChangingUserGames } =
    useUserGames(
      page,
      search,
      currentEnumStatus === GameStatusEnum.Backlog
        ? QUEUE_FILTER
        : currentEnumStatus,
      sortOrder,
      sortField,
      platformFilter
    )

  const gamesForList: GameListData = {
    games: UserGamesResponse?.games[currentEnumStatus] ?? [],
    total: UserGamesResponse?.total ?? 0,
  }

  const isInvalidStatus = !status || !(status in routeToEnumMap)

  const statusLabels: Record<GameStatusEnum, string> = {
    [GameStatusEnum.Played]: 'Jogado',
    [GameStatusEnum.Playing]: 'Jogando',
    [GameStatusEnum.Paused]: 'Pausado',
    [GameStatusEnum.Backlog]: 'Na fila',
    [GameStatusEnum.Wishlist]: 'Lista de desejos',
    [GameStatusEnum.Dropped]: 'Larguei',
  }

  const countOf = (...statuses: string[]) =>
    totalPerStatus
      .filter(t => statuses.includes(t.status))
      .reduce((sum, t) => sum + t.totalGames, 0)
  const hasCounts = totalPerStatus.length > 0

  const statusTabs: StatusTab[] = [
    ...[
      GameStatusEnum.Played,
      GameStatusEnum.Playing,
      GameStatusEnum.Paused,
      GameStatusEnum.Backlog,
      GameStatusEnum.Wishlist,
      GameStatusEnum.Dropped,
    ].map(value => ({
      value,
      label:
        value === GameStatusEnum.Wishlist ? 'Desejos' : statusLabels[value],
      href: `/userLibrary/${enumToRouteMap[value]}${platformsQuery}`,
      countClass: LIBRARY_STATUS_BADGES[value]?.iconColor,
      count: hasCounts
        ? value === GameStatusEnum.Backlog
          ? countOf(...QUEUE_STATUSES)
          : countOf(value)
        : undefined,
    })),
  ]

  useDocumentTitle(
    isInvalidStatus
      ? undefined
      : `${statusLabels[routeToEnumMap[status]]} · Minha biblioteca`
  )

  useEffect(() => {
    if (isInvalidStatus) {
      notify.info(INFO_MESSAGES.invalidLibrarySection, {
        id: 'invalid-library-status',
      })
    }
  }, [isInvalidStatus])

  if (isInvalidStatus) {
    return <Navigate to="/userLibrary" replace />
  }

  return (
    <>
      <BackButton className="mt-4" />
      <h1 className="sr-only">Minha biblioteca</h1>
      {UserGamesResponse && (
        <GameListPage
          games={gamesForList}
          page={page}
          pageSize={ITEMS_PER_PAGE}
          setPage={setPage}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          sortField={sortField}
          setSortField={setSortField}
          defaultSort={
            currentEnumStatus === GameStatusEnum.Played
              ? { field: 'completedAt', order: 'desc' }
              : { field: 'dateAdded', order: 'desc' }
          }
          currentStatus={currentEnumStatus}
          filterField={currentEnumStatus}
          isChangingPage={isChangingUserGames}
          onFilterChange={handleFilterChange}
          isUserLibrary
          sortFields={sortFieldsFor(
            currentEnumStatus === GameStatusEnum.Played ? 'played' : 'library'
          )}
          search={search}
          setSearch={setSearch}
          searchPlaceholder="Buscar na biblioteca"
          statusTabs={statusTabs}
          platforms={platformFilter}
          setPlatforms={platformFilterApplies ? setPlatforms : undefined}
        />
      )}
    </>
  )
}
