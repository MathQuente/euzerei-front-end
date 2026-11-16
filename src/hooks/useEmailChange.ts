import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { getErrorMessage } from '../utils/getErrorMessage'
import { isReauthRequired } from '../utils/isReauthRequired'
import { notify } from '../utils/notify'
import { api } from './useApi'

export function useEmailChange({ onRequested }: { onRequested?: () => void }) {
  const queryClient = useQueryClient()
  const refreshProfile = () =>
    queryClient.invalidateQueries({ queryKey: ['userProfile'] })

  const request = useMutation({
    mutationFn: api.requestEmailChange,
    onSuccess: async () => {
      notify.success(SUCCESS_MESSAGES.emailChangeRequested)
      await refreshProfile()
      onRequested?.()
    },
  })

  const resend = useMutation({
    mutationFn: api.resendEmailChange,
    onSuccess: async () => {
      notify.success(SUCCESS_MESSAGES.emailChangeResent)
      await refreshProfile()
    },
    onError: error => {
      notify.failure(error, ERROR_MESSAGES.resendEmailChange)
      refreshProfile()
    },
  })

  const cancel = useMutation({
    mutationFn: api.cancelEmailChange,
    onSuccess: async () => {
      notify.success(SUCCESS_MESSAGES.emailChangeCancelled)
      await refreshProfile()
    },
    onError: error => {
      notify.failure(error, ERROR_MESSAGES.cancelEmailChange)
    },
  })

  const reauth = isReauthRequired(request.error)

  return {
    requestChange: request.mutate,
    isRequesting: request.isPending,
    needsReauth: reauth,
    errorMessage:
      request.isError && !reauth
        ? getErrorMessage(request.error, ERROR_MESSAGES.requestEmailChange)
        : null,
    resetRequest: request.reset,
    resend: resend.mutate,
    isResending: resend.isPending,
    cancel: cancel.mutate,
    isCancelling: cancel.isPending,
  }
}
