import { Shuffle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BackButton } from '../components/backButton'
import { Button, buttonClasses } from '../components/button'
import { GameCard } from '../components/gamesComponents/gameCard'
import { textLink } from '../components/homeComponents/styles'
import { ConfettiLayer } from '../components/rouletteComponents/confettiLayer'
import { RouletteResultDialog } from '../components/rouletteComponents/rouletteResultDialog'
import {
  RouletteWheel,
  type RouletteWheelHandle,
} from '../components/rouletteComponents/rouletteWheel'
import { SoundToggle } from '../components/rouletteComponents/soundToggle'
import { StartPlayingButton } from '../components/startPlayingButton'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useRoulette } from '../hooks/useRoulette'
import type { UserGameEntry } from '../types/games'
import { gamePath } from '../utils/gamePath'
import { WHEEL_MAX, pickWinnerIndex } from '../utils/roulette'
import { playResult, unlock } from '../utils/rouletteAudio'

const FIRST_SPIN_MS = 7000
const AGAIN_SPIN_MS = 4000
const FIRST_TURNS = 7
const AGAIN_TURNS = 4
const CELEBRATE_DELAY_MS = 420

interface Winner {
  game: UserGameEntry
  index: number
}

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export function RoulettePage() {
  useDocumentTitle('Roleta')
  const [nonce, setNonce] = useState(0)
  const [exclude, setExclude] = useState<number | undefined>()
  const roulette = useRoulette({ nonce, exclude })
  const { total, games, hasData, isLoading, isError, isFetching, isReplacing } =
    roulette

  const [spinning, setSpinning] = useState(false)
  const [settling, setSettling] = useState(false)
  const [winner, setWinner] = useState<Winner | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confetti, setConfetti] = useState(0)
  const [readout, setReadout] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [pendingAgain, setPendingAgain] = useState(false)

  const wheelRef = useRef<RouletteWheelHandle>(null)
  const hubRef = useRef<HTMLButtonElement>(null)
  const spinningRef = useRef(false)
  const mountedRef = useRef(true)
  const lastWinnerId = useRef<number | null>(null)
  const restoreHubFocus = useRef(false)

  const working = spinning || settling
  const busy = working || pendingAgain || isReplacing

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  async function startSpin(sample: UserGameEntry[], again: boolean) {
    if (spinningRef.current || sample.length < 2) return
    spinningRef.current = true
    setSpinning(true)
    setWinner(null)
    setDialogOpen(false)
    setConfetti(0)
    setReadout('')
    setAnnouncement('Sorteando um jogo da fila.')

    const reduced = prefersReducedMotion()
    const index = pickWinnerIndex(sample, lastWinnerId.current)
    const duration = reduced ? 0 : again ? AGAIN_SPIN_MS : FIRST_SPIN_MS
    await wheelRef.current?.spinTo(
      index,
      duration,
      again ? AGAIN_TURNS : FIRST_TURNS
    )
    if (!mountedRef.current) return

    const game = sample[index]
    lastWinnerId.current = game.igdbId
    setSpinning(false)
    setSettling(true)
    setWinner({ game, index })
    setAnnouncement(`Sorteado: ${game.name}.`)

    if (!reduced) {
      await wait(CELEBRATE_DELAY_MS)
      if (!mountedRef.current) return
    }
    playResult()
    if (!reduced) setConfetti(count => count + 1)
    spinningRef.current = false
    setSettling(false)
    setDialogOpen(true)
  }

  const spinOnArrival = useRef(startSpin)
  spinOnArrival.current = startSpin

  useEffect(() => {
    if (!pendingAgain) return
    if (isError) {
      setPendingAgain(false)
      return
    }
    if (!hasData || isFetching || isReplacing) return
    setPendingAgain(false)
    void spinOnArrival.current(games, true)
  }, [pendingAgain, isError, hasData, isFetching, isReplacing, games])

  useEffect(() => {
    if (busy || !restoreHubFocus.current) return
    restoreHubFocus.current = false
    hubRef.current?.focus()
  }, [busy])

  function closeDialog() {
    setDialogOpen(false)
    setConfetti(0)
  }

  function handleSpin() {
    unlock()
    void startSpin(games, false)
  }

  function handleAgain() {
    unlock()
    closeDialog()
    if (total > WHEEL_MAX) {
      setExclude(lastWinnerId.current ?? undefined)
      setNonce(value => value + 1)
      setPendingAgain(true)
      setWinner(null)
      return
    }
    void startSpin(games, true)
  }

  function handleReshuffle() {
    setWinner(null)
    setExclude(lastWinnerId.current ?? undefined)
    setNonce(value => value + 1)
    setAnnouncement('Trocando os jogos da roda.')
  }

  function handleStarted(game: UserGameEntry) {
    closeDialog()
    setWinner(null)
    lastWinnerId.current = null
    restoreHubFocus.current = true
    setExclude(undefined)
    setNonce(value => value + 1)
    setAnnouncement(`${game.name} agora está em Jogando e saiu da roleta.`)
  }

  return (
    <div className="mt-2 flex flex-col gap-5">
      <BackButton className="mb-0 mt-2" />
      <header className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
            Roleta
          </h1>
          <SoundToggle />
        </div>
        <p className="text-gray-400">Sorteie o próximo jogo da sua fila.</p>
        {hasData && (
          <p className="flex flex-wrap gap-x-3 text-gray-400">
            <span>
              <b className="font-display font-semibold tabular-nums text-white">
                {total}
              </b>{' '}
              {total === 1 ? 'pendente' : 'pendentes'} na fila
            </span>
            <span>Jogos largados ficam de fora.</span>
          </p>
        )}
      </header>

      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-dark-border p-5">
          <p className="font-semibold text-white">
            Não foi possível carregar a sua fila.
          </p>
          <p className="max-w-[56ch] text-gray-400">
            Confira a conexão e tente de novo.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => roulette.refetch()}
          >
            Tentar de novo
          </Button>
        </div>
      )}

      {hasData && total === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-dark-border p-5">
          <p className="font-semibold text-white">
            Nenhum jogo pendente na sua fila.
          </p>
          <p className="max-w-[56ch] text-gray-400">
            Quando você puser jogos na fila, eles entram na roleta. Largados e
            pausados ficam de fora.
          </p>
          <Link
            to="/games"
            className={buttonClasses({ variant: 'primary', size: 'md' })}
          >
            Explorar jogos
          </Link>
        </div>
      )}

      {hasData && total === 1 && games[0] && (
        <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-dark-border bg-dark-bg-light p-5">
          <div className="w-28 flex-none sm:w-32">
            <GameCard
              game={games[0]}
              size="medium"
              interactive={false}
              hoverEffects={false}
              statusBar={false}
            />
          </div>
          <div className="flex min-w-0 flex-1 basis-52 flex-col gap-1.5">
            <p className="font-display text-xl font-extrabold leading-tight text-white">
              {games[0].name}
            </p>
            <p className="text-gray-400">
              É o único jogo na fila, então não há o que sortear. Ele é o
              próximo.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <StartPlayingButton
                key={games[0].igdbId}
                igdbId={games[0].igdbId}
                inLibrary
                onStarted={() => handleStarted(games[0])}
              />
              <Link
                to={gamePath(games[0])}
                className={`inline-flex min-h-11 items-center px-1 underline underline-offset-4 ${textLink}`}
              >
                Ver o jogo
              </Link>
            </div>
          </div>
        </div>
      )}

      {!isError && (isLoading || (hasData && total >= 2)) && (
        <section
          aria-label="Roleta de jogos"
          className="flex flex-col items-center gap-5 py-4"
        >
          <RouletteWheel
            ref={wheelRef}
            games={games}
            winnerIndex={winner?.index ?? null}
            loading={isLoading}
            disabled={busy || isLoading}
            onSpin={handleSpin}
            onReadout={setReadout}
            hubRef={hubRef}
          />
          <div className="flex min-h-14 flex-col items-center justify-center gap-2.5 px-2 text-center">
            {working ? (
              <p
                aria-hidden="true"
                className="inline-flex min-h-11 max-w-[92vw] items-center rounded-full border border-dark-border bg-dark-bg-light px-5 font-display text-[17px] font-semibold text-white"
              >
                <span className="truncate">{readout}</span>
              </p>
            ) : isLoading ? (
              <p className="text-gray-400">Carregando a sua fila…</p>
            ) : (
              <>
                <p className="text-gray-400">
                  Clique no centro da roda para sortear.
                </p>
                {total > WHEEL_MAX && (
                  <>
                    <p className="max-w-[52ch] text-[13px] text-gray-400">
                      A roda mostra {games.length} dos {total} pendentes,
                      escolhidos ao acaso. Todos os jogos da fila têm a mesma
                      chance.
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={busy}
                      onClick={handleReshuffle}
                      className="gap-1.5"
                    >
                      <Shuffle className="size-4" aria-hidden="true" />
                      Trocar os jogos da roda
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      )}

      <RouletteResultDialog
        game={winner?.game ?? null}
        open={dialogOpen}
        returnFocusRef={hubRef}
        onClose={closeDialog}
        onAgain={handleAgain}
        onStarted={handleStarted}
      />
      <ConfettiLayer burst={confetti} />
      <output className="sr-only">{announcement}</output>
    </div>
  )
}
