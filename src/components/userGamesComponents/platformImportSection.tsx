import { UserPlus } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import type { PlatformImport } from '../../hooks/usePlatformImport'
import { fieldFocus, focusRing } from '../../styles/focus'
import { Button } from '../button'
import { ConfirmDialog } from '../confirmDialog'

const POLLING_STATUSES = ['waiting', 'active', 'delayed']

const MULTI_ACCOUNT_NOTE =
  'Horas do mesmo jogo em contas diferentes são somadas.'

interface PlatformAccount {
  id: string
  name: string
}

function StatusLine({
  names,
  isImporting,
  idleText,
}: {
  names: string[]
  isImporting: boolean
  idleText: string
}) {
  if (isImporting) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-300">
        <span
          className="size-2 shrink-0 animate-pulse rounded-full bg-primary-light motion-reduce:animate-none"
          aria-hidden="true"
        />
        Importando
      </span>
    )
  }
  if (names.length === 0) {
    return <span className="block text-xs text-gray-400">{idleText}</span>
  }
  return (
    <span className="block break-words text-xs text-green-400">
      {names.join(' · ')}
    </span>
  )
}

interface PlatformImportSectionProps<TResult> {
  icon: ReactNode
  label: string
  /** Frase curta que aparece sob o nome enquanto a loja não está conectada. */
  tagline: string
  masculine?: boolean
  connectedId: string | null
  connectedName?: string | null
  accounts?: PlatformAccount[]
  maxAccounts?: number
  inputPlaceholder?: string
  inputValidation?: { pattern: RegExp; message: string }
  connectLabel?: string
  verificationHint?: string
  disconnectedDescription: string
  importState: PlatformImport<TResult>
}

export function PlatformImportSection<TResult>({
  icon,
  label,
  tagline,
  masculine = false,
  connectedId,
  connectedName = null,
  accounts,
  maxAccounts = 1,
  inputPlaceholder,
  inputValidation,
  connectLabel,
  verificationHint,
  disconnectedDescription,
  importState,
}: PlatformImportSectionProps<TResult>) {
  const article = masculine ? 'o' : 'a'
  const {
    status,
    connect,
    isConnecting,
    redirectsAway,
    requestVerification,
    isRequestingVerification,
    disconnect,
    isDisconnecting,
  } = importState

  const [profileInput, setProfileInput] = useState('')
  const [verificationCode, setVerificationCode] = useState<string | null>(null)
  const [addingAccount, setAddingAccount] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [disconnectTarget, setDisconnectTarget] =
    useState<PlatformAccount | null>(null)
  const disconnectTriggerRef = useRef<HTMLElement | null>(null)
  const isImporting = POLLING_STATUSES.includes(status?.status ?? '')

  useEffect(() => {
    if (connectOpen || addingAccount) inputRef.current?.focus()
  }, [connectOpen, addingAccount])

  async function handleConnect() {
    if (redirectsAway) {
      await connect()
      return
    }
    if (!profileInput.trim()) return
    if (!requestVerification) {
      await connect(profileInput.trim())
      setProfileInput('')
      setAddingAccount(false)
      setConnectOpen(false)
      return
    }
    const { code } = await requestVerification(profileInput.trim())
    setVerificationCode(code)
  }

  async function handleVerify() {
    await connect()
    setVerificationCode(null)
    setProfileInput('')
    setAddingAccount(false)
    setConnectOpen(false)
  }

  function handleCancelAdding() {
    setAddingAccount(false)
    setConnectOpen(false)
    setVerificationCode(null)
    setProfileInput('')
  }

  function handleCancelVerification() {
    setVerificationCode(null)
  }

  const wantsNewAccount = addingAccount || (!connectedId && connectOpen)
  const needsInput = wantsNewAccount && !redirectsAway
  const inputHintId = useId()
  const trimmedInput = profileInput.trim()
  const isInputInvalid =
    needsInput &&
    trimmedInput !== '' &&
    inputValidation !== undefined &&
    !inputValidation.pattern.test(trimmedInput)
  const isAwaitingVerification = wantsNewAccount && verificationCode !== null
  const isConnectBusy = isConnecting || isRequestingVerification

  const accountList = accounts ?? []
  const hasAccountList = accounts !== undefined
  const canAddAccount = hasAccountList && accountList.length < maxAccounts
  const isAtAccountLimit = hasAccountList && maxAccounts > 1 && !canAddAccount

  async function handleDisconnect() {
    await disconnect(disconnectTarget?.id)
    setDisconnectTarget(null)
  }

  const primaryButtonProps = {
    type: 'button' as const,
    variant: 'primary' as const,
    size: 'md' as const,
    className: 'text-sm [@media(max-width:480px)]:w-full',
  }

  const primaryAction =
    !connectedId && redirectsAway ? (
      <Button
        {...primaryButtonProps}
        onClick={handleConnect}
        loading={isConnectBusy}
        disabled={isConnectBusy}
      >
        {connectLabel ?? 'Conectar'}
      </Button>
    ) : !connectedId && !connectOpen ? (
      <Button {...primaryButtonProps} onClick={() => setConnectOpen(true)}>
        Conectar
      </Button>
    ) : null

  const accountNames =
    accountList.length > 0
      ? accountList.map(account => account.name)
      : connectedId
        ? [connectedName ?? connectedId]
        : []

  function askDisconnectOf(
    account: PlatformAccount,
    trigger: HTMLElement | null
  ) {
    disconnectTriggerRef.current = trigger
    setDisconnectTarget(account)
  }

  const disconnectButtonClass =
    'border-red-400/30 text-red-300 hover:bg-red-400/10 hover:text-red-200'

  const canOfferAddAccount =
    Boolean(connectedId) && canAddAccount && maxAccounts > 1 && !addingAccount

  return (
    <li className="flex flex-col gap-3.5 border-t border-dark-border px-4 py-4 first:border-t-0 sm:px-5">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-3">
        <span className="relative shrink-0" aria-hidden="true">
          {icon}
          {connectedId && (
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-dark-bg-darker bg-green-400" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-tight text-white">
            {label}
          </h3>
          <StatusLine
            names={accountNames}
            isImporting={isImporting}
            idleText={tagline}
          />
          {canOfferAddAccount && (
            <button
              type="button"
              disabled={isConnectBusy || isImporting}
              onClick={() =>
                redirectsAway ? handleConnect() : setAddingAccount(true)
              }
              className={`mt-1 inline-flex min-h-7 items-center gap-1.5 rounded-sm text-[13px] text-gray-400 transition-colors hover:text-white disabled:opacity-50 ${focusRing}`}
            >
              <UserPlus className="size-3.5" aria-hidden="true" />
              Adicionar outra conta
            </button>
          )}
          {isAtAccountLimit && (
            <p className="mt-1.5 text-xs text-gray-500">
              Limite de {maxAccounts} contas {label}.
            </p>
          )}
        </div>
        {primaryAction && (
          <div className="[@media(max-width:480px)]:order-last [@media(max-width:480px)]:basis-full">
            {primaryAction}
          </div>
        )}
        {connectedId && accountList.length <= 1 && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            className={`text-sm [@media(max-width:480px)]:w-full ${disconnectButtonClass}`}
            disabled={isImporting}
            onClick={event =>
              askDisconnectOf(
                accountList[0] ?? { id: '', name: label },
                event.currentTarget
              )
            }
          >
            Desconectar
          </Button>
        )}
      </div>

      {connectedId && accountList.length > 1 && (
        <>
          <ul className="flex flex-col rounded-lg border border-dark-border">
            {accountList.map(account => (
              <li
                key={account.id}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-dark-border px-3 py-2 first:border-t-0"
              >
                <span className="min-w-0 break-words text-[13.5px] font-medium text-white">
                  {account.name}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className={disconnectButtonClass}
                  disabled={isImporting}
                  aria-label={`Desconectar ${account.name}`}
                  onClick={event =>
                    askDisconnectOf(account, event.currentTarget)
                  }
                >
                  Desconectar
                </Button>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-gray-400">
            {MULTI_ACCOUNT_NOTE}
          </p>
        </>
      )}

      {!connectedId && wantsNewAccount && needsInput && (
        <p className="text-xs leading-relaxed text-gray-400">
          {disconnectedDescription}
        </p>
      )}

      {wantsNewAccount && (needsInput || addingAccount) && (
        <div className="flex items-center gap-2 [@media(max-width:480px)]:flex-col [@media(max-width:480px)]:items-stretch">
          {needsInput && (
            <input
              ref={inputRef}
              type="text"
              placeholder={inputPlaceholder}
              aria-label={inputPlaceholder}
              value={profileInput}
              onChange={e => setProfileInput(e.target.value)}
              maxLength={64}
              aria-invalid={isInputInvalid || undefined}
              aria-describedby={isInputInvalid ? inputHintId : undefined}
              disabled={isConnectBusy || isAwaitingVerification}
              className={`bg-dark-bg text-white placeholder-gray-500 rounded-lg block w-full text-sm [@media(max-width:639px)]:text-base py-2.5 px-3 border border-dark-border ${fieldFocus} transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed`}
            />
          )}
          {!isAwaitingVerification && (
            <Button
              type="button"
              variant="primary"
              size="md"
              className="px-3 py-1.5 text-sm shrink-0"
              onClick={handleConnect}
              disabled={
                (needsInput && (!trimmedInput || isInputInvalid)) ||
                isConnectBusy
              }
              loading={isConnectBusy}
            >
              {redirectsAway
                ? (connectLabel ?? `Entrar com ${article} ${label}`)
                : 'Conectar'}
            </Button>
          )}
          {(addingAccount || connectOpen) && !isAwaitingVerification && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="px-3 py-1.5 text-sm shrink-0"
              onClick={handleCancelAdding}
              disabled={isConnectBusy}
            >
              Cancelar
            </Button>
          )}
        </div>
      )}

      {isInputInvalid && (
        <p id={inputHintId} className="text-xs text-red-300">
          {inputValidation?.message}
        </p>
      )}

      {isAwaitingVerification && (
        <div className="flex flex-col gap-2.5 rounded-lg bg-primary/10 p-3">
          <p className="text-xs leading-relaxed text-gray-300">
            {verificationHint}
          </p>
          <code className="select-all self-start rounded-md border border-dark-border bg-dark-bg px-3 py-1.5 text-lg tracking-wider text-white">
            {verificationCode}
          </code>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="px-3 py-1.5 font-medium"
              onClick={handleVerify}
              disabled={isConnecting}
              loading={isConnecting}
            >
              Verificar
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="px-3 py-1.5 font-medium"
              onClick={handleCancelVerification}
              disabled={isConnecting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={disconnectTarget !== null}
        onOpenChange={open => !open && setDisconnectTarget(null)}
        title={`Desconectar ${disconnectTarget?.name ?? label}`}
        description={
          hasAccountList && maxAccounts > 1
            ? `A conta ${disconnectTarget?.name} será desvinculada e as horas dela saem dos jogos. Conclusões e status continuam, e os jogos já importados ficam na sua biblioteca.`
            : `Sua conta ${label} será desvinculada. Os jogos já importados continuam na sua biblioteca.`
        }
        confirmLabel="Desconectar"
        onConfirm={handleDisconnect}
        isLoading={isDisconnecting}
        returnFocusTo={disconnectTriggerRef}
      />
    </li>
  )
}
