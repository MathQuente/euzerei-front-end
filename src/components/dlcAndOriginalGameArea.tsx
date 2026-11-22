import { Crown, Layers, type LucideIcon, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DlcAndOriginalGameAreaProps } from '../interfaces/games'
import { focusRing } from '../styles/focus'
import type { GameBase } from '../types/games'
import { gamePath } from '../utils/gamePath'
import { parentGameLabel } from '../utils/parentGameLabel'
import { splitRelatedGames } from '../utils/relatedGameGroups'
import { getGameTag } from './gamesComponents/gameCard'
import { Pagination } from './pagination'
import { SectionHeading } from './sectionHeading'

const DLCS_PER_PAGE = 5

function RelatedGamesSection({
  title,
  icon,
  games,
}: {
  title: string
  icon: LucideIcon
  games: GameBase[]
}) {
  const [page, setPage] = useState(1)

  if (games.length === 0) return null

  const totalPages = Math.ceil(games.length / DLCS_PER_PAGE) || 1
  const paged = games.slice((page - 1) * DLCS_PER_PAGE, page * DLCS_PER_PAGE)

  return (
    <div className="bg-dark-bg-light border border-dark-border rounded-lg p-5">
      <SectionHeading icon={icon}>{title}</SectionHeading>
      <div className="flex flex-col gap-2">
        {paged.map(related => (
          <Link
            to={gamePath(related)}
            key={related.igdbId}
            className={`flex items-center gap-4 p-3 bg-dark-bg-lighter border border-dark-border rounded-lg hover:border-primary/50 transition-colors group ${focusRing}`}
          >
            {related.coverUrl ? (
              <img
                src={related.coverUrl}
                alt={related.name}
                className="w-12 h-16 object-cover rounded flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-16 rounded bg-dark-bg flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate group-hover:text-primary-light transition-colors">
                {related.name}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {getGameTag(
                  related.name,
                  related.summary,
                  related.category,
                  related.parentGameId
                ) ?? 'Edição'}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {games.length > DLCS_PER_PAGE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={games.length}
          itemsPerPage={paged.length}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

export function DlcAndOriginalGameArea({
  game,
  relatedGames,
}: DlcAndOriginalGameAreaProps) {
  if (!game.parentGame && relatedGames.length === 0) return null

  const { dlcs, versions } = splitRelatedGames(relatedGames)
  const parentLabel = parentGameLabel(game.category)
  const ParentIcon = game.category === 10 ? Layers : Crown

  return (
    <>
      {game.parentGame && (
        <div className="bg-dark-bg-light border border-dark-border rounded-lg p-5">
          <SectionHeading icon={ParentIcon}>
            {parentLabel.heading}
          </SectionHeading>
          <Link
            to={gamePath(game.parentGame)}
            className={`flex items-center gap-4 p-3 bg-dark-bg-lighter border border-dark-border rounded-lg hover:border-primary/50 transition-colors group ${focusRing}`}
          >
            {game.parentGame.coverUrl ? (
              <img
                src={game.parentGame.coverUrl}
                alt={game.parentGame.name}
                className="w-12 h-16 object-cover rounded flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-16 rounded bg-dark-bg flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate group-hover:text-primary-light transition-colors">
                {game.parentGame.name}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {parentLabel.caption}
              </p>
            </div>
          </Link>
        </div>
      )}

      <RelatedGamesSection title="DLCs Disponíveis" icon={Plus} games={dlcs} />
      <RelatedGamesSection
        title="Outras versões"
        icon={Layers}
        games={versions}
      />
    </>
  )
}
