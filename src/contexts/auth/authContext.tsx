import { createContext } from 'react'
import type { User } from '../../types/user'

export interface SignupError {
  field: 'email' | 'password' | 'acceptedTerms'
  message: string
}

export type AuthContextType = {
  user: Partial<User> | null
  loading: boolean
  /** `null` no sucesso; no erro, a mensagem para mostrar no formulário. */
  login: (email: string, password: string) => Promise<string | null>
  signup: (
    email: string,
    password: string,
    acceptedTerms: boolean
  ) => Promise<SignupError | null>
  confirmRegistration: (token: string) => Promise<void>
  logout: () => void
  clearSession: () => void
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>(null!)
