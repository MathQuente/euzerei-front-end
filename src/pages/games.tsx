import { useState } from 'react'
import { GameGridSkeleton } from '../components/gameGridSkeleton'
import { GameListPage } from '../components/gameListPage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useGames } from '../hooks/useGames'
import type { SortField, SortOrder } from '../interfaces/games'
import { parsePage } from '../utils/parsePage'

export function Games() {
  useDocumentTitle('Jogos')
  const [page, setPage] = useState(() => {
    const url = new URL(window.location.toString())
    return parsePage(url.searchParams.get('page'))
  })

  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    const url = new URL(window.location.toString())
    const v = url.searchParams.get('sortOrder')
    return v === 'desc' ? 'desc' : 'asc'
  })

  const [sortField, setSortField] = useState<SortField>(() => {
    const url = new URL(window.location.toString())
    const v = url.searchParams.get('sortField')
    return v === 'releaseDate'
      ? 'releaseDate'
      : v === 'rating'
        ? 'rating'
        : 'name'
  })

  const LIMIT = 48
  const { GamesResponse, isChangingPage } = useGames(
    page,
    '',
    sortField,
    sortOrder,
    LIMIT,
    { prefetchNext: true }
  )

  if (!GamesResponse) {
    return (
      <div className="flex flex-col gap-4 w-full mt-4 animate-pulse">
        <div className="h-8 bg-dark-bg-light rounded-lg w-48" />
        <GameGridSkeleton count={LIMIT} />
      </div>
    )
  }

  return (
    <>
      <h1 className="sr-only">Jogos</h1>
      <GameListPage
        games={GamesResponse}
        page={page}
        pageSize={LIMIT}
        setPage={setPage}
        isChangingPage={isChangingPage}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        sortField={sortField}
        setSortField={setSortField}
        defaultSort={{ field: 'name', order: 'asc' }}
      />
    </>
  )
}
