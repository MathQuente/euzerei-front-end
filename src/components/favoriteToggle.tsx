import { Heart } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToggleFavorite } from '../hooks/useToggleFavorite'
import { focusRing } from '../styles/focus'
import { FAVORITE_SLOTS } from '../utils/favorites'

export function FavoriteToggle({
  igdbId,
  gameName,
}: {
  igdbId: number
  gameName: string
}) {
  const {
    isFavorite,
    slot,
    isMain,
    freeSlots,
    isFull,
    isLoading,
    isError,
    isSaving,
    setFavorite,
  } = useToggleFavorite(igdbId)
  const descriptionId = useId()
  const [announcement, setAnnouncement] = useState('')

  const handleClick = async () => {
    const turningOn = !isFavorite
    const hadCrown = isMain
    try {
      const result = await setFavorite(turningOn)
      const nowIn = result.games.findIndex(game => game.igdbId === igdbId)
      if (turningOn && nowIn !== -1) {
        setAnnouncement(`${gameName} entrou nos favoritos, vaga ${nowIn + 1}.`)
      } else if (turningOn) {
        setAnnouncement(
          `Seus ${FAVORITE_SLOTS} favoritos já estão escolhidos. Tire um no perfil para escolher ${gameName}.`
        )
      } else if (!turningOn && nowIn === -1) {
        setAnnouncement(
          hadCrown
            ? `${gameName} saiu dos favoritos e perdeu a coroa.`
            : `${gameName} saiu dos favoritos.`
        )
      }
    } catch {
      return
    }
  }

  let description: React.ReactNode
  if (isError) {
    description = 'Não foi possível carregar os seus favoritos.'
  } else if (isLoading) {
    description = 'Carregando os seus favoritos…'
  } else if (isFavorite && isMain) {
    description = `Está nos seus favoritos, na vaga ${slot}, com a coroa. Ao desligar, ele perde a coroa.`
  } else if (isFavorite) {
    description = `Está nos seus favoritos, na vaga ${slot}.`
  } else if (isFull) {
    description = (
      <>
        Seus {FAVORITE_SLOTS} favoritos já estão escolhidos. Tire um no{' '}
        <Link
          to="/userLibrary"
          className={`rounded-sm text-primary-link underline underline-offset-2 ${focusRing}`}
        >
          perfil
        </Link>{' '}
        para escolher este.
      </>
    )
  } else {
    description = `Mostra este jogo nos seus favoritos, no topo do perfil. Vagas livres: ${freeSlots} de ${FAVORITE_SLOTS}.`
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-dark-bg-lighter min-h-11">
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-sm text-white">
          <Heart
            className={`size-4 text-primary-light ${isFavorite ? 'fill-current' : ''}`}
            aria-hidden
          />
          Favorito
        </span>
        <span id={descriptionId} className="text-xs text-gray-400">
          {description}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isFavorite}
        aria-label="Favorito"
        aria-describedby={descriptionId}
        disabled={isLoading || isError || isSaving || isFull}
        onClick={handleClick}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${isFavorite ? 'bg-primary' : 'bg-dark-border'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform ${isFavorite ? 'translate-x-5' : ''}`}
          aria-hidden="true"
        />
      </button>
      <output className="sr-only">{announcement}</output>
    </div>
  )
}
