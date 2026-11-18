import * as Dialog from '@radix-ui/react-dialog'
import { ChevronRight, Dices, X } from 'lucide-react'
import { type RefObject, useRef } from 'react'
import { Link } from 'react-router-dom'
import { focusRing } from '../../styles/focus'
import type { UserGameEntry } from '../../types/games'
import { gamePath } from '../../utils/gamePath'
import { Button } from '../button'
import { GameCard } from '../gamesComponents/gameCard'
import { textLink } from '../homeComponents/styles'
import { StartPlayingButton } from '../startPlayingButton'

interface RouletteResultDialogProps {
  game: UserGameEntry | null
  open: boolean
  returnFocusRef: RefObject<HTMLElement>
  onClose: () => void
  onAgain: () => void
  onStarted: (game: UserGameEntry) => void
}

export function RouletteResultDialog({
  game,
  open,
  returnFocusRef,
  onClose,
  onAgain,
  onStarted,
}: RouletteResultDialogProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  return (
    <Dialog.Root
      open={open && game !== null}
      onOpenChange={next => {
        if (!next) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-confirm bg-black/75" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={event => {
            event.preventDefault()
            titleRef.current?.focus()
          }}
          onCloseAutoFocus={event => {
            event.preventDefault()
            returnFocusRef.current?.focus()
          }}
          className="fixed left-1/2 top-1/2 z-confirm-content max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-dark-bg-lighter px-6 pb-6 pt-8 text-center text-white shadow-2xl shadow-black/60"
        >
          {game && (
            <div className="flex animate-swap-in flex-col items-center gap-1.5 motion-reduce:animate-none">
              <div className="mb-3 w-28 sm:w-36">
                <GameCard
                  game={game}
                  size="medium"
                  interactive={false}
                  hoverEffects={false}
                  statusBar={false}
                />
              </div>
              <Dialog.Title
                ref={titleRef}
                tabIndex={-1}
                className="text-balance font-display text-[1.65rem] font-extrabold leading-tight tracking-tight outline-none sm:text-3xl"
              >
                {game.name}
              </Dialog.Title>
              <p className="text-gray-400">Sorteado da sua fila</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <StartPlayingButton
                  key={game.igdbId}
                  igdbId={game.igdbId}
                  inLibrary
                  onStarted={() => onStarted(game)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={onAgain}
                  className="gap-1.5"
                >
                  <Dices className="size-4" aria-hidden="true" />
                  Sortear de novo
                </Button>
                <Link
                  to={gamePath(game)}
                  className={`inline-flex min-h-11 items-center gap-0.5 px-1 ${textLink}`}
                >
                  Ver o jogo
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
          <Dialog.Close
            aria-label="Fechar"
            className={`absolute right-1.5 top-1.5 grid size-11 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-dark-bg-light hover:text-white ${focusRing}`}
          >
            <X className="size-5" aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
