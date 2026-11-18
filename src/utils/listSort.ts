import type { SortField, SortOrder } from '../interfaces/games'

export type ListContext = 'library' | 'played' | 'wishlist' | 'games'

interface SortFieldMeta {
  label: string
  defaultOrder: SortOrder
  orderLabels: Record<SortOrder, string>
}

export const SORT_FIELD_META: Record<SortField, SortFieldMeta> = {
  dateAdded: {
    label: 'Data de adição',
    defaultOrder: 'desc',
    orderLabels: { desc: 'Mais recentes', asc: 'Mais antigos' },
  },
  completedAt: {
    label: 'Data de finalização',
    defaultOrder: 'desc',
    orderLabels: { desc: 'Mais recentes', asc: 'Mais antigos' },
  },
  name: {
    label: 'Nome',
    defaultOrder: 'asc',
    orderLabels: { asc: 'A–Z', desc: 'Z–A' },
  },
  releaseDate: {
    label: 'Lançamento',
    defaultOrder: 'desc',
    orderLabels: { desc: 'Mais novos', asc: 'Mais antigos' },
  },
  rating: {
    label: 'Avaliação',
    defaultOrder: 'desc',
    orderLabels: { desc: 'Maior nota', asc: 'Menor nota' },
  },
  hoursPlayed: {
    label: 'Tempo de jogo',
    defaultOrder: 'desc',
    orderLabels: { desc: 'Mais horas', asc: 'Menos horas' },
  },
}

export const SORT_FIELDS = Object.keys(SORT_FIELD_META) as SortField[]

const FIELDS_BY_CONTEXT: Record<ListContext, SortField[]> = {
  library: ['dateAdded', 'name', 'releaseDate', 'rating', 'hoursPlayed'],
  played: ['completedAt', 'name', 'releaseDate', 'rating', 'hoursPlayed'],
  // Jogo que você ainda não tem: sem nota sua nem horas jogadas para ordenar.
  wishlist: ['dateAdded', 'name', 'releaseDate'],
  games: ['name', 'releaseDate', 'rating'],
}

export function sortFieldsFor(context: ListContext): SortField[] {
  return FIELDS_BY_CONTEXT[context]
}

/** As duas ordens de um campo, a padrão primeiro. */
export function sortOrdersFor(field: SortField): SortOrder[] {
  const { defaultOrder } = SORT_FIELD_META[field]
  return [defaultOrder, defaultOrder === 'asc' ? 'desc' : 'asc']
}

/** Texto curto do botão: o campo e a ordem juntos, sem seta para decifrar. */
export function sortLabel(field: SortField, order: SortOrder) {
  const { label, orderLabels } = SORT_FIELD_META[field]
  const orderLabel = orderLabels[order]
  if (field === 'name') return `${label} ${orderLabel}`
  if (field === 'dateAdded') return `Adição · ${orderLabel.toLowerCase()}`
  if (field === 'completedAt')
    return `Finalização · ${orderLabel.toLowerCase()}`
  return `${label} · ${orderLabel.toLowerCase()}`
}
