import { useId, useRef, useState } from 'react'
import { FaDiscord, FaGoogle } from 'react-icons/fa'
import type { SignInProvider } from '../../hooks/useApi'
import { PROVIDER_LABEL, useProviderLink } from '../../hooks/useProviderLink'
import { useReauth } from '../../hooks/useReauth'
import { fieldFocus, fieldFocusError } from '../../styles/focus'
import { isReauthRequired } from '../../utils/isReauthRequired'
import { Button } from '../button'
import { ConfirmDialog } from '../confirmDialog'

const ICONS = {
  google: (
    <FaGoogle className="size-[18px] text-[#ea4335]" aria-hidden="true" />
  ),
  discord: (
    <FaDiscord className="size-[18px] text-[#5865f2]" aria-hidden="true" />
  ),
}

interface ProviderRowProps {
  provider: SignInProvider
  linked: boolean
  isLastMethod: boolean
  needsPassword: boolean
}

function ProviderRow({
  provider,
  linked,
  isLastMethod,
  needsPassword,
}: ProviderRowProps) {
  const label = PROVIDER_LABEL[provider]
  const [confirming, setConfirming] = useState(false)
  const [password, setPassword] = useState('')
  const passwordId = useId()
  const unlinkButtonRef = useRef<HTMLButtonElement | null>(null)
  const handleReauth = useReauth('/configuracoes/seguranca')
  const {
    startLink,
    isLinking,
    unlink,
    isUnlinking,
    needsReauth,
    errorMessage,
    resetErrors,
  } = useProviderLink(provider)
  const blocked = linked && isLastMethod

  return (
    <li className="flex flex-col gap-2.5 border-t border-dark-border py-3 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-[9px] border border-dark-border bg-dark-bg-light"
            aria-hidden="true"
          >
            {ICONS[provider]}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              <span
                className={`size-2 shrink-0 rounded-full ${linked ? 'bg-green-400' : 'bg-gray-500'}`}
                aria-hidden="true"
              />
              {linked ? 'Conectado' : 'Não conectado'}
            </p>
          </div>
        </div>
        {linked ? (
          <span
            ref={node => {
              unlinkButtonRef.current = node?.querySelector('button') ?? null
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (blocked) return
                resetErrors()
                setConfirming(true)
              }}
              aria-disabled={blocked || undefined}
              className={blocked ? 'cursor-not-allowed opacity-50' : undefined}
              aria-label={`Desvincular o ${label}`}
              aria-describedby={blocked ? `${provider}-last-method` : undefined}
            >
              Desvincular
            </Button>
          </span>
        ) : (
          <span
            ref={node => {
              unlinkButtonRef.current = node?.querySelector('button') ?? null
            }}
          >
            <Button
              type="button"
              variant="primary"
              onClick={() => startLink()}
              loading={isLinking}
              aria-label={`Vincular o ${label}`}
            >
              Vincular
            </Button>
          </span>
        )}
      </div>

      {blocked && (
        <p
          id={`${provider}-last-method`}
          className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-gray-200"
        >
          <span className="font-semibold text-white">
            Este é o seu único jeito de entrar.
          </span>{' '}
          Defina uma senha antes de desvincular o {label}.
        </p>
      )}

      {needsReauth && (
        <div className="flex flex-col gap-2.5 rounded-lg border border-primary-light/30 bg-primary/10 px-3 py-2.5">
          <div>
            <p className="text-sm font-semibold text-white">
              Por segurança, entre de novo para continuar.
            </p>
            <p className="mt-0.5 text-xs text-gray-300">
              Depois você volta para esta página.
            </p>
          </div>
          <div>
            <Button type="button" variant="primary" onClick={handleReauth}>
              Entrar de novo
            </Button>
          </div>
        </div>
      )}

      {errorMessage && !(needsPassword && confirming) && (
        <output className="block text-sm text-red-300">{errorMessage}</output>
      )}

      <ConfirmDialog
        open={confirming}
        onOpenChange={next => {
          if (!next) {
            setPassword('')
            resetErrors()
          }
          setConfirming(next)
        }}
        title={`Desvincular o ${label}?`}
        description={`O ${label} deixa de estar ligado à sua conta e deixa de aparecer aqui como forma de entrar.`}
        confirmLabel="Desvincular"
        isLoading={isUnlinking}
        confirmDisabled={needsPassword && password === ''}
        lockWhileLoading
        returnFocusTo={unlinkButtonRef}
        onConfirm={() => {
          unlink(needsPassword ? password : undefined, {
            onSuccess: () => {
              setPassword('')
              setConfirming(false)
            },
            onError: error => {
              if (!needsPassword || isReauthRequired(error))
                setConfirming(false)
            },
          })
        }}
      >
        {needsPassword && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={passwordId} className="text-sm text-gray-300">
              Digite sua senha para confirmar. Ela vai ser o seu único jeito de
              entrar.
            </label>
            <input
              id={passwordId}
              type="password"
              value={password}
              onChange={event => {
                setPassword(event.target.value)
                if (errorMessage) resetErrors()
              }}
              autoComplete="current-password"
              disabled={isUnlinking}
              aria-invalid={errorMessage ? true : undefined}
              className={`bg-dark-bg-darker text-white rounded-lg block w-full text-sm py-3 px-3 border ${
                errorMessage
                  ? `border-red-400 ${fieldFocusError}`
                  : `border-dark-border ${fieldFocus}`
              } transition-colors duration-150`}
            />
            {errorMessage && (
              <output className="text-[13px] leading-snug text-red-400">
                {errorMessage}
              </output>
            )}
          </div>
        )}
      </ConfirmDialog>
    </li>
  )
}

export function ProviderSection({
  hasPassword,
  googleLinked,
  discordLinked,
}: {
  hasPassword: boolean
  googleLinked: boolean
  discordLinked: boolean
}) {
  const methods =
    (hasPassword ? 1 : 0) + (googleLinked ? 1 : 0) + (discordLinked ? 1 : 0)
  const isLastMethod = methods <= 1

  return (
    <section
      aria-labelledby="providers-title"
      className="flex flex-col gap-3.5 rounded-xl border border-dark-border bg-dark-bg-darker p-5"
    >
      <div>
        <h2 id="providers-title" className="text-base font-semibold text-white">
          Entrar com
        </h2>
        <p className="mt-0.5 text-sm text-gray-400">
          Além do e-mail e senha, você pode entrar com estas contas.
        </p>
      </div>
      <ul className="flex flex-col">
        <ProviderRow
          provider="google"
          linked={googleLinked}
          isLastMethod={isLastMethod}
          needsPassword={hasPassword && !discordLinked}
        />
        <ProviderRow
          provider="discord"
          linked={discordLinked}
          isLastMethod={isLastMethod}
          needsPassword={hasPassword && !googleLinked}
        />
      </ul>
    </section>
  )
}
