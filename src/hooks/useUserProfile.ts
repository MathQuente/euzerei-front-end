import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import type { UpdateUserProfileData, UserProfileResponse } from '../types/user'
import { notify } from '../utils/notify'
import { api } from './useApi'
import { useAuth } from './useAuth'

interface UseUserProfileOptions {
  onUpdateSuccess?: () => void
  removeUserBanner?: boolean
}

export const useUserProfile = (options?: UseUserProfileOptions) => {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()

  const queryKey = ['userProfile', userId]

  const {
    data: UserProfileResponse,
    isLoading,
    isError,
  } = useQuery<UserProfileResponse>({
    queryKey: ['userProfile', userId],
    queryFn: async () => api.me(),
    placeholderData: keepPreviousData,
  })

  const uploadImageIfNeeded = async (
    file: string | File | null | undefined
  ): Promise<string | null> => {
    if (!file) return null

    if (typeof file === 'string') {
      return file
    }

    if (file instanceof File) {
      return await api.uploadFile(file)
    }

    return null
  }

  const updateUserProfile = useMutation({
    mutationFn: async (data: UpdateUserProfileData) => {
      let profilePictureUrl: string | undefined
      let userBannerUrl: string | null | undefined

      if (data.profilePicture) {
        const uploadedUrl = await uploadImageIfNeeded(data.profilePicture)
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl
        }
      }

      if (options?.removeUserBanner) {
        userBannerUrl = null
      } else if (data.userBanner) {
        userBannerUrl = await uploadImageIfNeeded(data.userBanner)
      } else {
        userBannerUrl = undefined
      }

      const updatePayload: {
        userName?: string
        profilePicture?: string
        userBanner?: string | null
      } = {}

      if (data.userName !== undefined) {
        updatePayload.userName = data.userName
      }

      if (profilePictureUrl !== undefined) {
        updatePayload.profilePicture = profilePictureUrl
      }

      if (userBannerUrl !== undefined) {
        updatePayload.userBanner = userBannerUrl
      }

      return api.updateUser({
        userName: data.userName,
        profilePicture: profilePictureUrl,
        userBanner: userBannerUrl,
      })
    },
    onMutate: async newData => {
      await queryClient.cancelQueries({ queryKey })

      const previousProfile =
        queryClient.getQueryData<UserProfileResponse>(queryKey)

      if (newData.userName && previousProfile) {
        queryClient.setQueryData<UserProfileResponse>(queryKey, old => {
          if (!old) return old
          return {
            ...old,
            user: {
              ...old.user,
              userName: newData.userName || old.user.userName,
            },
          }
        })
      }

      return { previousProfile }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      notify.success(SUCCESS_MESSAGES.profileSaved)
      options?.onUpdateSuccess?.()
    },
    onError: (error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKey, context.previousProfile)
      }
      notify.failure(error, ERROR_MESSAGES.saveProfile)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['userProfile', userId],
      })
    },
  })

  return {
    UserProfileResponse,
    isLoading,
    isError,

    updateUserProfile: updateUserProfile.mutate,
    updateUserProfileAsync: updateUserProfile.mutateAsync,
    isUpdatingProfile: updateUserProfile.isPending,
    updateError: updateUserProfile.error,
  }
}
