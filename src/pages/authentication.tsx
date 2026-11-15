import * as Tabs from '@radix-ui/react-tabs'
import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { FormLogin } from '../components/formLogin'
import { FormSignUp } from '../components/formSignUp'
import { ERROR_MESSAGES, OAUTH_ERROR_MESSAGES } from '../constants/messages'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { focusRing } from '../styles/focus'
import { notify } from '../utils/notify'

const tabTrigger = `flex-1 py-3 text-sm font-semibold text-gray-400 border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-primary transition-colors duration-150 uppercase tracking-wide ${focusRing}`

const TERMS_REQUIRED_MESSAGE =
  'Ainda não existe conta para esse login. Marque a caixa abaixo e continue com Google ou Discord para criar uma.'

export function Authentication() {
  const { user } = useAuth()
  const [alreadySignedIn] = useState(() => !!user?.id)
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'signUp' ? 'signUp' : 'login'
  useDocumentTitle(tab === 'signUp' ? 'Criar conta' : 'Entrar')
  const oauthError = searchParams.get('error')
  const [termsNotice, setTermsNotice] = useState(false)

  useEffect(() => {
    if (tab === 'login' && !oauthError) setTermsNotice(false)
  }, [tab, oauthError])

  useEffect(() => {
    if (!oauthError) return

    const next = new URLSearchParams(searchParams)
    next.delete('error')

    if (oauthError === 'terms_required') {
      setTermsNotice(true)
      next.set('tab', 'signUp')
    } else {
      notify.error(
        Object.prototype.hasOwnProperty.call(OAUTH_ERROR_MESSAGES, oauthError)
          ? OAUTH_ERROR_MESSAGES[oauthError]
          : ERROR_MESSAGES.signInFailed
      )
    }

    setSearchParams(next, { replace: true })
  }, [oauthError, searchParams, setSearchParams])

  if (alreadySignedIn) return <Navigate to="/" replace />

  function handleTabChange(value: string) {
    setSearchParams(value === 'signUp' ? { tab: 'signUp' } : {}, {
      replace: true,
    })
  }

  return (
    <div className="flex justify-center pt-2 pb-8 md:pt-4 md:pb-12">
      <div className="w-full max-w-md">
        <Tabs.Root value={tab} onValueChange={handleTabChange}>
          <Tabs.List className="flex border-b border-dark-border mb-6">
            <Tabs.Trigger className={tabTrigger} value="login">
              Login
            </Tabs.Trigger>
            <Tabs.Trigger className={tabTrigger} value="signUp">
              Criar conta
            </Tabs.Trigger>
          </Tabs.List>

          <div aria-live="assertive" aria-atomic="true">
            {termsNotice && tab === 'signUp' && (
              <p className="mb-5 rounded-lg border border-red-900 bg-red-950/50 px-3 py-2.5 text-[13px] leading-snug text-red-300">
                {TERMS_REQUIRED_MESSAGE}
              </p>
            )}
          </div>

          <Tabs.Content value="login" tabIndex={-1}>
            <FormLogin />
          </Tabs.Content>
          <Tabs.Content value="signUp" tabIndex={-1}>
            <FormSignUp />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  )
}
