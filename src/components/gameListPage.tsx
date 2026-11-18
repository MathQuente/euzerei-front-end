import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { INFO_MESSAGES } from '../constants/messages'
import type { GameListProps, SortField, SortOrder } from '../interfaces/games'
import type { GameStatusEnum } from '../types/games'
import { pushListState } from '../utils/listHistory'
import { notify } from '../utils/notify'
import { parsePage } from '../utils/parsePage'
import { GameGridSkeleton } from './gameGridSkeleton'
import { GamesGrid } from './gamesComponents/gamesGrid'
import { Pagination } from './pagination'
import { SortControls } from './sorting'

const CHANGING_PAGE_DELAY_MS = 200

const SORT_FIELDS: SortField[] = [
  'name',
  'releaseDate',
  'rating',
  'hoursPlayed',
  'completedAt',
]

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
}: GameListProps) {
  const gamesArray = games.games

  const [showChangingPage, setShowChangingPage] = useState(false)
  useEffect(() => {
    if (!isChangingPage) {
      setShowChangingPage(false)
      return
    }
    const timer = setTimeout(
      () => setShowChangingPage(true),
      CHANGING_PAGE_DELAY_MS
    )
    return () => clearTimeout(timer)
  }, [isChangingPage])

  const safeTotal =
    typeof games.total === 'number' && !Number.isNaN(games.total)
      ? games.total
      : 0
  const safePage =
    typeof page === 'number' && !Number.isNaN(page) && page > 0 ? page : 1
  const totalPages = Math.ceil(safeTotal / pageSize) || 1
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
      setSortField(
        urlField && SORT_FIELDS.includes(urlField)
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
  }, [setPage, setSortField, setSortOrder])

  function setCurrentPage(p: number) {
    const url = new URL(window.location.toString())
    url.searchParams.set('page', String(p))
    pushListState(url)
    setPage(p)
    window.scrollTo(0, 0)
  }

  function onSortFieldChange(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as SortField
    const url = new URL(window.location.toString())
    url.searchParams.set('sortField', value)
    pushListState(url)
    setSortField(value)
  }

  function onSortOrderChange(order: SortOrder) {
    const url = new URL(window.location.toString())
    url.searchParams.set('sortOrder', order)
    pushListState(url)
    setSortOrder(order)
  }

  function onSortFilterField(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as GameStatusEnum
    if (onFilterChange) onFilterChange(value)
    else setFilterField?.(value)
  }

  return (
    <div className="flex flex-col gap-4 w-full mt-4">
      <SortControls
        onSortFieldChange={onSortFieldChange}
        onSortOrderChange={onSortOrderChange}
        onSortFilterField={onSortFilterField}
        filterField={filterField}
        sortField={sortField}
        sortOrder={sortOrder}
        isUserLibrary={isUserLibrary}
        totalGames={safeTotal}
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
          {showChangingPage && (
            <>
              <div
                className="absolute inset-x-0 top-0 z-20 h-0.5 animate-pulse rounded bg-primary-light motion-reduce:animate-none"
                aria-hidden="true"
              />
              <output className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-dark-border bg-dark-bg-light px-3 py-1 text-xs text-gray-200 shadow-lg shadow-black/40">
                Carregando página {safePage}…
              </output>
            </>
          )}
          <div
            className={
              showChangingPage
                ? 'pointer-events-none opacity-50 saturate-50 transition-opacity duration-200'
                : 'transition-opacity duration-200'
            }
          >
            <GamesGrid games={gamesArray} emptyState={emptyState} />
          </div>
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
