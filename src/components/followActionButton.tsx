import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useFollow } from '../hooks/useFollow'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { FollowToggleButton } from './followToggleButton'

const CELEBRATE_MS = 900

export function FollowActionButton({ userId }: { userId: string }) {
  const { user } = useAuth()
  const { isFollowing, isLoading, follow, unfollow, isMutating } =
    useFollow(userId)
  const reducedMotion = usePrefersReducedMotion()
  const [celebrating, setCelebrating] = useState(false)
  const previous = useRef<{ userId: string; following: boolean } | null>(null)

  // Só celebra a passada de "não segue" para "segue", nunca ao abrir um perfil
  // que já era seguido.
  useEffect(() => {
    if (isLoading) return
    const before =
      previous.current?.userId === userId ? previous.current.following : null
    const justFollowed = before === false && isFollowing
    previous.current = { userId, following: isFollowing }
    if (!justFollowed || reducedMotion) return
    setCelebrating(true)
    const timer = setTimeout(() => setCelebrating(false), CELEBRATE_MS)
    return () => {
      clearTimeout(timer)
      setCelebrating(false)
    }
  }, [isFollowing, isLoading, reducedMotion, userId])

  if (!user?.id || user.id === userId || isLoading) return null

  return (
    <FollowToggleButton
      following={isFollowing}
      busy={isMutating}
      onToggle={() => (isFollowing ? unfollow() : follow())}
      className={celebrating ? 'follow-pop border-primary-light/60' : ''}
    >
      {celebrating && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <span className="follow-ring" />
        </span>
      )}
    </FollowToggleButton>
  )
}
