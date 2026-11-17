import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import userProfilePictureDefault from '../../assets/Default_pfp.svg.png'
import { focusRing } from '../../styles/focus'
import type { TotalPerStatus } from '../../types/games'
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
  followersCount: number
  followingCount: number
  onFollowersClick: () => void
  onFollowingClick: () => void
  actions?: ReactNode
  /** Contas vinculadas por loja; só usado no perfil próprio. */
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
  followersCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
  actions,
  stores,
  isOwn = false,
}: ProfileHeaderProps) {
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

            {isOwn &&
              (hasStoreAccounts(stores) ? (
                <StoreChips stores={stores} />
              ) : (
                <Link
                  to="/configuracoes/importar"
                  className={`inline-flex min-h-11 items-center self-start rounded-sm text-sm text-primary-link underline underline-offset-4 transition-colors hover:text-white ${focusRing}`}
                >
                  Conectar Steam, Xbox ou PlayStation
                </Link>
              ))}

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

          {actions && (
            <div className="col-span-2 flex flex-wrap items-start gap-2 sm:col-span-1 sm:justify-end">
              {actions}
            </div>
          )}
        </div>
      </div>

      <ProfileStats
        gamesAmount={gamesAmount}
        totalHoursPlayed={totalHoursPlayed}
        totalPerStatus={totalPerStatus}
        queueIncludesDropped={isOwn}
      />
    </header>
  )
}
