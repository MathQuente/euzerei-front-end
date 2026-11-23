import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { focusRing } from '../styles/focus'
import type { FollowSummary } from '../types/follow'
import { handleLabel } from '../utils/handleLabel'
import { userPath } from '../utils/userPath'
import AvatarImage from './avatarImage'

export function FollowList({
  users,
  renderAction,
}: {
  users: FollowSummary[]
  renderAction?: (user: FollowSummary) => ReactNode
}) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {users.map(user => (
        <li
          key={user.id}
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.03]"
        >
          <Link
            to={userPath(user)}
            className={`flex min-w-0 flex-1 items-center gap-3 rounded-sm ${focusRing}`}
          >
            <AvatarImage
              src={user.profilePicture}
              alt=""
              className="size-10 shrink-0 rounded-full border border-dark-border object-cover"
            />
            <span className="truncate text-[14.5px] text-gray-100 transition-colors hover:text-primary-link">
              {handleLabel(user.userName)}
            </span>
          </Link>
          {renderAction?.(user)}
        </li>
      ))}
    </ul>
  )
}
