import * as Dialog from '@radix-ui/react-dialog'
import { Search, X } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { fieldFocus, focusRing } from '../styles/focus'
import type { FollowSummary } from '../types/follow'
import { FollowList } from './followList'

/** A busca só aparece quando a lista é longa o bastante para precisar dela. */
const SEARCH_FROM = 8

function normalize(text: string) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function UserListModal({
  open,
  onOpenChange,
  title,
  subtitle,
  emptyTitle = 'Ninguém por aqui ainda',
  emptyDescription,
  users,
  renderAction,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  emptyTitle?: string
  emptyDescription?: string
  users: FollowSummary[]
  renderAction?: (user: FollowSummary) => ReactNode
}) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const showSearch = users.length >= SEARCH_FROM
  const term = normalize(query.trim())
  const visible =
    showSearch && term
      ? users.filter(user => normalize(user.userName ?? '').includes(term))
      : users

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="follow-modal-overlay fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="follow-modal-content fixed left-1/2 top-1/2 z-50 flex max-h-[80vh] w-[92vw] max-w-[26rem] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-dark-border bg-dark-bg-light shadow-2xl shadow-black/50">
          <div className="flex flex-shrink-0 items-start gap-3 px-5 pb-3.5 pt-4">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Dialog.Title className="flex items-center gap-2.5 text-base font-semibold text-white">
                <span
                  className="h-4 w-[3px] rounded-sm bg-primary-light"
                  aria-hidden="true"
                />
                {title}
                <span className="rounded-full bg-dark-bg-lighter px-2 py-px font-display text-xs font-semibold tabular-nums text-gray-400">
                  {users.length}
                </span>
              </Dialog.Title>
              <Dialog.Description className="text-[13px] text-gray-400">
                {subtitle ?? 'Lista de usuários'}
              </Dialog.Description>
            </div>
            <Dialog.Close
              className={`grid size-8 shrink-0 place-items-center rounded-lg text-gray-500 transition-colors hover:bg-dark-bg-lighter hover:text-white [@media(max-width:639px)]:size-11 ${focusRing}`}
              title="Fechar"
              aria-label="Fechar"
            >
              <X size={18} aria-hidden="true" />
            </Dialog.Close>
          </div>

          {users.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 border-t border-dark-border px-6 pb-8 pt-7 text-center">
              <p className="text-[15px] font-semibold text-white">
                {emptyTitle}
              </p>
              {emptyDescription && (
                <p className="max-w-[30ch] text-[13.5px] text-gray-400">
                  {emptyDescription}
                </p>
              )}
            </div>
          ) : (
            <>
              {showSearch && (
                <div className="flex-shrink-0 px-5 pb-2.5">
                  <label className="sr-only" htmlFor="user-list-search">
                    Buscar por nome
                  </label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500"
                      aria-hidden="true"
                    />
                    <input
                      id="user-list-search"
                      type="search"
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                      placeholder="Buscar por nome"
                      className={`block min-h-10 w-full rounded-lg border border-dark-border bg-dark-bg-darker pl-9 pr-3 text-sm text-white placeholder-gray-500 [@media(max-width:639px)]:text-base ${fieldFocus}`}
                    />
                  </div>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto border-t border-dark-border px-2 py-1.5">
                {visible.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-gray-400">
                    Ninguém com esse nome.
                  </p>
                ) : (
                  <FollowList users={visible} renderAction={renderAction} />
                )}
              </div>
              {showSearch && (
                <p
                  className="flex-shrink-0 border-t border-dark-border px-5 py-2.5 text-xs text-gray-500"
                  aria-live="polite"
                >
                  {term
                    ? `${visible.length} de ${users.length}`
                    : `${users.length} no total`}
                </p>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
