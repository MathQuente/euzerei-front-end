import { Star } from 'lucide-react'
import { useGameStatus } from '../hooks/useGameStatus'
import { useRating } from '../hooks/useRating'
import type { GameCardData } from '../types/games'
import { RatingAverage } from './ratingAverage'

const box =
  'rounded-lg border border-dark-border bg-dark-bg-light px-3.5 py-3 flex flex-col gap-1.5'

export function OwnRatingEntry({
  game,
  signedIn,
}: {
  game: GameCardData
  signedIn: boolean
}) {
  if (!signedIn) {
    return (
      <div className={box}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[13px] text-gray-400">Sua nota</span>
          <div className="flex items-center gap-3">
            <span
              className="peer flex cursor-not-allowed gap-1 text-dark-border"
              title="Entre na sua conta para avaliar"
              // biome-ignore lint/a11y/useSemanticElements: role="img" com aria-label agrupa as estrelas; <img> não aceita filhos
              role="img"
              aria-label="Avaliação indisponível: entre na sua conta para avaliar"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} className="size-7" aria-hidden="true" />
              ))}
            </span>
            <span
              className="text-sm text-gray-400 opacity-0 transition-opacity peer-hover:opacity-100 motion-reduce:transition-none"
              aria-hidden="true"
            >
              Entre para avaliar
            </span>
          </div>
        </div>
      </div>
    )
  }

  return <SignedInRating game={game} />
}

function SignedInRating({ game }: { game: GameCardData }) {
  const { userRating } = useRating(game.igdbId.toString())
  const { gameStatus, isLoadingStatus } = useGameStatus(game.igdbId.toString())
  const notInLibrary = !isLoadingStatus && !gameStatus?.userGameStatus
  const released = game.releaseDate
    ? new Date() > new Date(game.releaseDate * 1000)
    : false

  return (
    <div className={box}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[13px] text-gray-400">Sua nota</span>
        <RatingAverage game={game} isForGamePage />
      </div>
      {released && !userRating && notInLibrary && (
        <p className="text-xs text-gray-400">
          Avaliar um jogo fora da sua biblioteca o adiciona como Jogando.
        </p>
      )}
    </div>
  )
}
