import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { userPath } from '../utils/userPath'

/** Leva `/users/<uuid>` (ou handle com outra caixa) para `/users/<handle>`. */
export const useCanonicalUserUrl = (
  user: { id: string; userName?: string | null } | undefined,
  ref: string | undefined
) => {
  const { search, hash } = useLocation()
  const navigate = useNavigate()

  const handle = user?.userName

  useEffect(() => {
    if (!user || !handle || ref === undefined || ref === handle) return
    navigate(
      { pathname: userPath({ id: user.id, userName: handle }), search, hash },
      { replace: true }
    )
  }, [user, handle, ref, search, hash, navigate])
}
