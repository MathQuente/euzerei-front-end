import { isAxiosError } from 'axios'
import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/button'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { focusRing } from '../styles/focus'
import { getErrorMessage } from '../utils/getErrorMessage'
import { safeRedirectPath } from '../utils/safeRedirectPath'

const primaryLinkClass = `inline-flex w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-base font-bold text-white transition-colors duration-200 hover:bg-primary-light active:scale-[0.98] sm:w-auto ${focusRing}`

export function ConfirmRegistrationPage() {
  useDocumentTitle('Concluir cadastro')
  const [searchParams, setSearchParams] = useSearchParams()
  // O token fica na URL até a resposta: recarregar antes de clicar não perde o link.
  const token = searchParams.get('token')
  const [invalid, setInvalid] = useState(!token)
  const [isConfirming, setIsConfirming] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { confirmRegistration } = useAuth()
  const navigate = useNavigate()
  const confirming = useRef(false)

  const confirm = async () => {
    if (!token || confirming.current) return
    confirming.current = true
    setIsConfirming(true)
    setErrorMessage(null)

    try {
      await confirmRegistration(token)
      const redirectTo = safeRedirectPath(
        sessionStorage.getItem('redirectAfterLogin')
      )
      sessionStorage.removeItem('redirectAfterLogin')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        setInvalid(true)
        setSearchParams({}, { replace: true })
        return
      }
      setErrorMessage(
        getErrorMessage(
          error,
          'Não foi possível concluir agora. Tente novamente.'
        )
      )
    } finally {
      confirming.current = false
      setIsConfirming(false)
    }
  }

  return (
    <div
      aria-live="polite"
      className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center"
    >
      <h1 className="max-w-full text-balance break-words font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
        {invalid ? 'Este link não vale mais.' : 'Concluir seu cadastro'}
      </h1>

      <p className="max-w-md text-base text-gray-300">
        {invalid
          ? 'Ele expirou ou já foi usado. Se você já tem conta, entre; senão, faça o cadastro de novo.'
          : 'Falta um clique para criar sua conta no EuZerei.'}
      </p>

      {errorMessage && (
        <p className="max-w-md text-sm text-gray-300">{errorMessage}</p>
      )}

      <div className="mt-2 flex w-full flex-col items-center justify-center gap-2 sm:w-auto sm:flex-row">
        {invalid ? (
          <>
            <Link to="/auth?tab=signUp" className={primaryLinkClass}>
              Criar conta
            </Link>
            <Link
              to="/auth?tab=login"
              className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-base text-gray-300 transition-colors hover:text-white sm:w-auto ${focusRing}`}
            >
              Entrar
            </Link>
          </>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={isConfirming}
            onClick={confirm}
            className="w-full sm:w-auto"
          >
            Criar minha conta
          </Button>
        )}
      </div>

      {!invalid && (
        <p className="text-sm text-gray-400">
          O link vale por 24 horas e só pode ser usado uma vez.
        </p>
      )}
    </div>
  )
}
