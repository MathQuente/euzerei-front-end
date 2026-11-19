import { useEffect, useRef, useState } from 'react'
import { INFO_MESSAGES } from '../constants/messages'
import type { GameListProps, SortField, SortOrder } from '../interfaces/games'
import type { GameStatusEnum } from '../types/games'
import {
  parsePlatforms as parseLibraryPlatforms,
  platformsParam,
} from '../utils/listFilters'
import { pushListState } from '../utils/listHistory'
import { SORT_FIELDS } from '../utils/listSort'
import { notify } from '../utils/notify'
import { parsePage } from '../utils/parsePage'
import { GameGridSkeleton } from './gameGridSkeleton'
import { GamesGrid } from './gamesComponents/gamesGrid'
import { ListToolbar } from './listToolbar'
import { Pagination } from './pagination'
import { StatusMessage } from './statusMessage'

const CHANGING_PAGE_DELAY_MS = 200
/** Passou disso, as capas viram esqueleto: espera curta fica discreta, longa fica clara. */
const SKELETON_AFTER_MS = 1500
const NO_PLATFORMS: string[] = []

export function GameListPage({
  games,
  setPage,
  page,
  pageSize = 20,
  sortOrder,
  setSortOrder,
  sortField,
  setSortField,
  defaultSort,
  filterField,
  setFilterField,
  onFilterChange,
  isUserLibrary,
  emptyState,
  isChangingPage = false,
  sortFields,
  search = '',
  setSearch,
  searchPlaceholder,
  statusTabs,
  platforms = NO_PLATFORMS,
  setPlatforms,
  platformOptions,
  parsePlatforms = parseLibraryPlatforms,
  showReleaseDate,
}: GameListProps) {
  const gamesArray = games.games

  const [loadingStage, setLoadingStage] = useState<'idle' | 'soft' | 'deep'>(
    'idle'
  )
  const changeKind = useRef<'page' | 'refine'>('refine')
  useEffect(() => {
    if (!isChangingPage) {
      setLoadingStage('idle')
      return
    }
    const soft = setTimeout(
      () => setLoadingStage('soft'),
      CHANGING_PAGE_DELAY_MS
    )
    const deep = setTimeout(() => setLoadingStage('deep'), SKELETON_AFTER_MS)
    return () => {
      clearTimeout(soft)
      clearTimeout(deep)
    }
  }, [isChangingPage])

  const safeTotal =
    typeof games.total === 'number' && !Number.isNaN(games.total)
      ? games.total
      : 0
  const safePage =
    typeof page === 'number' && !Number.isNaN(page) && page > 0 ? page : 1
  const totalPages = Math.ceil(safeTotal / pageSize) || 1
  const loadingLabel =
    loadingStage === 'idle'
      ? undefined
      : changeKind.current === 'page'
        ? `Carregando página ${safePage}…`
        : 'Atualizando…'
  const hasFilters = Boolean(search) || platforms.length > 0
  const listEmptyState = hasFilters ? (
    <StatusMessage
      variant="empty"
      title="Nenhum jogo encontrado"
      description={
        search && platforms.length === 0
          ? `Nada com "${search}". Tente outro termo.`
          : 'Nenhum jogo com esses filtros. Tente remover algum.'
      }
    />
  ) : (
    emptyState
  )
  const isAwaitingPage = gamesArray.length === 0 && safeTotal > 0

  useEffect(() => {
    if (safeTotal > 0 && safePage > totalPages) {
      const url = new URL(window.location.toString())
      url.searchParams.set('page', String(totalPages))
      window.history.replaceState(window.history.state, '', url)
      setPage(totalPages)
      notify.info(INFO_MESSAGES.pageOutOfRange(safePage), {
        id: 'page-out-of-range',
      })
    }
  }, [safeTotal, safePage, totalPages, setPage])

  const fallbackSort = useRef(
    defaultSort ?? { field: sortField, order: sortOrder }
  )
  if (defaultSort) fallbackSort.current = defaultSort

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    function syncFromUrl() {
      const params = new URL(window.location.toString()).searchParams
      const urlField = params.get('sortField') as SortField | null
      const urlOrder = params.get('sortOrder')

      setPage(parsePage(params.get('page')))
      setSearch?.(params.get('search') ?? '')
      setPlatforms?.(parsePlatforms(params.get('platforms')))
      setSortField(
        urlField && (sortFields ?? SORT_FIELDS).includes(urlField)
          ? urlField
          : fallbackSort.current.field
      )
      setSortOrder(
        urlOrder === 'asc' || urlOrder === 'desc'
          ? urlOrder
          : fallbackSort.current.order
      )
      window.scrollTo(0, 0)
    }

    window.addEventListener('popstate', syncFromUrl)
    return () => {
      window.removeEventListener('popstate', syncFromUrl)
      window.history.scrollRestoration = previousRestoration
    }
  }, [
    setPage,
    setSortField,
    setSortOrder,
    setSearch,
    setPlatforms,
    parsePlatforms,
    sortFields,
  ])

  function setCurrentPage(p: number) {
    changeKind.current = 'page'
    const url = new URL(window.location.toString())
    url.searchParams.set('page', String(p))
    pushListState(url)
    setPage(p)
    window.scrollTo(0, 0)
  }

  function onSortChange(field: SortField, order: SortOrder) {
    changeKind.current = 'refine'
    const url = new URL(window.location.toString())
    url.searchParams.set('sortField', field)
    url.searchParams.set('sortOrder', order)
    pushListState(url)
    setSortField(field)
    setSortOrder(order)
  }

  function replaceListParam(key: string, value: string | undefined) {
    changeKind.current = 'refine'
    const url = new URL(window.location.toString())
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
    url.searchParams.delete('page')
    window.history.replaceState(window.history.state, '', url)
    setPage(1)
  }

  function onSearchChange(value: string) {
    replaceListParam('search', value)
    setSearch?.(value)
  }

  function onPlatformsChange(value: string[]) {
    replaceListParam('platforms', platformsParam(value))
    setPlatforms?.(value)
  }

  function onStatusChange(value: GameStatusEnum) {
    changeKind.current = 'refine'
    if (onFilterChange) onFilterChange(value)
    else setFilterField?.(value)
  }

  return (
    <div className="flex flex-col gap-4 w-full mt-4">
      <ListToolbar
        totalGames={safeTotal}
        sortField={sortField}
        sortOrder={sortOrder}
        sortFields={sortFields}
        onSortChange={sortFields ? onSortChange : undefined}
        search={search}
        onSearchChange={setSearch ? onSearchChange : undefined}
        searchPlaceholder={searchPlaceholder}
        statusTabs={isUserLibrary ? statusTabs : undefined}
        currentStatus={filterField}
        onStatusChange={onStatusChange}
        platforms={platforms}
        onPlatformsChange={setPlatforms ? onPlatformsChange : undefined}
        platformOptions={platformOptions}
        loadingLabel={loadingLabel}
      />

      {isAwaitingPage ? (
        <GameGridSkeleton
          count={Math.max(
            1,
            Math.min(pageSize, safeTotal - (page - 1) * pageSize)
          )}
        />
      ) : (
        <div className="relative" aria-busy={isChangingPage}>
          {loadingStage !== 'idle' && (
            <div
              className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden rounded"
              aria-hidden="true"
            >
              <span className="list-loading-bar" />
            </div>
          )}
          {loadingStage === 'deep' ? (
            <GameGridSkeleton count={gamesArray.length || pageSize} />
          ) : (
            <div
              className={
                loadingStage === 'soft'
                  ? 'pointer-events-none opacity-60 transition-opacity duration-200'
                  : 'transition-opacity duration-200'
              }
            >
              <GamesGrid
                games={gamesArray}
                emptyState={listEmptyState}
                showReleaseDate={showReleaseDate}
              />
            </div>
          )}
        </div>
      )}

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={safeTotal}
        itemsPerPage={gamesArray.length}
        onPageChange={setCurrentPage}
        disabled={isChangingPage}
      />
    </div>
  )
}
