import { Heart, Pencil } from 'lucide-react'
import { useRef, useState } from 'react'
import { useFavoriteGames } from '../../hooks/useFavoriteGames'
import { useSaveFavorites } from '../../hooks/useSaveFavorites'
import type { GameCardData } from '../../types/games'
import { isHundredPercent } from '../../utils/cardBadges'
import {
  FAVORITE_SLOTS,
  type FavoriteDraft,
  clearMainIfRemoved,
  compactFavorites,
  isFavoritesDirty,
  moveFavorite,
  setFavoriteSlot,
  toDraft,
  toggleMain,
} from '../../utils/favorites'
import { Button } from '../button'
import { GameCard } from '../gamesComponents/gameCard'
import { inlineAction, sectionTitle } from '../homeComponents/styles'
import { UnsavedChangesGuard } from '../unsavedChangesGuard'
import { FavoriteCardMarks } from './favoriteCardMarks'
import { FavoriteGamePicker } from './favoriteGamePicker'
import { FavoriteSlots } from './favoriteSlots'

export function FavoriteGamesSection({
  userId,
  editable,
  hideError = false,
}: {
  userId: string
  editable: boolean
  /** A página já mostra um aviso de erro só para tudo: este não repete o seu. */
  hideError?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const { favorites, isLoading, isError, refetch } = useFavoriteGames(
    userId,
    editing
  )
  const { save, isSaving } = useSaveFavorites(userId)
  const [draft, setDraft] = useState<FavoriteDraft>(() => toDraft([]))
  const [known, setKnown] = useState<Map<number, GameCardData>>(new Map())
  const [pickSlot, setPickSlot] = useState<number | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const openedSlot = useRef(0)
  const [announcement, setAnnouncement] = useState('')
  const [baseline, setBaseline] = useState<number[]>([])
  const [main, setMain] = useState<number | null>(null)
  const [baselineMain, setBaselineMain] = useState<number | null>(null)

  const savedIds = favorites.map(game => game.igdbId)
  const savedMain = favorites.find(game => game.isMain)?.igdbId ?? null
  const dirty = editing && isFavoritesDirty(draft, baseline, main, baselineMain)

  const announce = (name: string | undefined, slot: number) => {
    if (name) setAnnouncement(`${name}, vaga ${slot + 1} de ${FAVORITE_SLOTS}`)
  }

  const retarget = (next: FavoriteDraft) => {
    if (!pickerOpen) return
    if (pickSlot === null || draft[pickSlot] === null) {
      const empty = next.indexOf(null)
      setPickSlot(empty === -1 ? null : empty)
    }
  }

  const handleMove = (from: number, to: number) => {
    const next = moveFavorite(draft, from, to)
    if (next === draft) return
    setDraft(next)
    retarget(next)
    const id = draft[from]
    if (id !== null) announce(known.get(id)?.name, to)
  }

  if (isLoading) return null
  if (isError && !editing) {
    if (!editable || hideError) return null
    return (
      <section
        aria-labelledby="favorites-title"
        className="border-t border-dark-border pt-6"
      >
        <h2
          id="favorites-title"
          className={`flex items-center gap-2 ${sectionTitle}`}
        >
          <Heart
            className="size-5 text-primary-light opacity-60"
            aria-hidden="true"
          />
          Jogos favoritos
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Não foi possível carregar seus favoritos agora.{' '}
          <button
            type="button"
            onClick={() => refetch()}
            className={inlineAction}
          >
            Tentar novamente
          </button>
        </p>
      </section>
    )
  }
  if (!editable && favorites.length === 0) return null

  const startEditing = () => {
    setBaseline(savedIds)
    setBaselineMain(savedMain)
    setMain(savedMain)
    setDraft(toDraft(savedIds))
    setKnown(new Map(favorites.map(game => [game.igdbId, game])))
    setAnnouncement('')
    setEditing(true)
  }

  const handleRemove = (slot: number) => {
    const id = draft[slot]
    const name = id === null ? undefined : known.get(id)?.name
    const next = setFavoriteSlot(draft, slot, null)
    setDraft(next)
    setMain(clearMainIfRemoved(main, next))
    retarget(next)
    if (name) setAnnouncement(`${name} saiu dos favoritos`)
  }

  const handleChoose = (game: GameCardData) => {
    if (pickSlot === null) return
    setKnown(previous => new Map(previous).set(game.igdbId, game))
    const next = setFavoriteSlot(draft, pickSlot, game.igdbId)
    setDraft(next)
    setMain(clearMainIfRemoved(main, next))
    announce(game.name, pickSlot)
    const empty = next.indexOf(null)
    setPickSlot(empty === -1 ? null : empty)
  }

  const handleSave = async () => {
    try {
      await save({ igdbIds: compactFavorites(draft), mainIgdbId: main })
      setEditing(false)
    } catch {
      return
    }
  }

  const handleToggleMain = (igdbId: number) => {
    const next = toggleMain(main, igdbId)
    setMain(next)
    const name = known.get(igdbId)?.name
    if (name) {
      setAnnouncement(
        next === null
          ? `${name} perdeu a coroa`
          : `${name} agora é o seu favorito`
      )
    }
  }

  const focusSlot = () => {
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>(`[data-slot-hit="${openedSlot.current}"]`)
        ?.focus()
    )
  }

  const entries = draft.flatMap((id, slot) => {
    const game = id === null ? undefined : known.get(id)
    return game ? [{ slot, game }] : []
  })

  const heading = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <h2
        id="favorites-title"
        className={`flex items-center gap-2 ${sectionTitle}`}
      >
        <Heart
          className={`size-5 text-primary-light ${favorites.length > 0 || editing ? 'fill-current' : 'opacity-60'}`}
          aria-hidden="true"
        />
        {editing ? 'Editando favoritos' : 'Jogos favoritos'}
      </h2>
      {editing ? (
        <p className="text-sm text-gray-400">
          Clique numa vaga para escolher. Arraste para mudar a ordem.
        </p>
      ) : (
        editable &&
        favorites.length > 0 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={startEditing}
            className="gap-1.5"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Editar
          </Button>
        )
      )}
    </div>
  )

  if (!editing && favorites.length === 0) {
    return (
      <section
        aria-labelledby="favorites-title"
        className="border-t border-dark-border pt-6"
      >
        {heading}
        <p className="mt-1 text-sm text-gray-400">
          Escolha até {FAVORITE_SLOTS} jogos para aparecerem no topo do seu
          perfil.{' '}
          <button type="button" onClick={startEditing} className={inlineAction}>
            Escolher favoritos
          </button>
        </p>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="favorites-title"
      className="border-t border-dark-border pt-6"
    >
      {heading}

      {editing ? (
        <>
          <div className="mt-4">
            <FavoriteSlots
              draft={draft}
              games={known}
              mainId={main}
              disabled={isSaving}
              onMove={handleMove}
              onRemove={handleRemove}
              onPick={slot => {
                openedSlot.current = slot
                setPickSlot(slot)
                setPickerOpen(true)
              }}
              onToggleMain={handleToggleMain}
            />
          </div>
          <output className="sr-only">{announcement}</output>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            {dirty && (
              <p className="mr-auto text-sm text-amber-200 [@media(max-width:639px)]:w-full">
                Alterações ainda não salvas
              </p>
            )}
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={isSaving}
              onClick={() => setEditing(false)}
              className="[@media(max-width:639px)]:flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={!dirty}
              loading={isSaving}
              onClick={handleSave}
              className="[@media(max-width:639px)]:flex-1"
            >
              Salvar
            </Button>
          </div>

          {pickerOpen && (
            <FavoriteGamePicker
              slot={pickSlot}
              entries={entries}
              mainId={main}
              onChoose={handleChoose}
              onMove={handleMove}
              onRemove={handleRemove}
              onToggleMain={handleToggleMain}
              onClose={() => {
                setPickerOpen(false)
                setPickSlot(null)
              }}
              onCloseFocus={focusSlot}
            />
          )}
        </>
      ) : (
        <ul
          aria-label="Jogos favoritos"
          className="mt-4 grid grid-cols-4 gap-2 pt-3 sm:gap-3 lg:grid-cols-[repeat(4,minmax(0,12.5rem))] lg:gap-5"
        >
          {favorites.map((game, index) => (
            <li key={game.igdbId} className="min-w-0">
              <div className="relative">
                <GameCard
                  game={game}
                  size="medium"
                  enableModal
                  statusBar={false}
                  hoverEffects={false}
                  showTag={false}
                  favorite={game.isMain}
                  hundredWave={false}
                />
                <FavoriteCardMarks
                  main={game.isMain}
                  hundred={isHundredPercent(game)}
                  index={index}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <UnsavedChangesGuard
        dirty={dirty}
        description="Você tem favoritos não salvos. Se sair desta página, eles serão perdidos."
      />
    </section>
  )
}
