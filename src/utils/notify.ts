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
  announce?: boolean
}

const LIVE_REGION_IDS = {
  polite: 'notify-live-polite',
  assertive: 'notify-live-assertive',
} as const

function ensureLiveRegions() {
  if (typeof document === 'undefined') return
  for (const [politeness, id] of Object.entries(LIVE_REGION_IDS)) {
    if (document.getElementById(id)) continue
    const region = document.createElement('div')
    region.id = id
    region.className = 'sr-only'
    region.setAttribute('aria-live', politeness)
    region.setAttribute('aria-atomic', 'true')
    document.body.appendChild(region)
  }
}

ensureLiveRegions()

function announceWhenPageIsHidden(kind: Kind, content: ToastContent) {
  if (typeof content !== 'string' || typeof document === 'undefined') return
  const container = document.querySelector('.Toastify')
  if (!container?.closest('[aria-hidden="true"]')) return
  ensureLiveRegions()
  const region = document.getElementById(
    kind === 'error' ? LIVE_REGION_IDS.assertive : LIVE_REGION_IDS.polite
  )
  if (!region) return
  region.textContent = ''
  window.setTimeout(() => {
    region.textContent = content
  }, 50)
}

function show(kind: Kind, content: ToastContent, options: NotifyOptions = {}) {
  const { id, autoClose, announce = true } = options
  if (announce) announceWhenPageIsHidden(kind, content)
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
