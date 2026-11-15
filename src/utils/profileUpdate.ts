export interface ProfileUpdate {
  userName?: string
  profilePicture?: File
  userBanner?: File | null
}

interface ProfileValues {
  userName?: string
  profilePicture?: File | null
  userBanner?: File | null
}

export function buildProfileUpdate(
  values: ProfileValues,
  originalUserName: string,
  removeBanner: boolean
): ProfileUpdate {
  const update: ProfileUpdate = {}

  if (values.userName && values.userName !== originalUserName) {
    update.userName = values.userName
  }
  if (values.profilePicture) {
    update.profilePicture = values.profilePicture
  }
  if (values.userBanner) {
    update.userBanner = values.userBanner
  } else if (removeBanner) {
    update.userBanner = null
  }

  return update
}
