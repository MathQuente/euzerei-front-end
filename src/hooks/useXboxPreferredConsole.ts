import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import type { XboxPreferredConsole } from '../types/user'
import { notify } from '../utils/notify'
import { api } from './useApi'
import { useAuth } from './useAuth'

export const useXboxPreferredConsole = () => {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      accountId,
      preferredConsole,
    }: {
      accountId: string
      preferredConsole: XboxPreferredConsole | null
    }) => api.updateXboxPreferredConsole(accountId, preferredConsole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      notify.success(SUCCESS_MESSAGES.xboxConsoleSaved)
    },
    onError: error => {
      notify.failure(error, ERROR_MESSAGES.saveXboxConsole)
    },
  })

  return { update: mutation.mutate, isUpdating: mutation.isPending }
}
