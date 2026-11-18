import type { SimilarGamesSliderProps } from '../interfaces/games'
import { CoverRow } from './homeComponents/coverRow'
import { SectionHeading } from './sectionHeading'

export function SimilarGamesSlider({ SimilarGames }: SimilarGamesSliderProps) {
  const games = SimilarGames.similarGames

  if (!games.length) return null

  return (
    <div className="bg-dark-bg-light border border-dark-border rounded-lg p-5">
      <SectionHeading>Jogos Similares</SectionHeading>

      <CoverRow
        games={games}
        bleedClassName="-mx-5"
        edgeClassName="px-5"
        className="mt-3"
        itemClassName="w-32 sm:w-36"
      />
    </div>
  )
}
