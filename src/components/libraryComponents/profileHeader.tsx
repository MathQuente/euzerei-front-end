import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import userProfilePictureDefault from '../../assets/Default_pfp.svg.png'
import { focusRing } from '../../styles/focus'
import type { TotalPerStatus } from '../../types/games'
import { formatMemberSince } from '../../utils/memberSince'
import { ProfileStats } from './profileStats'
import { type StoreAccounts, StoreChips, hasStoreAccounts } from './storeChips'

const socialButton = `min-h-11 rounded-sm text-gray-200 transition-colors hover:text-white ${focusRing}`

function Count({ value, label }: { value: number; label: string }) {
  return (
    <>
      <b className="font-semibold tabular-nums text-white">
        {value.toLocaleString('pt-BR')}
      </b>{' '}
      {label}
    </>
  )
}

interface ProfileHeaderProps {
  userName: string
  profilePicture?: string | null
  bannerUrl?: string | null
  gamesAmount: number
  totalHoursPlayed: number
  totalPerStatus?: TotalPerStatus[]
  hundredPercentCount?: number
  createdAt?: string | null
  followersCount: number
  followingCount: number
  onFollowersClick: () => void
  onFollowingClick: () => void
  actions?: ReactNode
  /** Contas vinculadas por loja (nomes de exibição). */
  stores?: StoreAccounts
  isOwn?: boolean
}

export function ProfileHeader({
  userName,
  profilePicture,
  bannerUrl,
  gamesAmount,
  totalHoursPlayed,
  totalPerStatus,
  hundredPercentCount,
  createdAt,
  followersCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
  actions,
  stores,
  isOwn = false,
}: ProfileHeaderProps) {
  const memberSince = createdAt ? formatMemberSince(createdAt) : null
  return (
    <header className="overflow-hidden rounded-lg border border-dark-border">
      <div className="relative isolate px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-7">
        <div
          className="absolute inset-0 -z-20 bg-dark-bg-light"
          aria-hidden="true"
        >
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
        {bannerUrl && (
          <div
            className="absolute inset-0 -z-10 bg-dark-bg-darker/15"
            aria-hidden="true"
          />
        )}

        <div className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-3 sm:grid-cols-[auto_1fr_auto] sm:gap-x-6">
          <img
            src={profilePicture || userProfilePictureDefault}
            alt={`Foto de perfil de ${userName}`}
            className="size-[72px] flex-none rounded-full border-[3px] border-dark-bg bg-dark-bg object-cover sm:size-24"
          />

          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="break-words font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {userName}
            </h1>

            {hasStoreAccounts(stores) ? (
              <StoreChips stores={stores} />
            ) : (
              isOwn && (
                <Link
                  to="/configuracoes/importar"
                  className={`inline-flex min-h-11 items-center self-start rounded-sm text-sm text-primary-link underline underline-offset-4 transition-colors hover:text-white ${focusRing}`}
                >
                  Conectar Steam, Xbox ou PlayStation
                </Link>
              )
            )}

            <div className="flex flex-wrap gap-x-[18px] text-sm">
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

          {(actions || memberSince) && (
            <div className="col-span-2 flex flex-col items-start gap-2 sm:col-span-1 sm:items-end">
              {actions && (
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {actions}
                </div>
              )}
              {memberSince && (
                <p className="inline-flex min-h-7 items-center rounded-md border border-dark-border bg-dark-bg-darker/85 px-2 text-sm text-gray-300">
                  Desde {memberSince}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <ProfileStats
        gamesAmount={gamesAmount}
        totalHoursPlayed={totalHoursPlayed}
        totalPerStatus={totalPerStatus}
        hundredPercentCount={hundredPercentCount}
        queueIncludesDropped={isOwn}
      />
    </header>
  )
}
