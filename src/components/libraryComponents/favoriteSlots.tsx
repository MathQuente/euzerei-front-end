import { ChevronLeft, ChevronRight, Crown, Plus, X } from 'lucide-react'
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { focusRing } from '../../styles/focus'
import type { GameCardData } from '../../types/games'
import { isHundredPercent } from '../../utils/cardBadges'
import {
  FAVORITE_SLOTS,
  type FavoriteDraft,
  moveFavorite,
} from '../../utils/favorites'
import { GameCard } from '../gamesComponents/gameCard'
import { FavoriteCardMarks } from './favoriteCardMarks'

const DRAG_THRESHOLD_PX = 5
const SLIDE_MS = 180

const iconButton = `grid size-8 place-items-center rounded-md border border-dark-border bg-dark-bg text-gray-300 transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35 [@media(max-width:639px)]:size-11 ${focusRing}`

interface DragState {
  from: number
  over: number
  x: number
  y: number
  grabX: number
  grabY: number
  width: number
  height: number
}

export function FavoriteSlots({
  draft,
  games,
  mainId,
  disabled,
  onMove,
  onRemove,
  onPick,
  onToggleMain,
}: {
  draft: FavoriteDraft
  games: Map<number, GameCardData>
  mainId: number | null
  disabled: boolean
  onMove: (from: number, to: number) => void
  onRemove: (slot: number) => void
  onPick: (slot: number) => void
  onToggleMain: (igdbId: number) => void
}) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const slotRefs = useRef<(HTMLLIElement | null)[]>([])
  const rects = useRef(new Map<number, DOMRect>())
  const pending = useRef<{
    from: number
    startX: number
    startY: number
    grabX: number
    grabY: number
    width: number
    height: number
  } | null>(null)
  const draggedRecently = useRef(false)
  const dragRef = useRef<DragState | null>(null)
  const onMoveRef = useRef(onMove)
  onMoveRef.current = onMove
  const pendingFocus = useRef<{ id: number; dir: 'left' | 'right' } | null>(
    null
  )

  const draggedId = drag === null ? null : draft[drag.from]
  const preview =
    drag === null ? draft : moveFavorite(draft, drag.from, drag.over)

  const orderKey = preview.join(',')

  // biome-ignore lint/correctness/useExhaustiveDependencies: roda quando a ordem muda
  useLayoutEffect(() => {
    const next = new Map<number, DOMRect>()
    const reduced = usePrefersReducedMotion()
    for (const element of listRef.current?.querySelectorAll<HTMLElement>(
      '[data-fav-id]'
    ) ?? []) {
      const id = Number(element.dataset.favId)
      const rect = element.getBoundingClientRect()
      next.set(id, rect)
      const before = rects.current.get(id)
      if (!before || reduced) continue
      const dx = before.left - rect.left
      const dy = before.top - rect.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue
      element.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: 'translate(0, 0)' },
        ],
        { duration: SLIDE_MS, easing: 'ease-out' }
      )
    }
    rects.current = next

    const request = pendingFocus.current
    if (request) {
      pendingFocus.current = null
      const card = listRef.current?.querySelector(
        `[data-fav-id="${request.id}"]`
      )
      const preferred = card?.querySelector<HTMLButtonElement>(
        `[data-arrow="${request.dir}"]:not(:disabled)`
      )
      const fallback = card?.querySelector<HTMLButtonElement>(
        '[data-arrow]:not(:disabled)'
      )
      ;(preferred ?? fallback)?.focus()
    }
  }, [orderKey])

  useEffect(() => {
    const slotAt = (x: number, y: number, fallback: number) => {
      for (let slot = 0; slot < FAVORITE_SLOTS; slot++) {
        const rect = slotRefs.current[slot]?.getBoundingClientRect()
        if (
          rect &&
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom
        ) {
          return slot
        }
      }
      return fallback
    }

    const handleMove = (event: PointerEvent) => {
      const start = pending.current
      if (!start) return
      let current = dragRef.current
      if (!current) {
        const far =
          Math.hypot(
            event.clientX - start.startX,
            event.clientY - start.startY
          ) > DRAG_THRESHOLD_PX
        if (!far) return
        document.body.style.cursor = 'grabbing'
        current = {
          from: start.from,
          over: start.from,
          x: event.clientX,
          y: event.clientY,
          grabX: start.grabX,
          grabY: start.grabY,
          width: start.width,
          height: start.height,
        }
      }
      const next = {
        ...current,
        x: event.clientX,
        y: event.clientY,
        over: slotAt(event.clientX, event.clientY, current.over),
      }
      dragRef.current = next
      setDrag(next)
    }

    const finish = (commit: boolean) => {
      const current = dragRef.current
      pending.current = null
      dragRef.current = null
      document.body.style.cursor = ''
      setDrag(null)
      if (!current) return
      draggedRecently.current = true
      setTimeout(() => {
        draggedRecently.current = false
      }, 0)
      if (commit && current.over !== current.from) {
        onMoveRef.current(current.from, current.over)
      }
    }

    const handleUp = () => finish(true)
    const handleCancel = () => finish(false)
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dragRef.current) {
        event.stopPropagation()
        finish(false)
      }
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleCancel)
    window.addEventListener('keydown', handleKey, true)
    window.addEventListener('blur', handleCancel)
    return () => {
      document.body.style.cursor = ''
      dragRef.current = null
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleCancel)
      window.removeEventListener('keydown', handleKey, true)
      window.removeEventListener('blur', handleCancel)
    }
  }, [])

  const startPointer = (
    event: ReactPointerEvent<HTMLDivElement>,
    slot: number
  ) => {
    if (disabled || event.button !== 0 || event.pointerType === 'touch') return
    if ((event.target as HTMLElement).closest('[data-no-drag]')) return
    const rect = event.currentTarget.getBoundingClientRect()
    pending.current = {
      from: slot,
      startX: event.clientX,
      startY: event.clientY,
      grabX: event.clientX - rect.left,
      grabY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    }
    setDrag(null)
  }

  const arrow = (slot: number, id: number, dir: 'left' | 'right') => {
    pendingFocus.current = { id, dir }
    onMove(slot, dir === 'left' ? slot - 1 : slot + 1)
  }

  const floating = drag && draggedId !== null ? games.get(draggedId) : undefined

  return (
    <>
      <ul
        ref={listRef}
        aria-label="Vagas de jogos favoritos"
        className="grid grid-cols-4 gap-2 pt-3 sm:gap-3 lg:grid-cols-[repeat(4,minmax(0,12.5rem))] lg:gap-5 [@media(max-width:639px)]:grid-cols-2 [@media(max-width:639px)]:gap-3"
      >
        {Array.from({ length: FAVORITE_SLOTS }, (_, slot) => {
          const id = preview[slot]
          const isPlaceholder = drag !== null && id !== null && id === draggedId
          const game = id === null ? undefined : games.get(id)
          const number = slot + 1
          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: as vagas são posições fixas
              key={slot}
              ref={element => {
                slotRefs.current[slot] = element
              }}
              className="relative flex min-w-0 flex-col gap-1.5"
            >
              {isPlaceholder ? (
                <div
                  className="flex aspect-[7/10] w-full items-center justify-center rounded-lg border-2 border-dashed border-primary-light bg-primary/10 text-xs font-semibold text-primary-link"
                  aria-hidden="true"
                >
                  Soltar aqui
                </div>
              ) : game ? (
                <div
                  data-fav-id={game.igdbId}
                  onPointerDown={event => startPointer(event, slot)}
                  onDragStart={event => event.preventDefault()}
                  className="group relative cursor-grab select-none rounded-lg active:cursor-grabbing"
                >
                  <GameCard
                    game={game}
                    size="medium"
                    interactive={false}
                    hoverEffects={false}
                    statusBar={false}
                    favorite={game.igdbId === mainId}
                  />
                  <FavoriteCardMarks
                    main={game.igdbId === mainId}
                    hundred={isHundredPercent(game)}
                    index={slot}
                  />
                  <button
                    type="button"
                    data-no-drag
                    disabled={disabled}
                    onClick={() => onToggleMain(game.igdbId)}
                    aria-pressed={game.igdbId === mainId}
                    aria-label={
                      game.igdbId === mainId
                        ? `Tirar a coroa de ${game.name}`
                        : `Marcar como favorito: ${game.name}`
                    }
                    className={`absolute left-1.5 top-1.5 z-20 grid size-[34px] place-items-center rounded-lg border bg-dark-bg transition-colors disabled:cursor-not-allowed disabled:opacity-35 [@media(max-width:639px)]:size-11 ${focusRing} ${
                      game.igdbId === mainId
                        ? 'border-primary-light/70 text-primary-link'
                        : 'border-dark-border text-gray-400 hover:text-white'
                    }`}
                  >
                    <Crown
                      className={`size-[18px] ${game.igdbId === mainId ? 'fill-current' : ''}`}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    data-slot-hit={slot}
                    disabled={disabled}
                    onClick={() => {
                      if (!draggedRecently.current) onPick(slot)
                    }}
                    aria-label={`Vaga ${number}: ${game.name}. Trocar jogo`}
                    className={`absolute inset-0 z-10 rounded-lg ${focusRing}`}
                  />
                  <span
                    className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-lg bg-dark-bg/60 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none"
                    aria-hidden="true"
                  >
                    Trocar jogo
                  </span>
                  <button
                    type="button"
                    data-no-drag
                    disabled={disabled}
                    onClick={() => onRemove(slot)}
                    aria-label={`Tirar ${game.name} dos favoritos`}
                    className={`${iconButton} absolute right-1.5 top-1.5 z-20 hover:border-red-400/60 hover:text-red-300`}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                  <div className="absolute bottom-1.5 right-1.5 z-20 flex gap-1">
                    <button
                      type="button"
                      data-no-drag
                      data-arrow="left"
                      disabled={disabled || slot === 0}
                      onClick={() => arrow(slot, game.igdbId, 'left')}
                      aria-label={`Mover ${game.name} para a esquerda`}
                      className={iconButton}
                    >
                      <ChevronLeft className="size-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      data-no-drag
                      data-arrow="right"
                      disabled={disabled || slot === FAVORITE_SLOTS - 1}
                      onClick={() => arrow(slot, game.igdbId, 'right')}
                      aria-label={`Mover ${game.name} para a direita`}
                      className={iconButton}
                    >
                      <ChevronRight className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  data-slot-hit={slot}
                  disabled={disabled}
                  onClick={() => onPick(slot)}
                  aria-label={`Vaga ${number} vazia. Escolher jogo`}
                  className={`flex aspect-[7/10] w-full flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-dark-border bg-transparent p-2 text-center text-xs text-gray-400 transition-colors hover:border-primary-light hover:bg-primary/10 hover:text-white ${focusRing}`}
                >
                  <Plus className="size-5" aria-hidden="true" />
                  Escolher jogo
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {drag &&
        floating &&
        createPortal(
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-[100] rotate-2 scale-105 rounded-lg shadow-2xl shadow-black/70 ring-2 ring-primary-light"
            style={{
              left: drag.x - drag.grabX,
              top: drag.y - drag.grabY,
              width: drag.width,
              height: drag.height,
            }}
          >
            <GameCard
              game={floating}
              size="medium"
              interactive={false}
              hoverEffects={false}
              statusBar={false}
              favorite={floating.igdbId === mainId}
            />
            <FavoriteCardMarks
              main={floating.igdbId === mainId}
              hundred={isHundredPercent(floating)}
              index={0}
            />
          </div>,
          document.body
        )}
    </>
  )
}
