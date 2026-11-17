export const FAVORITE_SLOTS = 4

export type FavoriteDraft = (number | null)[]

export function toDraft(ids: number[]): FavoriteDraft {
  const draft: FavoriteDraft = ids.slice(0, FAVORITE_SLOTS)
  while (draft.length < FAVORITE_SLOTS) draft.push(null)
  return draft
}

export function compactFavorites(draft: FavoriteDraft): number[] {
  return draft.filter((id): id is number => id !== null)
}

export function isFavoritesDirty(
  draft: FavoriteDraft,
  saved: number[],
  main: number | null = null,
  savedMain: number | null = null
) {
  const layout = toDraft(saved)
  return main !== savedMain || draft.some((id, slot) => id !== layout[slot])
}

export function clearMainIfRemoved(
  main: number | null,
  draft: FavoriteDraft
): number | null {
  return main !== null && draft.includes(main) ? main : null
}

export function toggleMain(main: number | null, igdbId: number) {
  return main === igdbId ? null : igdbId
}

export function moveFavorite(
  draft: FavoriteDraft,
  from: number,
  to: number
): FavoriteDraft {
  const inRange = (index: number) => index >= 0 && index < draft.length
  if (from === to || !inRange(from) || !inRange(to)) return draft

  const next = [...draft]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function setFavoriteSlot(
  draft: FavoriteDraft,
  slot: number,
  igdbId: number | null
): FavoriteDraft {
  const next = draft.map(id => (id === igdbId && igdbId !== null ? null : id))
  next[slot] = igdbId
  return next
}
