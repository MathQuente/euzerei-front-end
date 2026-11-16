import { isAxiosError } from 'axios'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/button'
import { api } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { focusRing } from '../styles/focus'
import { getErrorMessage } from '../utils/getErrorMessage'

type Status = 'ready' | 'success' | 'invalid' | 'taken'

const primaryLinkClass = `inline-flex w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-base font-bold text-white transition-colors duration-200 hover:bg-primary-light active:scale-[0.98] sm:w-auto ${focusRing}`

export function ConfirmEmailChangePage() {
  useDocumentTitle('Confirmar novo e-mail')
  const [searchParams, setSearchParams] = useSearchParams()
  const [token] = useState(() => searchParams.get('token'))
  const [status, setStatus] = useState<Status>(token ? 'ready' : 'invalid')
  const [newEmail, setNewEmail] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { refreshUser } = useAuth()
  const confirming = useRef(false)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const movedFocus = useRef(false)

  useEffect(() => {
    if (!searchParams.has('token')) return
    const next = new URLSearchParams(searchParams)
    next.delete('token')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const confirm = async () => {
    if (!token || confirming.current) return
    confirming.current = true
    movedFocus.current = true
    setIsConfirming(true)
    setErrorMessage(null)

    try {
      const result = await api.confirmEmailChange(token)
      setNewEmail(result.email)
      setStatus('success')
      await refreshUser().catch(() => {})
    } catch (error) {
      const code = isAxiosError(error) ? error.response?.status : undefined
      if (code === 400) setStatus('invalid')
      else if (code === 409) setStatus('taken')
      else {
        setErrorMessage(
          getErrorMessage(
            error,
            'Não foi possível confirmar agora. Tente de novo; se o link não funcionar mais, peça uma nova troca em Configurações > Conta.'
          )
        )
      }
    } finally {
      confirming.current = false
      setIsConfirming(false)
    }
  }

  useEffect(() => {
    if (status !== 'ready' && movedFocus.current) {
      movedFocus.current = false
      titleRef.current?.focus()
    }
  }, [status])

  let title = 'Confirmar o novo e-mail'
  let body: ReactNode =
    'Falta um clique para trocar o e-mail da sua conta no EuZerei.'
  let actions: ReactNode = (
    <Button
      type="button"
      variant="primary"
      size="md"
      loading={isConfirming}
      onClick={confirm}
      className="w-full sm:w-auto"
    >
      Confirmar novo e-mail
    </Button>
  )
  let note: ReactNode = 'O link vale por 24 horas e só pode ser usado uma vez.'

  if (status === 'success') {
    title = 'E-mail alterado.'
    body = (
      <>
        O endereço{' '}
        <span className="break-words font-medium text-white">{newEmail}</span>{' '}
        agora é o e-mail da sua conta. Por segurança, essa conta saiu de todos
        os dispositivos: para entrar de novo, use o novo e-mail.
      </>
    )
    actions = (
      <Link to="/auth?tab=login" className={primaryLinkClass}>
        Entrar
      </Link>
    )
    note = null
  } else if (status === 'taken') {
    title = 'Este e-mail já está em uso.'
    body =
      'Outra conta passou a usar este endereço. Escolha outro em Configurações > Conta.'
    actions = (
      <Link to="/configuracoes/conta" className={primaryLinkClass}>
        Ir para a conta
      </Link>
    )
    note = null
  } else if (status === 'invalid') {
    title = 'Este link não vale mais.'
    body =
      'Ele expirou, já foi usado ou a troca foi cancelada. Peça uma nova troca em Configurações > Conta.'
    actions = (
      <Link to="/configuracoes/conta" className={primaryLinkClass}>
        Ir para a conta
      </Link>
    )
    note = null
  }

  return (
    <div
      aria-live="polite"
      className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center"
    >
      <h1
        ref={titleRef}
        tabIndex={-1}
        className="max-w-full text-balance break-words font-display text-2xl font-extrabold leading-tight tracking-tight text-white outline-none sm:text-4xl"
      >
        {title}
      </h1>

      {body && <p className="max-w-md text-base text-gray-300">{body}</p>}

      {errorMessage && (
        <p className="max-w-md text-sm text-gray-300">{errorMessage}</p>
      )}

      <div className="mt-2 flex w-full flex-col items-center justify-center gap-2 sm:w-auto sm:flex-row">
        {actions}
      </div>

      {note && <p className="text-sm text-gray-400">{note}</p>}
    </div>
  )
}
