import { isAxiosError } from 'axios'

export function isReauthRequired(error: unknown) {
  return (
    isAxiosError(error) &&
    error.response?.status === 403 &&
    error.response.data?.status === 'reauth_required'
  )
}
