import { type ToastContent, toast } from 'react-toastify'
import { getErrorMessage } from './getErrorMessage'

type Kind = 'success' | 'error' | 'info'

const ROLE: Record<Kind, 'status' | 'alert'> = {
  success: 'status',
  info: 'status',
  error: 'alert',
}

interface NotifyOptions {
  id?: string
  autoClose?: number
}

function show(kind: Kind, content: ToastContent, options: NotifyOptions = {}) {
  const { id, autoClose } = options
  if (id && toast.isActive(id)) {
    toast.update(id, { render: content, type: kind, role: ROLE[kind] })
    return id
  }
  return toast[kind](content, {
    role: ROLE[kind],
    ...(id !== undefined && { toastId: id }),
    ...(autoClose !== undefined && { autoClose }),
  })
}

export const notify = {
  success: (content: ToastContent, options?: NotifyOptions) =>
    show('success', content, options),
  info: (content: ToastContent, options?: NotifyOptions) =>
    show('info', content, options),
  error: (content: ToastContent, options?: NotifyOptions) =>
    show('error', content, options),
  failure: (error: unknown, fallback: string, options?: NotifyOptions) =>
    show('error', getErrorMessage(error, fallback), options),
}
