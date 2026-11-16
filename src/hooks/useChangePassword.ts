import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { getErrorMessage } from '../utils/getErrorMessage'
import { isReauthRequired } from '../utils/isReauthRequired'
import { notify } from '../utils/notify'
import { api } from './useApi'

export function useChangePassword({
  hadPassword,
  onSuccess,
}: {
  hadPassword: boolean
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: api.changePassword,
    onSuccess: async () => {
      notify.success(
        hadPassword
          ? SUCCESS_MESSAGES.passwordChanged
          : SUCCESS_MESSAGES.passwordSet
      )
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      onSuccess?.()
    },
  })

  const reauth = isReauthRequired(mutation.error)

  return {
    changePassword: mutation.mutate,
    isChanging: mutation.isPending,
    needsReauth: reauth,
    errorMessage:
      mutation.isError && !reauth
        ? getErrorMessage(mutation.error, ERROR_MESSAGES.changePassword)
        : null,
  }
}
