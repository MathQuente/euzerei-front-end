import { Check, CircleAlert, Info, X } from 'lucide-react'
import type { MouseEvent } from 'react'
import { ToastContainer } from 'react-toastify'
import { focusRing } from '../styles/focus'

const TYPE_STYLE = {
  success: {
    border: '!border-l-emerald-400',
    icon: 'text-emerald-400',
    bar: '!bg-emerald-400/70',
  },
  error: {
    border: '!border-l-red-400',
    icon: 'text-red-400',
    bar: '!bg-red-400/70',
  },
  info: {
    border: '!border-l-sky-400',
    icon: 'text-sky-400',
    bar: '!bg-sky-400/70',
  },
  warning: {
    border: '!border-l-amber-400',
    icon: 'text-amber-400',
    bar: '!bg-amber-400/70',
  },
  default: {
    border: '!border-l-primary-light',
    icon: 'text-primary-light',
    bar: '!bg-primary-light/70',
  },
} as const

type StyleKey = keyof typeof TYPE_STYLE

const styleFor = (type?: string) =>
  TYPE_STYLE[(type && type in TYPE_STYLE ? type : 'default') as StyleKey]

function CloseNotice({
  closeToast,
}: {
  closeToast: (event: MouseEvent<HTMLElement>) => void
}) {
  return (
    <button
      type="button"
      aria-label="Fechar aviso"
      onClick={closeToast}
      className={`-m-1.5 ml-1 flex size-8 shrink-0 items-center justify-center self-start rounded-md text-gray-400 hover:text-white ${focusRing}`}
    >
      <X className="size-4" aria-hidden="true" />
    </button>
  )
}

function NoticeIcon({ type }: { type?: string }) {
  const Icon = type === 'success' ? Check : type === 'info' ? Info : CircleAlert
  return (
    <span
      className={`flex size-5 items-center justify-center ${styleFor(type).icon}`}
    >
      <Icon className="size-4" aria-hidden="true" />
    </span>
  )
}

export function AppToastContainer() {
  return (
    <ToastContainer
      theme="dark"
      position="bottom-center"
      autoClose={5000}
      limit={5}
      pauseOnHover
      pauseOnFocusLoss
      closeOnClick={false}
      draggable="touch"
      className="app-toasts sm:[--toastify-toast-width:360px]"
      icon={({ type }) => <NoticeIcon type={type} />}
      closeButton={CloseNotice}
      toastClassName={context =>
        `Toastify__toast Toastify__toast-theme--dark Toastify__toast--${context?.type ?? 'default'} !mb-2.5 !min-h-0 !rounded-lg !border !border-l-[3px] !border-dark-border !bg-dark-bg-light !px-3.5 !py-3 !text-sm !text-gray-100 shadow-lg shadow-black/40 ${styleFor(context?.type).border}`
      }
      bodyClassName="Toastify__toast-body !m-0 !items-start !gap-2.5 !p-0"
      progressClassName={context =>
        `Toastify__progress-bar Toastify__progress-bar--animated Toastify__progress-bar-theme--dark Toastify__progress-bar--${context?.type ?? 'default'} !h-0.5 ${styleFor(context?.type).bar}`
      }
    />
  )
}
