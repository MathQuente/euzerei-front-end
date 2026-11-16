import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { SUCCESS_MESSAGES } from '../constants/messages'
import { getErrorMessage } from '../utils/getErrorMessage'
import { isReauthRequired } from '../utils/isReauthRequired'
import { notify } from '../utils/notify'
import { api, setAccountDeletionInProgress } from './useApi'
import { useAuth } from './useAuth'

const FALLBACK_ERROR = 'Não foi possível excluir a conta. Tente novamente.'

export function useDeleteAccount() {
  const { clearSession } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        await api.deleteAccount()
      } catch (error) {
        const alreadyGone =
          isAxiosError(error) &&
          error.response?.status === 404 &&
          typeof error.response.data?.message === 'string'
        if (!alreadyGone) throw error
        setAccountDeletionInProgress(true)
      }
    },
    onSuccess: async () => {
      await queryClient.cancelQueries()
      navigate('/', { replace: true, flushSync: true })
      clearSession()
      queryClient.clear()
      notify.success(SUCCESS_MESSAGES.accountDeleted)
    },
  })

  return {
    deleteAccount: () => mutation.mutate(),
    isDeleting: mutation.isPending,
    needsReauth: isReauthRequired(mutation.error),
    errorMessage: mutation.isError
      ? getErrorMessage(mutation.error, FALLBACK_ERROR)
      : null,
    resetError: mutation.reset,
  }
}
