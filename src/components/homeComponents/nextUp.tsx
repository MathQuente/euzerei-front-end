import { ChevronRight, RefreshCw } from 'lucide-react'
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCoverTint } from '../../hooks/useCoverTint'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { focusRing } from '../../styles/focus'
import type {
  GameCardData,
  GameToDisplayResponse,
  UserGameEntry,
} from '../../types/games'
import { gamePath } from '../../utils/gamePath'
import { hiResCover } from '../../utils/hiResCover'
import { GameCard } from '../gamesComponents/gameCard'
import { StartPlayingButton } from '../startPlayingButton'
import { coverLink, sectionTitle, textLink } from './styles'

const QUEUE_SIZE = 3
const LEAVE_MS = 220

function Suggestion({
  game,
  message,
  inLibrary,
  onAnother,
  onStarted,
  leaving = false,
  entering = false,
  celebrating = false,
  showRoulette = false,
}: {
  game: GameCardData
  message?: string
  inLibrary: boolean
  onAnother?: () => void
  onStarted: (game: GameCardData) => void
  leaving?: boolean
  entering?: boolean
  celebrating?: boolean
  showRoulette?: boolean
}) {
  const [from, to] = useCoverTint(
    game.coverUrl ? hiResCover(game.coverUrl) : null
  )
  const backdrop: CSSProperties = {
    background: `radial-gradient(circle at 20% 30%, ${from}, transparent 60%), radial-gradient(circle at 80% 85%, ${to}, transparent 55%)`,
  }

  return (
    <article className="relative isolate overflow-hidden rounded-2xl border border-dark-border bg-dark-bg-darker">
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 opacity-35 blur-3xl transition-[background] duration-500"
        style={backdrop}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-dark-bg-darker/35 to-dark-bg-darker/85"
      />
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-end sm:gap-6 sm:p-5 lg:p-6">
        <div
          className={`relative w-28 flex-none rounded-lg shadow-2xl shadow-black/60 sm:w-36 lg:w-44 ${
            leaving ? 'next-up-out' : entering ? 'next-up-cover-in' : ''
          }`}
        >
          <Link to={gamePath(game)} className={coverLink}>
            <GameCard game={game} size="medium" interactive={false} />
          </Link>
          {celebrating && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-lg"
            >
              <span className="follow-ring" />
            </span>
          )}
        </div>
        <div
          className={`min-w-0 pb-1 ${leaving ? 'next-up-out' : entering ? 'next-up-in' : ''}`}
        >
          <p className="font-display text-xl font-extrabold leading-tight tracking-tight text-white lg:text-[1.65rem]">
            {game.name}
          </p>
          {(celebrating || message) && (
            <p
              className={`mt-1 text-sm ${celebrating ? 'text-green-400' : 'text-gray-400'}`}
            >
              {celebrating ? 'Movido para Jogando agora' : message}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <StartPlayingButton
              key={game.igdbId}
              igdbId={game.igdbId}
              inLibrary={inLibrary}
              celebrating={celebrating}
              onStarted={() => onStarted(game)}
            />
            {onAnother ? (
              <button
                type="button"
                onClick={onAnother}
                disabled={celebrating}
                className={`group inline-flex min-h-11 items-center gap-1.5 px-1 ${textLink} disabled:opacity-50`}
              >
                <RefreshCw
                  className="size-4 transition-transform duration-500 group-hover:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
                Outra sugestão
              </button>
            ) : (
              !inLibrary && (
                <Link to="/games" className={textLink}>
                  Explorar jogos
                </Link>
              )
            )}
            {showRoulette && !celebrating && (
              <Link
                to="/roleta"
                className={`inline-flex min-h-11 items-center gap-0.5 px-1 ${textLink}`}
              >
                Sortear na roleta
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function NextUp({
  backlog,
  libraryIds,
  suggestion,
  title = 'Para jogar em seguida',
  showEmptyNote = true,
  loadingSuggestion = false,
  wide = true,
  showRoulette = false,
  celebrate,
  celebrationFinished,
  onStarted,
}: {
  backlog: UserGameEntry[]
  libraryIds: Set<number>
  suggestion: GameToDisplayResponse | undefined
  title?: string
  showEmptyNote?: boolean
  loadingSuggestion?: boolean
  /** Em coluna larga, o destaque e a fila ficam lado a lado. */
  wide?: boolean
  /** Mostra o link da roleta (só vale quando há pendentes para sortear). */
  showRoulette?: boolean
  /** Jogo que acabou de começar a ser jogado (a celebração vive na home). */
  celebrate: GameCardData | null
  celebrationFinished: boolean
  onStarted: (game: GameCardData) => void
}) {
  const [offset, setOffset] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const animateIn = advanced || celebrationFinished
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const reducedMotion = usePrefersReducedMotion()
  const pinnedId = useRef<number | null>(null)
  const outsideSuggestion = useRef<GameToDisplayResponse | null>(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function advance(step: number) {
    if (leaving || celebrate) return
    clearTimeout(timer.current)
    if (reducedMotion) {
      setOffset(value => value + step)
      return
    }
    setLeaving(true)
    timer.current = setTimeout(() => {
      setOffset(value => value + step)
      setAdvanced(true)
      setLeaving(false)
    }, LEAVE_MS)
  }

  function handleStarted(game: GameCardData) {
    clearTimeout(timer.current)
    setLeaving(false)
    onStarted(game)
  }

  const suggestedId = suggestion?.game?.igdbId
  if (pinnedId.current === null && suggestion) {
    pinnedId.current = suggestedId ?? -1
  }

  if (
    outsideSuggestion.current?.game &&
    libraryIds.has(outsideSuggestion.current.game.igdbId)
  ) {
    outsideSuggestion.current = null
  }
  if (
    !outsideSuggestion.current &&
    suggestion?.game &&
    !libraryIds.has(suggestion.game.igdbId)
  ) {
    outsideSuggestion.current = suggestion
  }

  if (backlog.length > 0 && loadingSuggestion && pinnedId.current === null) {
    return (
      <section className="min-w-0" aria-busy="true">
        <h2 className={sectionTitle}>{title}</h2>
        <div className="mt-4 h-60 rounded-2xl bg-dark-bg-light" />
        <div className="mb-2 mt-6 h-4 w-32 rounded bg-dark-bg-light" />
        <div className="h-14 rounded-lg bg-dark-bg-light" />
      </section>
    )
  }

  if (backlog.length > 0) {
    const start = Math.max(
      0,
      backlog.findIndex(game => game.igdbId === pinnedId.current)
    )
    const at = (step: number) =>
      backlog[(start + offset + step) % backlog.length]
    const current = at(0)
    const queue = Array.from(
      { length: Math.min(QUEUE_SIZE, backlog.length - 1) },
      (_, i) => at(i + 1)
    )
    const shown = celebrate ?? current

    return (
      <section className="min-w-0 [container-type:inline-size]">
        <h2 className={sectionTitle}>{title}</h2>
        <div
          className={`mt-4 grid gap-5 ${wide ? '[@container(min-width:680px)]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] [@container(min-width:680px)]:items-stretch' : ''}`}
        >
          <Suggestion
            key={celebrate ? `done:${shown.igdbId}` : shown.igdbId}
            game={shown}
            message={
              shown.igdbId === suggestedId ? suggestion?.message : undefined
            }
            inLibrary
            leaving={leaving}
            entering={animateIn && !celebrate}
            celebrating={Boolean(celebrate)}
            showRoulette={showRoulette}
            onStarted={handleStarted}
            onAnother={backlog.length > 1 ? () => advance(1) : undefined}
          />
          {queue.length > 0 && (
            <div className="flex min-w-0 flex-col gap-2.5">
              <p className="text-sm text-gray-400">Também na sua fila</p>
              <ul
                key={current.igdbId}
                className={`m-0 flex list-none flex-col gap-2.5 p-0 ${animateIn ? 'next-up-in' : ''}`}
              >
                {queue.map((game, index) => (
                  <li key={game.igdbId} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => advance(index + 1)}
                      disabled={Boolean(celebrate)}
                      className={`group flex w-full items-center gap-3.5 rounded-xl border border-dark-border bg-dark-bg-light p-2.5 text-left transition-[transform,border-color,background-color] duration-200 hover:translate-x-1 hover:border-primary-light/50 hover:bg-dark-bg-lighter active:bg-dark-bg-lighter motion-reduce:transition-none motion-reduce:hover:translate-x-0 ${focusRing}`}
                    >
                      <span className="flex-none">
                        <GameCard game={game} size="row" interactive={false} />
                      </span>
                      <span className="line-clamp-2 min-w-0 flex-1 text-[14.5px] leading-snug text-gray-100">
                        {game.name}
                      </span>
                      <span className="hidden flex-none text-xs text-gray-500 transition-colors group-hover:text-primary-link sm:inline">
                        Ver primeiro
                        <ChevronRight
                          className="ml-0.5 inline size-3.5 align-[-2px]"
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    )
  }

  const outside = outsideSuggestion.current
  const outsideGame = celebrate ?? outside?.game ?? null

  return (
    <section className="min-w-0">
      <h2 className={sectionTitle}>{title}</h2>
      {outsideGame ? (
        <>
          {showEmptyNote && (
            <p className="mt-4 text-gray-400">Sua fila está vazia.</p>
          )}
          <div className="mt-4">
            <Suggestion
              game={outsideGame}
              message={outside?.message}
              inLibrary={false}
              celebrating={Boolean(celebrate)}
              entering={animateIn && !celebrate}
              onStarted={handleStarted}
            />
          </div>
        </>
      ) : (
        <div className="mt-4 flex flex-col items-start gap-2">
          <p className="max-w-sm text-gray-400">
            Sua fila está vazia. Coloque jogos na fila para ver sugestões aqui.
          </p>
          <Link to="/games" className={textLink}>
            Explorar jogos
          </Link>
        </div>
      )}
    </section>
  )
}
