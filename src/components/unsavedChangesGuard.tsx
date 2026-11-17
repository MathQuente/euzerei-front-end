import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'
import { ConfirmDialog } from './confirmDialog'

export function UnsavedChangesGuard({
  dirty,
  description,
}: {
  dirty: boolean
  description: string
}) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      onOpenChange={open => !open && blocker.reset?.()}
      title="Descartar alterações?"
      description={description}
      confirmLabel="Descartar"
      cancelLabel="Continuar editando"
      confirmVariant="primary"
      onConfirm={() => blocker.proceed?.()}
    />
  )
}
