import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { userPath } from '../utils/userPath'

export const PUBLIC_USER_PROFILE_KEY = 'publicUserProfile'

/**
 * Leva `/users/<uuid>` (ou handle com outra caixa) para `/users/<handle>`.
 * O perfil já carregado é copiado para a chave do handle, para a página nova
 * não voltar ao esqueleto nem buscar de novo do zero.
 */
export const useCanonicalUserUrl = (
  profile: { user: { id: string; userName?: string | null } } | undefined,
  ref: string | undefined
) => {
  const { search, hash } = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const user = profile?.user
  const handle = user?.userName

  useEffect(() => {
    if (!profile || !user || !handle || ref === undefined || ref === handle)
      return
    queryClient.setQueryData([PUBLIC_USER_PROFILE_KEY, handle], profile)
    navigate(
      { pathname: userPath({ id: user.id, userName: handle }), search, hash },
      { replace: true }
    )
  }, [profile, user, handle, ref, search, hash, navigate, queryClient])
}
