import * as Dialog from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Crown, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { api } from '../../hooks/useApi'
import { focusRing } from '../../styles/focus'
import type { GameBase, GameCardData } from '../../types/games'
import { FAVORITE_SLOTS } from '../../utils/favorites'
import { releaseYear } from '../../utils/releaseDate'

const SEARCH_DELAY_MS = 250
const MIN_QUERY_LENGTH = 2
const RESULTS = 12

export interface FavoriteEntry {
  slot: number
  game: GameCardData
}

const rowButton = `grid size-8 place-items-center rounded-md border border-dark-border text-gray-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-35 [@media(max-width:639px)]:size-11 ${focusRing}`

function Cover({ url }: { url: string | null }) {
  return url ? (
    <img
      src={url}
      alt=""
      className="aspect-[7/10] w-9 flex-none rounded object-cover"
    />
  ) : (
    <span
      className="aspect-[7/10] w-9 flex-none rounded bg-dark-bg-light"
      aria-hidden="true"
    />
  )
}

export function FavoriteGamePicker({
  slot,
  entries,
  mainId,
  onChoose,
  onMove,
  onRemove,
  onToggleMain,
  onClose,
  onCloseFocus,
}: {
  slot: number | null
  entries: FavoriteEntry[]
  mainId: number | null
  onChoose: (game: GameCardData) => void
  onMove: (from: number, to: number) => void
  onRemove: (slot: number) => void
  onToggleMain: (igdbId: number) => void
  onClose: () => void
  onCloseFocus: () => void
}) {
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [text])

  const full = slot === null

  useEffect(() => {
    if (full) contentRef.current?.focus()
    else inputRef.current?.focus()
  }, [full])
  const searching = !full && query.length >= MIN_QUERY_LENGTH
  const takenIds = entries.map(entry => entry.game.igdbId)
  const currentId = entries.find(entry => entry.slot === slot)?.game.igdbId

  const choose = (game: GameCardData) => {
    onChoose(game)
    setText('')
    setQuery('')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const { data, isLoading, isError } = useQuery<{ games: GameBase[] }>({
    queryKey: ['favoritePicker', query],
    queryFn: () => api.searchGames(query, 1, RESULTS),
    enabled: searching,
  })
  const results = searching ? (data?.games ?? []).slice(0, RESULTS) : []

  return (
    <Dialog.Root open onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-confirm bg-black/70" />
        <Dialog.Content
          ref={contentRef}
          onOpenAutoFocus={event => {
            event.preventDefault()
            inputRef.current?.focus()
          }}
          onCloseAutoFocus={event => {
            event.preventDefault()
            onCloseFocus()
          }}
          className="fixed left-1/2 top-1/2 z-confirm-content flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-lg bg-dark-bg-lighter p-5 text-white"
        >
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="font-semibold text-white">
              Jogos favoritos
            </Dialog.Title>
            <Dialog.Close
              className={`grid size-8 place-items-center rounded-md text-gray-400 hover:text-white [@media(max-width:639px)]:size-11 ${focusRing}`}
              aria-label="Fechar"
            >
              <X className="size-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-xs text-gray-400">
            {slot === null
              ? 'Os 4 favoritos já estão escolhidos. Tire um para escolher outro.'
              : `Busque qualquer jogo para a vaga ${slot + 1}. Ele não precisa estar na sua biblioteca.`}
          </Dialog.Description>

          <div className={full ? 'hidden' : 'relative'}>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              value={text}
              onChange={event => setText(event.target.value)}
              placeholder="Buscar jogos pelo nome..."
              aria-label="Buscar jogos pelo nome"
              autoComplete="off"
              className="block w-full rounded-lg border border-dark-border bg-dark-bg-darker py-3 pl-9 pr-3 text-base text-white outline-none transition-colors focus-visible:border-primary-light focus-visible:ring-1 focus-visible:ring-primary-light sm:text-sm"
            />
          </div>

          <div
            className={`-mx-2 flex min-h-24 flex-col overflow-y-auto px-2 [scrollbar-color:#3f4152_transparent] [scrollbar-width:thin] ${searching ? 'max-h-[min(18.5rem,45vh)]' : ''}`}
          >
            {searching ? (
              <ul className="flex flex-col gap-0.5">
                {isLoading && (
                  <li className="px-2 py-3 text-sm text-gray-400">
                    Buscando...
                  </li>
                )}
                {isError && (
                  <li className="px-2 py-3 text-sm text-red-300">
                    Não foi possível buscar agora. Tente de novo.
                  </li>
                )}
                {!isLoading && !isError && results.length === 0 && (
                  <li className="px-2 py-3 text-sm text-gray-400">
                    Nenhum jogo encontrado.
                  </li>
                )}
                {results.map(game => {
                  const isCurrent = game.igdbId === currentId
                  const isTaken = !isCurrent && takenIds.includes(game.igdbId)
                  return (
                    <li key={game.igdbId}>
                      <button
                        type="button"
                        disabled={isTaken}
                        onClick={() => choose(game)}
                        className={`flex min-h-12 w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-dark-bg-light disabled:cursor-not-allowed disabled:opacity-45 ${focusRing}`}
                      >
                        <Cover url={game.coverUrl} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">
                            {game.name}
                          </span>
                          {game.releaseDate && (
                            <span className="block text-xs text-gray-500">
                              {releaseYear(game.releaseDate)}
                            </span>
                          )}
                        </span>
                        <span className="flex-none text-xs text-gray-500">
                          {isCurrent
                            ? 'Atual'
                            : isTaken
                              ? 'Já é favorito'
                              : 'Escolher'}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : entries.length > 0 ? (
              <>
                <p className="px-2 pb-2 text-xs text-gray-400">
                  {text.trim() !== ''
                    ? 'Digite pelo menos 2 letras para buscar.'
                    : 'Já estão na sua seção:'}
                </p>
                <ul
                  aria-label="Jogos que já estão na seção"
                  className="flex flex-col divide-y divide-dark-border rounded-lg border border-dark-border"
                >
                  {entries.map(entry => (
                    <li
                      key={entry.game.igdbId}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <Cover url={entry.game.coverUrl} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">
                          {entry.game.name}
                        </span>
                        <span className="block text-xs text-gray-500">
                          Vaga {entry.slot + 1}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleMain(entry.game.igdbId)}
                        aria-pressed={entry.game.igdbId === mainId}
                        aria-label={
                          entry.game.igdbId === mainId
                            ? `Tirar a coroa de ${entry.game.name}`
                            : `Marcar como favorito: ${entry.game.name}`
                        }
                        className={twMerge(
                          rowButton,
                          entry.game.igdbId === mainId &&
                            'border-primary-light/70 text-primary-link hover:text-primary-link'
                        )}
                      >
                        <Crown
                          className={`size-4 ${entry.game.igdbId === mainId ? 'fill-current' : ''}`}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        disabled={entry.slot === 0}
                        onClick={() => onMove(entry.slot, entry.slot - 1)}
                        aria-label={`Subir ${entry.game.name}`}
                        className={rowButton}
                      >
                        <ChevronUp className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={entry.slot === FAVORITE_SLOTS - 1}
                        onClick={() => onMove(entry.slot, entry.slot + 1)}
                        aria-label={`Descer ${entry.game.name}`}
                        className={rowButton}
                      >
                        <ChevronDown className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(entry.slot)}
                        aria-label={`Tirar ${entry.game.name} dos favoritos`}
                        className={`${rowButton} hover:border-red-400/60 hover:text-red-300`}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="px-2 py-3 text-sm text-gray-400">
                {text.trim() !== ''
                  ? 'Digite pelo menos 2 letras para buscar.'
                  : 'Digite o nome de um jogo para buscar.'}
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
