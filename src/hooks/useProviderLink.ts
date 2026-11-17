import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { getErrorMessage } from '../utils/getErrorMessage'
import { isReauthRequired } from '../utils/isReauthRequired'
import { notify } from '../utils/notify'
import { type SignInProvider, api } from './useApi'

export const PROVIDER_LABEL: Record<SignInProvider, string> = {
  google: 'Google',
  discord: 'Discord',
}

export function useProviderLink(provider: SignInProvider) {
  const queryClient = useQueryClient()
  const label = PROVIDER_LABEL[provider]

  const link = useMutation({
    mutationFn: () => api.startProviderLink(provider),
  })

  const resetLink = link.reset
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) resetLink()
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [resetLink])

  const unlink = useMutation({
    mutationFn: (currentPassword?: string) =>
      api.unlinkProvider(provider, currentPassword),
    onSuccess: async () => {
      notify.success(SUCCESS_MESSAGES.providerUnlinked(label))
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
  })

  const needsReauth =
    isReauthRequired(link.error) || isReauthRequired(unlink.error)

  return {
    startLink: link.mutate,
    isLinking: link.isPending,
    unlink: unlink.mutate,
    isUnlinking: unlink.isPending,
    needsReauth,
    errorMessage:
      !needsReauth && (link.isError || unlink.isError)
        ? getErrorMessage(
            link.error ?? unlink.error,
            link.isError
              ? ERROR_MESSAGES.linkProvider(label)
              : ERROR_MESSAGES.unlinkProvider(label)
          )
        : null,
    resetErrors: () => {
      link.reset()
      unlink.reset()
    },
  }
}
