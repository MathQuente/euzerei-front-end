import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { GameInfo } from '../../components/gamesComponents/gameInfo'
import { GameModal } from '../../components/gamesComponents/gameModal'
import { GameModalBoundary } from '../../components/gamesComponents/gameModalBoundary'
import { isCanonicalReplace } from '../../hooks/useCanonicalGameUrl'
import { focusMainHeading } from '../../hooks/useFocusOnRouteChange'
import type { GameCardData } from '../../types/games'
import { GameModalContext, type OpenGameModal } from './gameModalContext'

function canFocus(el: HTMLElement | null): el is HTMLElement {
  if (!el) return false
  return el.isConnected && el.getClientRects().length > 0
}

function focusAfterClose(trigger: HTMLElement | null, igdbId: number | null) {
  const sameGameCard =
    igdbId === null
      ? null
      : document.querySelector<HTMLElement>(`[data-game-id="${igdbId}"]`)
  const target = [trigger, sameGameCard].find(canFocus)
  if (target) {
    target.focus({ preventScroll: true })
    return
  }
  focusMainHeading(true)
}

export function GameModalProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameCardData | null>(null)
  const { pathname, state } = useLocation()
  const navigationType = useNavigationType()
  const triggerRef = useRef<HTMLElement | null>(null)
  const igdbIdRef = useRef<number | null>(null)
  const closedByRouteRef = useRef(false)
  const lastPathname = useRef(pathname)

  const openGame = useCallback<OpenGameModal>((next, trigger) => {
    triggerRef.current = trigger
    igdbIdRef.current = next.igdbId
    closedByRouteRef.current = false
    setGame(next)
  }, [])

  const close = useCallback(() => setGame(null), [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: só a troca de pathname fecha o modal; state e navigationType são lidos na hora
  useEffect(() => {
    if (lastPathname.current === pathname) return
    lastPathname.current = pathname
    if (isCanonicalReplace(navigationType, state)) return
    closedByRouteRef.current = true
    setGame(null)
  }, [pathname])

  const handleCloseAutoFocus = useCallback((event: Event) => {
    event.preventDefault()
    const trigger = triggerRef.current
    const igdbId = igdbIdRef.current
    triggerRef.current = null
    igdbIdRef.current = null
    if (closedByRouteRef.current) return
    focusAfterClose(trigger, igdbId)
  }, [])

  return (
    <GameModalContext.Provider value={openGame}>
      {children}
      <GameModal
        open={game !== null}
        onOpenChange={open => {
          if (!open) close()
        }}
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        {game && (
          <GameModalBoundary key={game.igdbId} onClose={close}>
            <GameInfo game={game} onClose={close} />
          </GameModalBoundary>
        )}
      </GameModal>
    </GameModalContext.Provider>
  )
}
