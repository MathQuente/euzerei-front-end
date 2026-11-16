import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

export function useReauth(returnPath: string) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return async function reauth() {
    sessionStorage.setItem('redirectAfterLogin', returnPath)
    await logout()
    navigate('/auth?tab=login', { replace: true })
  }
}
