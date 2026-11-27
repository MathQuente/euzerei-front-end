import type { LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import type { IconType } from 'react-icons'
import type {
  Game,
  GameBase,
  GameCardData,
  GameListData,
  GameResponse,
  GameStatusEnum,
  SimilarGamesResponse,
} from '../types/games'
import type { ReleasePrecision } from '../utils/releaseDate'

export type SortField =
  | 'name'
  | 'releaseDate'
  | 'rating'
  | 'hoursPlayed'
  | 'completedAt'
  | 'droppedAt'
  | 'lastPlayedAt'
  | 'dateAdded'
export type SortOrder = 'asc' | 'desc'
export type SectionType = 'coming' | 'trending' | 'rateds'

export type ReleaseDateDisplay = 'upcoming' | 'all' | 'none'

/** Uma opção do filtro de plataforma (biblioteca ou catálogo). */
export interface PlatformOption {
  value: string
  label: string
  icon: IconType | LucideIcon
}

export interface GameCardProps {
  game: GameCardData
  className?: string
  size?: 'small' | 'medium' | 'compact' | 'larger' | 'row' | 'feature'
  enableModal?: boolean
  interactive?: boolean
  hoverEffects?: boolean
  /** Carrega a capa já, sem esperar entrar na tela (carrosséis). */
  eager?: boolean
  statusBar?: boolean
  favorite?: boolean
  hundredWave?: boolean
  showTag?: boolean
  /** Data de lançamento no card: só jogo futuro (padrão), todos ou nenhum. */
  releaseDateDisplay?: ReleaseDateDisplay
}

export interface GameFormProps {
  game: GameCardData | undefined
}

export interface GameInfoProps {
  game: GameCardData | undefined
  onClose: () => void
}

export interface GamesGridProps {
  games: GameCardData[]
  emptyState?: ReactNode
  className?: string
  releaseDateDisplay?: ReleaseDateDisplay
}

export interface GameListProps {
  games: GameListData
  releaseDateDisplay?: ReleaseDateDisplay
  page: number
  pageSize?: number
  setPage: (page: number) => void
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
  sortField: SortField
  setSortField: (field: SortField) => void
  defaultSort?: { field: SortField; order: SortOrder }
  filterField?: GameStatusEnum
  setFilterField?: (filterField: GameStatusEnum) => void
  currentStatus?: string
  onFilterChange?: (filter: GameStatusEnum) => void
  isUserLibrary?: boolean
  emptyState?: ReactNode
  isChangingPage?: boolean
  sortFields?: SortField[]
  search?: string
  setSearch?: (search: string) => void
  searchPlaceholder?: string
  statusTabs?: StatusTab[]
  platforms?: string[]
  setPlatforms?: (platforms: string[]) => void
  /** Opções do filtro de plataforma; o padrão são as plataformas de loja da biblioteca. */
  platformOptions?: PlatformOption[]
  /** Lê `?platforms=` da URL ao voltar no histórico. */
  parsePlatforms?: (param: string | null) => string[]
}

export interface GameListSectionProps extends ComponentProps<'div'> {
  games: GameBase[]
  title: string
  type: SectionType
}

export interface SimilarGamesSliderProps {
  SimilarGames: SimilarGamesResponse
}

export interface RelatedGamesSliderProps {
  relatedGames: GameBase[]
}

export interface DlcAndOriginalGameAreaProps {
  game: Game
  relatedGames: GameBase[]
}

export interface GameLaunchersDivProps {
  platformName: string
  date: number | null
  precision?: ReleasePrecision
}

export interface RatingAverageProps {
  game: GameCardData | undefined
  isForGamePage?: boolean
  showValue?: boolean
  justAverage?: boolean
}

export interface DetailsProps {
  GameResponse: GameResponse
}

export interface PlatformDivProps {
  platformName: string
}

export interface CategoriesDivProps {
  categoryName: string
}

export interface PlayerInfosProps {
  GameResponse: GameResponse
}

export interface StatusTab {
  value: GameStatusEnum
  label: string
  href: string
  count?: number
  /** Classe de cor do número (a cor do status). */
  countClass?: string
}

export interface ListToolbarProps {
  totalGames: number
  sortField: SortField
  sortOrder: SortOrder
  sortFields?: SortField[]
  onSortChange?: (field: SortField, order: SortOrder) => void
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  statusTabs?: StatusTab[]
  currentStatus?: GameStatusEnum
  onStatusChange?: (value: GameStatusEnum) => void
  platforms?: string[]
  onPlatformsChange?: (platforms: string[]) => void
  platformOptions?: PlatformOption[]
  /** "Atualizando…" ou "Carregando página N…" enquanto a lista troca. */
  loadingLabel?: string
}
