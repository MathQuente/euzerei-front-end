import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import userProfilePictureDefault from '../../assets/Default_pfp.svg.png'
import { BANNER_FADE } from '../../styles/bannerFade'
import { focusRing } from '../../styles/focus'
import type { TotalPerStatus } from '../../types/games'
import type { AchievementStats } from '../../types/user'
import { handleLabel } from '../../utils/handleLabel'
import { formatMemberSince } from '../../utils/memberSince'
import { ProfileStats } from './profileStats'
import { type StoreAccounts, StoreChips, hasStoreAccounts } from './storeChips'

// O texto sobe para cima do banner: a sombra garante a leitura em qualquer imagem.
const onBanner =
  '[text-shadow:0_1px_2px_rgb(0_0_0/0.85),0_0_10px_rgb(0_0_0/0.55)]'

const socialButton = `inline-flex min-h-11 items-center rounded-sm text-gray-400 transition-colors hover:text-gray-200 ${focusRing}`

function Count({ value, label }: { value: number; label: string }) {
  return (
    <span>
      <b className="font-semibold tabular-nums text-white">
        {value.toLocaleString('pt-BR')}
      </b>{' '}
      {label}
    </span>
  )
}

interface ProfileHeaderProps {
  userName: string
  profilePicture?: string | null
  bannerUrl?: string | null
  gamesAmount: number
  totalHoursPlayed: number
  totalPerStatus?: TotalPerStatus[]
  onStatsRetry?: () => unknown
  createdAt?: string | null
  followersCount: number
  followingCount: number
  onFollowersClick: () => void
  onFollowingClick: () => void
  actions?: ReactNode
  /** Contas vinculadas por loja (nomes de exibição). */
  stores?: StoreAccounts
  /** Conquistas por loja, mostradas ao lado de cada ladrilho. */
  achievementStats?: AchievementStats
  isOwn?: boolean
}

export function ProfileHeader({
  userName,
  profilePicture,
  bannerUrl,
  gamesAmount,
  totalHoursPlayed,
  totalPerStatus,
  onStatsRetry,
  createdAt,
  followersCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
  actions,
  stores,
  achievementStats,
  isOwn = false,
}: ProfileHeaderProps) {
  const memberSince = createdAt ? formatMemberSince(createdAt) : null
  const statsProps = {
    gamesAmount,
    totalHoursPlayed,
    totalPerStatus,
    onRetry: onStatsRetry,
    queueIncludesDropped: isOwn,
  }
  return (
    <header className="overflow-hidden rounded-lg border border-dark-border bg-dark-bg">
      <div className="relative">
        <div
          className="h-40 bg-dark-bg-light sm:h-56 lg:h-64"
          aria-hidden="true"
        >
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-4/5"
            style={{
              background: BANNER_FADE,
            }}
          />
        </div>
        {/* O nome pousa na base do banner, alinhado à coluna ao lado do avatar:
            px-4 + avatar 5rem + gap-4 (mobile); px-6 + avatar 6rem + gap-5 (sm). */}
        <h1
          className={`absolute bottom-3 left-[6rem] right-4 break-words font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:left-[8.75rem] sm:right-[17rem] sm:text-3xl ${onBanner}`}
        >
          {handleLabel(userName)}
        </h1>
        {(actions || memberSince) && (
          <div className="absolute right-4 top-3 flex flex-col items-end gap-2 sm:bottom-3 sm:right-6 sm:top-auto sm:flex-row-reverse sm:items-center sm:gap-3">
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            {memberSince && (
              <p className={`text-sm text-gray-200 ${onBanner}`}>
                Desde {memberSince}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-start gap-x-4 gap-y-1 px-4 pb-2 sm:flex-nowrap sm:gap-x-5 sm:px-6">
        <img
          src={profilePicture || userProfilePictureDefault}
          alt={`Foto de perfil de ${userName}`}
          className="relative -mt-11 size-20 flex-none rounded-full border-4 border-dark-bg bg-dark-bg object-cover sm:-mt-[3.25rem] sm:size-24"
        />

        <div className="flex min-w-0 flex-1 basis-40 flex-wrap items-center gap-x-4 gap-y-0 pt-1">
          {hasStoreAccounts(stores) ? (
            <StoreChips
              stores={stores}
              achievementStats={achievementStats}
              isOwn={isOwn}
            />
          ) : (
            isOwn && (
              <Link
                to="/configuracoes/importar"
                className={`inline-flex min-h-11 items-center rounded-sm text-sm text-primary-link transition-colors hover:text-white ${focusRing}`}
              >
                Conectar Steam, Xbox ou PlayStation
              </Link>
            )
          )}

          <div className="flex flex-wrap gap-x-4 text-sm text-gray-400">
            <button
              type="button"
              onClick={onFollowersClick}
              className={socialButton}
            >
              <Count
                value={followersCount}
                label={followersCount === 1 ? 'seguidor' : 'seguidores'}
              />
            </button>
            <button
              type="button"
              onClick={onFollowingClick}
              className={socialButton}
            >
              <Count value={followingCount} label="seguindo" />
            </button>
          </div>
        </div>

        <div className="hidden pt-3 lg:block">
          <ProfileStats {...statsProps} variant="rail" />
        </div>
      </div>

      <div className="lg:hidden">
        <ProfileStats {...statsProps} variant="strip" />
      </div>
      <ProfileStats {...statsProps} variant="retry" />
    </header>
  )
}
