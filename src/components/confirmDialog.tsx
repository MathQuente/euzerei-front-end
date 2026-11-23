import * as Dialog from '@radix-ui/react-dialog'
import { type ReactNode, type RefObject, useRef } from 'react'
import { Button } from './button'

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  isLoading,
  confirmDisabled,
  confirmVariant = 'danger',
  lockWhileLoading,
  returnFocusTo,
  titleIcon,
  titleIconTone = 'danger',
  confirmClassName,
  wide,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  isLoading?: boolean
  confirmDisabled?: boolean
  confirmVariant?: 'danger' | 'primary'
  lockWhileLoading?: boolean
  returnFocusTo?: RefObject<HTMLElement | null>
  titleIcon?: ReactNode
  titleIconTone?: 'danger' | 'primary'
  confirmClassName?: string
  wide?: boolean
  children?: ReactNode
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (lockWhileLoading && isLoading) return
    onOpenChange(next)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/70 inset-0 fixed z-confirm" />
        <Dialog.Content
          ref={contentRef}
          onOpenAutoFocus={event => {
            event.preventDefault()
            const opener = document.activeElement
            returnFocusRef.current =
              opener instanceof HTMLElement && opener !== document.body
                ? opener
                : null
            contentRef.current
              ?.querySelector<HTMLButtonElement>('[data-cancel]')
              ?.focus()
          }}
          onCloseAutoFocus={event => {
            const opener = returnFocusTo?.current ?? returnFocusRef.current
            returnFocusRef.current = null
            if (!opener?.isConnected) return
            event.preventDefault()
            opener.focus({ preventScroll: true })
          }}
          className={`w-[calc(100vw-2rem)] ${wide ? 'max-w-[440px]' : 'max-w-[380px]'} fixed bg-dark-bg-lighter text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg z-confirm-content p-5 flex flex-col gap-4 max-h-[calc(100dvh-2rem)] overflow-y-auto`}
        >
          {titleIcon ? (
            <div className="flex items-start gap-3">
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-[10px] ${titleIconTone === 'primary' ? 'bg-primary/20 text-primary-link' : 'bg-red-400/10 text-red-400'}`}
                aria-hidden="true"
              >
                {titleIcon}
              </span>
              <Dialog.Title className="pt-1.5 text-lg font-semibold leading-tight text-white">
                {title}
              </Dialog.Title>
            </div>
          ) : (
            <Dialog.Title className="text-white font-semibold">
              {title}
            </Dialog.Title>
          )}
          <Dialog.Description asChild>
            <div className="text-sm text-gray-400">{description}</div>
          </Dialog.Description>
          {children}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button
                variant="secondary"
                data-cancel
                disabled={lockWhileLoading && isLoading}
              >
                {cancelLabel}
              </Button>
            </Dialog.Close>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              loading={isLoading}
              disabled={confirmDisabled}
              className={confirmClassName}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
