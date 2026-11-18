import { Link } from 'react-router-dom'
import type { UserGameEntry } from '../../types/games'
import { gamePath } from '../../utils/gamePath'
import { GameCard } from '../gamesComponents/gameCard'
import { coverLink, sectionTitle, textLink } from './styles'

const MAX_PLAYING = 5
const EXTRA_VISIBILITY = ['', '', '', 'hidden 2xl:block', 'hidden wide:block']

function seeAllVisibility(total: number) {
  return [
    total > 3 ? 'inline' : 'hidden',
    total > 4 ? '2xl:inline' : '2xl:hidden',
    total > 5 ? 'wide:inline' : 'wide:hidden',
  ].join(' ')
}

export function PlayingNow({
  games,
  total,
}: {
  games: UserGameEntry[]
  total: number
}) {
  const shown = games.slice(0, MAX_PLAYING)

  return (
    <section className={`min-w-0 ${shown.length > 1 ? 'lg:w-fit' : ''}`}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className={sectionTitle}>Jogando agora</h2>
        {total > 3 && (
          <Link
            to="/userLibrary/playingGames"
            className={`text-sm ${seeAllVisibility(total)} ${textLink}`}
          >
            Ver todos os {total}
          </Link>
        )}
      </div>

      {shown.length === 0 && (
        <div className="mt-4 flex flex-col items-start gap-2">
          <p className="text-gray-400">Você não está jogando nada agora.</p>
          <Link to="/games" className={textLink}>
            Explorar jogos
          </Link>
        </div>
      )}

      {shown.length === 1 && (
        <Link
          to={gamePath(shown[0])}
          aria-label={shown[0].name}
          className={`mt-4 block w-28 sm:w-36 lg:w-44 ${coverLink}`}
        >
          <GameCard game={shown[0]} size="medium" interactive={false} />
        </Link>
      )}

      {shown.length > 1 && (
        <ul className="mt-4 grid max-w-lg grid-cols-3 gap-3 lg:flex lg:max-w-none lg:gap-6">
          {shown.map((game, index) => (
            <li
              key={game.igdbId}
              className={`min-w-0 lg:w-40 xl:w-44 ${EXTRA_VISIBILITY[index]}`}
            >
              <Link
                to={gamePath(game)}
                aria-label={game.name}
                className={coverLink}
              >
                <GameCard game={game} size="medium" interactive={false} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
