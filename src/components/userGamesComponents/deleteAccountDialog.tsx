import {
  Check,
  Gamepad2,
  Link2,
  Star,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { useId, useState } from 'react'
import { fieldFocus, fieldFocusError } from '../../styles/focus'
import { ConfirmDialog } from '../confirmDialog'

export interface DeleteAccountSummary {
  games: number
  followers: number
  following: number
  accounts: number
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

function consequences(summary: DeleteAccountSummary) {
  return [
    {
      icon: Gamepad2,
      title: plural(summary.games, 'jogo', 'jogos'),
      detail: 'biblioteca, horas e conclusões',
    },
    {
      icon: Star,
      title: 'Resenhas e notas',
      detail: 'e as curtidas delas',
    },
    {
      icon: Users,
      title: `${plural(summary.followers, 'seguidor', 'seguidores')}`,
      detail: `e ${summary.following} seguindo`,
    },
    {
      icon: Link2,
      title: plural(summary.accounts, 'conta vinculada', 'contas vinculadas'),
      detail: 'Steam, Xbox e PlayStation',
    },
  ]
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  confirmationText,
  onConfirm,
  onEdit,
  onReauth,
  isLoading,
  needsReauth,
  errorMessage,
  summary,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  confirmationText: string
  onConfirm: () => void
  onEdit: () => void
  onReauth: () => void
  isLoading: boolean
  needsReauth: boolean
  errorMessage: string | null
  summary: DeleteAccountSummary
}) {
  const [typed, setTyped] = useState('')
  const inputId = useId()
  const hintId = useId()
  const matches = typed.trim() === confirmationText

  const handleOpenChange = (next: boolean) => {
    if (!next) setTyped('')
    onOpenChange(next)
  }

  const handleChange = (value: string) => {
    setTyped(value)
    if (errorMessage) onEdit()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Excluir sua conta?"
      titleIcon={<TriangleAlert className="size-5" />}
      wide
      description={
        <div className="flex flex-col gap-3">
          <p>Isso é imediato e não dá para desfazer. Serão apagados:</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {consequences(summary).map(({ icon: Icon, title, detail }) => (
              <li
                key={detail}
                className="flex min-w-0 items-center gap-2.5 rounded-lg border border-dark-border bg-dark-bg-darker px-2.5 py-2 text-[13px] text-white"
              >
                <Icon
                  className="size-4 shrink-0 text-red-400"
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  {title}
                  <span className="block text-[11.5px] text-gray-400">
                    {detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      }
      confirmLabel={needsReauth ? 'Sair e entrar de novo' : 'Excluir conta'}
      confirmVariant={needsReauth ? 'primary' : 'danger'}
      onConfirm={needsReauth ? onReauth : onConfirm}
      isLoading={needsReauth ? false : isLoading}
      confirmDisabled={needsReauth ? false : !matches}
      lockWhileLoading
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm text-gray-300">
          Para confirmar, digite{' '}
          <strong className="text-white break-all">{confirmationText}</strong>
        </label>
        <div className="relative">
          <input
            id={inputId}
            type="text"
            value={typed}
            onChange={event => handleChange(event.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={isLoading}
            aria-describedby={hintId}
            aria-invalid={errorMessage ? true : undefined}
            className={`bg-dark-bg-darker text-white rounded-lg block w-full text-sm py-3 pl-3 pr-10 border ${
              errorMessage
                ? `border-red-400 ${fieldFocusError}`
                : matches
                  ? `border-green-400 ${fieldFocus}`
                  : `border-dark-border ${fieldFocus}`
            } transition-colors duration-150`}
          />
          {matches && !errorMessage && (
            <Check
              className="pointer-events-none absolute right-3 top-1/2 size-[18px] -translate-y-1/2 text-green-400"
              aria-hidden="true"
            />
          )}
        </div>
        {errorMessage ? (
          <span
            id={hintId}
            aria-live="assertive"
            className="text-[13px] leading-snug text-red-400"
          >
            {errorMessage}
          </span>
        ) : (
          <span id={hintId} className="text-xs text-gray-400">
            O botão só liga quando o texto for idêntico.
          </span>
        )}
      </div>
    </ConfirmDialog>
  )
}
