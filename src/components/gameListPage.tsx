import { useEffect, useRef, useState } from 'react'
import { INFO_MESSAGES } from '../constants/messages'
import type { GameListProps, SortField, SortOrder } from '../interfaces/games'
import type { GameStatusEnum } from '../types/games'
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
  const listEmptyState = search ? (
    <StatusMessage
      variant="empty"
      title="Nenhum jogo encontrado"
      description={`Nada com "${search}". Tente outro termo.`}
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
  }, [setPage, setSortField, setSortOrder, setSearch, sortFields])

  function setCurrentPage(p: number) {
    const url = new URL(window.location.toString())
    url.searchParams.set('page', String(p))
    pushListState(url)
    setPage(p)
    window.scrollTo(0, 0)
  }

  function onSortChange(field: SortField, order: SortOrder) {
    const url = new URL(window.location.toString())
    url.searchParams.set('sortField', field)
    url.searchParams.set('sortOrder', order)
    pushListState(url)
    setSortField(field)
    setSortOrder(order)
  }

  function onSearchChange(value: string) {
    const url = new URL(window.location.toString())
    const hadSearch = url.searchParams.has('search')
    if (value) url.searchParams.set('search', value)
    else url.searchParams.delete('search')
    url.searchParams.delete('page')
    if (hadSearch && value) {
      window.history.replaceState(window.history.state, '', url)
    } else {
      pushListState(url)
    }
    setSearch?.(value)
    setPage(1)
  }

  function onStatusChange(value: GameStatusEnum) {
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
            <GamesGrid games={gamesArray} emptyState={listEmptyState} />
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
