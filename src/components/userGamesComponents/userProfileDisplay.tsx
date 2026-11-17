import { Settings, UserMinus, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFollow } from '../../hooks/useFollow'
import { useFollowers } from '../../hooks/useFollowers'
import { useFollowing } from '../../hooks/useFollowing'
import { useUserProfile } from '../../hooks/useUserProfile'
import type { FollowSummary } from '../../types/follow'
import type { TotalPerStatus } from '../../types/games'
import { buttonClasses } from '../button'
import { IconButton } from '../iconButton'
import { ProfileHeader } from '../libraryComponents/profileHeader'
import { UserListModal } from '../userListModal'

export function UserProfileDisplay({
  totalPerStatus,
  onStatsRetry,
}: {
  totalPerStatus?: TotalPerStatus[]
  onStatsRetry?: () => unknown
}) {
  const [followersModalOpen, setFollowersModalOpen] = useState(false)
  const [followingModalOpen, setFollowingModalOpen] = useState(false)
  const { UserProfileResponse, isLoading, isError } = useUserProfile()
  const userId = UserProfileResponse?.user.id
  const { followers } = useFollowers(userId)
  const { following } = useFollowing(userId)
  const followingIds = new Set(following.map(u => u.id))

  if (isLoading) {
    return (
      <div className="h-[28rem] w-full animate-pulse rounded-lg bg-dark-bg-light sm:h-72" />
    )
  }

  if (isError || !UserProfileResponse) {
    return (
      <div className="w-full rounded-lg border border-dark-border bg-dark-bg-light px-6 py-4">
        <p className="text-red-400 text-sm">Erro ao carregar perfil.</p>
      </div>
    )
  }

  const { user: profileUser } = UserProfileResponse

  return (
    <>
      <ProfileHeader
        userName={profileUser.userName}
        profilePicture={profileUser.profilePicture}
        bannerUrl={profileUser.userBanner}
        gamesAmount={profileUser.gamesAmount}
        totalHoursPlayed={profileUser.totalHoursPlayed}
        totalPerStatus={totalPerStatus}
        onStatsRetry={onStatsRetry}
        hundredPercentCount={profileUser.hundredPercentCount}
        createdAt={profileUser.createdAt}
        achievementStats={profileUser.achievementStats}
        isOwn
        stores={{
          steam: (profileUser.steamAccounts ?? []).map(a => a.personaName),
          playstation: (profileUser.psnAccounts ?? []).map(a => a.onlineId),
          xbox: (profileUser.xboxAccounts ?? []).map(a => a.gamertag),
        }}
        followersCount={profileUser.followersCount}
        followingCount={profileUser.followingCount}
        onFollowersClick={() => setFollowersModalOpen(true)}
        onFollowingClick={() => setFollowingModalOpen(true)}
        actions={
          <Link
            to="/configuracoes"
            className={buttonClasses({
              variant: 'secondary',
              className: 'gap-1.5 bg-dark-bg-darker/85',
            })}
          >
            <Settings className="size-4" aria-hidden="true" />
            Configurações
          </Link>
        }
      />

      <UserListModal
        open={followersModalOpen}
        onOpenChange={setFollowersModalOpen}
        title="Seguidores"
        users={followers}
        renderAction={user =>
          !followingIds.has(user.id) ? <FollowBackButton user={user} /> : null
        }
      />

      <UserListModal
        open={followingModalOpen}
        onOpenChange={setFollowingModalOpen}
        title="Seguindo"
        users={following}
        renderAction={user => <UnfollowButton userId={user.id} />}
      />
    </>
  )
}

function FollowBackButton({ user }: { user: FollowSummary }) {
  const { follow, isMutating } = useFollow(user.id)

  return (
    <IconButton
      variant="bare"
      onClick={() => follow()}
      disabled={isMutating}
      title="Seguir de volta"
      aria-label={`Seguir ${user.userName ?? 'usuário'} de volta`}
      className="rounded-full"
    >
      <UserPlus className="size-3.5" aria-hidden="true" />
    </IconButton>
  )
}

function UnfollowButton({ userId }: { userId: string }) {
  const { unfollow, isMutating } = useFollow(userId)

  return (
    <IconButton
      variant="bare"
      tone="danger"
      onClick={() => unfollow()}
      disabled={isMutating}
      title="Deixar de seguir"
      aria-label="Deixar de seguir"
      className="rounded-full"
    >
      <UserMinus className="size-3.5" aria-hidden="true" />
    </IconButton>
  )
}
