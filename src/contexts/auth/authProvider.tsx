import { isAxiosError } from 'axios'
import { useEffect, useRef, useState } from 'react'
import { ERROR_MESSAGES, INFO_MESSAGES } from '../../constants/messages'
import { SESSION_ENDED_EVENT, api } from '../../hooks/useApi'
import type { User } from '../../types/user'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { notify } from '../../utils/notify'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: JSX.Element }) {
  const [user, setUser] = useState<Partial<User> | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { user: currentUser } = await api.me()
        setUser(currentUser)
        return
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined
        if (status && status < 500) return
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)))
        }
      }
    }
  }

  const refreshUser = async () => {
    if (!userRef.current) return
    await loadUser()
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password)
      const loggedUser = response.user
      setUser(loggedUser)
      await loadUser()
      return null
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined
      return getErrorMessage(
        error,
        status && status < 500
          ? ERROR_MESSAGES.signIn
          : ERROR_MESSAGES.unexpected
      )
    }
  }

  const signup = async (
    email: string,
    password: string,
    acceptedTerms: boolean
  ) => {
    try {
      await api.signup(email, password, acceptedTerms)
      return null
    } catch (error) {
      const termsMessage = isAxiosError(error)
        ? error.response?.data?.error?.acceptedTerms?.[0]
        : undefined
      if (typeof termsMessage === 'string') {
        return { field: 'acceptedTerms' as const, message: termsMessage }
      }
      const isPasswordError =
        isAxiosError(error) &&
        typeof error.response?.data?.error?.password?.[0] === 'string'
      return {
        field: isPasswordError ? ('password' as const) : ('email' as const),
        message: getErrorMessage(
          error,
          'Não foi possível criar a conta. Tente novamente.'
        ),
      }
    }
  }

  const confirmRegistration = async (token: string) => {
    const { user: newUser } = await api.confirmRegistration(token)
    setUser(newUser)
    await loadUser()
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {}
    setUser(null)
  }

  const clearSession = () => setUser(null)

  const checkAuth = async () => {
    setLoading(true)

    try {
      const { user: currentUser } = await api.me()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const userRef = useRef(user)
  userRef.current = user

  useEffect(() => {
    const handleSessionEnded = () => {
      if (!userRef.current) return
      setUser(null)
      notify.info(INFO_MESSAGES.sessionEnded)
    }

    window.addEventListener(SESSION_ENDED_EVENT, handleSessionEnded)
    return () =>
      window.removeEventListener(SESSION_ENDED_EVENT, handleSessionEnded)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: checkAuth roda uma vez ao montar o provider, não a cada render
  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        signup,
        confirmRegistration,
        refreshUser,
        clearSession,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}
