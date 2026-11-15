import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import type { ImportStatusResponse } from '../types/import'
import { notify } from '../utils/notify'
import { invalidateUserGames } from './invalidateUserGames'
import { useAuth } from './useAuth'

const POLLING_STATUSES = ['waiting', 'active', 'delayed']

export interface PlatformImportConfig<TResult> {
  key: string
  label: string
  getStatus: () => Promise<ImportStatusResponse<TResult>>
  connect: (input: string) => Promise<unknown>
  redirectsAway?: boolean
  requestVerification?: (input: string) => Promise<{ code: string }>
  disconnect: (accountId?: string) => Promise<unknown>
  startImport: () => Promise<unknown>
}

export const usePlatformImport = <TResult>(
  config: PlatformImportConfig<TResult>
) => {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()

  const queryKey = [`${config.key}ImportStatus`, userId]

  const {
    data: status,
    isLoading,
    refetch,
  } = useQuery<ImportStatusResponse<TResult>>({
    queryKey,
    queryFn: () => config.getStatus(),
    enabled: Boolean(userId),
    refetchInterval: query =>
      POLLING_STATUSES.includes(query.state.data?.status ?? '') ? 1000 : false,
    refetchIntervalInBackground: true,
  })

  const connect = useMutation({
    mutationFn: (input: string) => config.connect(input),
    onSuccess: () => {
      if (config.redirectsAway) return
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      notify.success(SUCCESS_MESSAGES.platformConnected(config.label))
    },
    onError: error => {
      notify.failure(error, ERROR_MESSAGES.connectPlatform(config.label))
    },
  })

  const requestVerification = useMutation({
    mutationFn: (input: string) => {
      if (!config.requestVerification) {
        throw new Error('This platform has no verification step')
      }
      return config.requestVerification(input)
    },
    onError: error => {
      notify.failure(error, ERROR_MESSAGES.connectPlatform(config.label))
    },
  })

  const disconnect = useMutation({
    mutationFn: (accountId?: string) => config.disconnect(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      invalidateUserGames(queryClient, userId)
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['gamePlatforms', userId] })
      queryClient.invalidateQueries({ queryKey: ['gameHours', userId] })
      queryClient.invalidateQueries({ queryKey: ['gameStats', userId] })
      queryClient.invalidateQueries({ queryKey })
      notify.success(SUCCESS_MESSAGES.platformDisconnected(config.label))
    },
    onError: error => {
      notify.failure(error, ERROR_MESSAGES.disconnectPlatform(config.label))
    },
  })

  const startImport = useMutation({
    mutationFn: () => config.startImport(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
    onError: error => {
      notify.failure(error, ERROR_MESSAGES.startImport)
    },
  })

  const refreshAfterImport = () => {
    invalidateUserGames(queryClient, userId)
    queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
    queryClient.invalidateQueries({ queryKey: ['games'] })
    queryClient.invalidateQueries({ queryKey: ['gamePlatforms', userId] })
    queryClient.invalidateQueries({
      queryKey: ['completionSuggestions', userId],
    })
  }

  return {
    status,
    isLoadingStatus: isLoading,
    refetchStatus: () => refetch().then(result => result.data),
    connect: (input = '') => connect.mutateAsync(input),
    isConnecting: connect.isPending,
    redirectsAway: Boolean(config.redirectsAway),
    requestVerification: config.requestVerification
      ? (input: string) => requestVerification.mutateAsync(input)
      : undefined,
    isRequestingVerification: requestVerification.isPending,
    disconnect: (accountId?: string) => disconnect.mutateAsync(accountId),
    isDisconnecting: disconnect.isPending,
    startImport: () => startImport.mutateAsync(),
    isStarting: startImport.isPending,
    refreshAfterImport,
  }
}

export type PlatformImport<TResult> = ReturnType<
  typeof usePlatformImport<TResult>
>
