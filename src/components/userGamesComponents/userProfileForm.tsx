import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import userProfilePictureDefault from '../../assets/Default_pfp.svg.png'
import { useUserProfile } from '../../hooks/useUserProfile'
import { updateProfileSchema } from '../../schemas/profileSchema'
import { fieldFocus, focusRing, focusRingWithin } from '../../styles/focus'
import { buildProfileUpdate } from '../../utils/profileUpdate'
import { Button, buttonClasses } from '../button'
import { SettingsCardHeader, settingsCardClass } from '../settingsCard'

type ProfileForm = z.infer<typeof updateProfileSchema>

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/gif'
const bannerButton =
  'border-gray-600 bg-dark-bg-lighter text-white shadow-md shadow-black/50 hover:bg-dark-border'

const removeBannerButton =
  'w-[34px] border-red-400/50 bg-dark-bg-lighter px-0 text-red-300 shadow-md shadow-black/50 hover:bg-red-950 hover:text-red-200 max-sm:w-11'

const fileButton = `${buttonClasses({ variant: 'secondary', className: bannerButton })} cursor-pointer gap-1.5 ${focusRingWithin}`

export function UserProfileForm({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [profilePicturePreview, setProfilePicturePreview] = useState('')
  const [userBannerPreview, setUserBannerPreview] = useState('')
  const [shouldRemoveBanner, setShouldRemoveBanner] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const [originalValues, setOriginalValues] = useState({
    userName: '',
    profilePicture: '',
    userBanner: '',
  })

  const { UserProfileResponse, updateUserProfile, isUpdatingProfile } =
    useUserProfile({
      onUpdateSuccess: () => resetEdits(),
      removeUserBanner: shouldRemoveBanner,
    })

  const {
    register: registerField,
    setValue,
    getValues,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(updateProfileSchema),
  })

  const watchedUserName = watch('userName')
  const originalNameRef = useRef('')

  useEffect(() => {
    if (UserProfileResponse?.user) {
      const serverName = UserProfileResponse.user.userName || ''
      const typed = getValues('userName')
      if (!typed || typed === originalNameRef.current) {
        setValue('userName', serverName)
      }
      originalNameRef.current = serverName
      setOriginalValues({
        userName: UserProfileResponse.user.userName || '',
        profilePicture: UserProfileResponse.user.profilePicture || '',
        userBanner: UserProfileResponse.user.userBanner || '',
      })
    }
  }, [UserProfileResponse?.user, setValue, getValues])

  useEffect(() => {
    if (!UserProfileResponse?.user) return
    const hasUserNameChanged =
      (watchedUserName || '') !== originalValues.userName
    setHasChanges(
      hasUserNameChanged ||
        !!profilePicturePreview ||
        !!userBannerPreview ||
        shouldRemoveBanner
    )
  }, [
    watchedUserName,
    profilePicturePreview,
    userBannerPreview,
    shouldRemoveBanner,
    originalValues,
    UserProfileResponse?.user,
  ])

  useEffect(() => {
    onDirtyChange?.(hasChanges)
  }, [hasChanges, onDirtyChange])

  useEffect(() => {
    return () => {
      if (userBannerPreview.startsWith('blob:')) {
        URL.revokeObjectURL(userBannerPreview)
      }
    }
  }, [userBannerPreview])

  useEffect(() => {
    return () => {
      if (profilePicturePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicturePreview)
      }
    }
  }, [profilePicturePreview])

  function resetEdits() {
    setProfilePicturePreview('')
    setUserBannerPreview('')
    setShouldRemoveBanner(false)
    setValue('profilePicture', undefined)
    setValue('userBanner', undefined)
  }

  async function onSubmit(data: FieldValues) {
    if (!hasChanges) return
    const updateData = buildProfileUpdate(
      data,
      originalValues.userName,
      shouldRemoveBanner
    )
    if (Object.keys(updateData).length > 0) updateUserProfile(updateData)
  }

  const handleBannerChange = (e: FieldValues) => {
    const file = e.target.files?.[0]
    if (file) {
      setUserBannerPreview(URL.createObjectURL(file))
      setShouldRemoveBanner(false)
    }
  }

  const handleRemoveBanner = () => {
    if (userBannerPreview) {
      setUserBannerPreview('')
      setValue('userBanner', undefined)
      return
    }
    setShouldRemoveBanner(true)
  }

  const handleDiscard = () => {
    resetEdits()
    setValue('userName', UserProfileResponse?.user?.userName || '')
  }

  const bannerSrc =
    userBannerPreview ||
    (!shouldRemoveBanner ? UserProfileResponse?.user?.userBanner : undefined)

  const profilePicSrc =
    profilePicturePreview ||
    UserProfileResponse?.user?.profilePicture ||
    userProfilePictureDefault

  const showRemoveBanner =
    (Boolean(UserProfileResponse?.user?.userBanner) && !shouldRemoveBanner) ||
    Boolean(userBannerPreview)

  const previewName = (watchedUserName ?? '').trim() || originalValues.userName
  const nameLength = (watchedUserName ?? '').length

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-labelledby="perfil-publico-titulo"
      className={settingsCardClass}
    >
      <SettingsCardHeader
        id="perfil-publico-titulo"
        title="Seu perfil público"
        description="Como as outras pessoas veem você. O nome muda aqui em tempo real, do jeito que ficará no perfil."
      />

      <div className="mx-4 overflow-hidden rounded-[10px] border border-dark-border bg-dark-bg sm:mx-5">
        <div className="relative h-36 bg-dark-border sm:h-40">
          {bannerSrc && (
            <img
              src={bannerSrc}
              alt="Banner"
              className="size-full object-cover"
            />
          )}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.16) 62%, rgba(0,0,0,0) 100%)',
            }}
            aria-hidden="true"
          />
          <p
            aria-hidden="true"
            className="absolute bottom-3 left-[6.5rem] right-4 break-words font-display text-2xl font-extrabold leading-tight tracking-tight text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.85),0_0_10px_rgb(0_0_0/0.55)] sm:left-[8.5rem] sm:text-[1.75rem]"
          >
            {previewName}
          </p>
          <div className="absolute right-3 top-3 flex gap-2">
            <label className={fileButton}>
              <Camera className="size-4" aria-hidden="true" />
              Trocar banner
              <input
                type="file"
                accept={IMAGE_ACCEPT}
                className="sr-only"
                {...registerField('userBanner', {
                  onChange: handleBannerChange,
                })}
              />
            </label>
            {showRemoveBanner && (
              <button
                type="button"
                onClick={handleRemoveBanner}
                aria-label="Remover banner"
                className={`${buttonClasses({ variant: 'secondary', className: removeBannerButton })} ${focusRing}`}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="flex h-11 px-4 sm:px-5">
          <div className="relative -mt-12 size-20 shrink-0 sm:size-[92px]">
            <img
              src={profilePicSrc}
              alt="Foto de perfil"
              className="size-full rounded-full border-4 border-dark-bg bg-dark-bg object-cover"
            />
            <label
              className={`absolute -bottom-0.5 -right-1 grid size-9 cursor-pointer place-items-center rounded-full border border-dark-border bg-dark-bg-light text-gray-200 hover:text-white [@media(max-width:639px)]:size-11 ${focusRingWithin}`}
              title="Trocar foto de perfil"
            >
              <Camera className="size-4" aria-hidden="true" />
              <span className="sr-only">Trocar foto de perfil</span>
              <input
                type="file"
                accept={IMAGE_ACCEPT}
                className="sr-only"
                {...registerField('profilePicture', {
                  onChange: e => {
                    const file = e.target.files?.[0]
                    if (file)
                      setProfilePicturePreview(URL.createObjectURL(file))
                  },
                })}
              />
            </label>
          </div>
        </div>
        <p className="px-4 pb-3 text-xs text-gray-500 sm:px-5">
          Banner e foto: PNG, JPEG ou GIF, até 3 MB.
        </p>
      </div>

      <div className="flex flex-col gap-3.5 px-4 pb-4 pt-4 sm:px-5">
        {errors.profilePicture && (
          <output className="block text-xs text-red-300">
            Foto de perfil: {errors.profilePicture.message}
          </output>
        )}
        {errors.userBanner && (
          <output className="block text-xs text-red-300">
            Banner: {errors.userBanner.message}
          </output>
        )}

        <div>
          <label
            htmlFor="userName"
            className="mb-1.5 block text-sm text-gray-400"
          >
            Nome de usuário
          </label>
          <input
            id="userName"
            type="text"
            aria-invalid={errors.userName ? true : undefined}
            aria-describedby="userName-hint"
            className={`block min-h-11 w-full rounded-lg border bg-dark-bg px-3 text-sm [@media(max-width:639px)]:text-base text-white placeholder-gray-500 transition-colors duration-150 ${
              errors.userName ? 'border-red-400' : 'border-dark-border'
            } ${fieldFocus}`}
            {...registerField('userName')}
          />
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <p
              id="userName-hint"
              className={`text-xs ${errors.userName ? 'text-red-300' : 'text-gray-400'}`}
            >
              {errors.userName?.message ??
                '1 a 30 caracteres. Fica do jeito que você digitar.'}
            </p>
            <span
              className="shrink-0 font-display text-xs tabular-nums text-gray-500"
              aria-hidden="true"
            >
              {nameLength}/30
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2.5 border-t border-dark-border px-4 py-3 sm:px-5 [@media(max-width:639px)]:[&>button]:flex-1">
        <Button
          type="button"
          variant="secondary"
          onClick={handleDiscard}
          disabled={!hasChanges || isUpdatingProfile}
        >
          Descartar
        </Button>
        <Button
          variant="primary"
          loading={isUpdatingProfile}
          disabled={!hasChanges || isUpdatingProfile}
        >
          Salvar
        </Button>
      </div>
    </form>
  )
}
