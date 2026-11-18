import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

/** Título de seção de cartão: o mesmo em todo o app (jogo, configurações, janelas). */
export function SectionHeading({
  children,
  icon: Icon,
  className,
  id,
  tone = 'default',
}: {
  children: ReactNode
  icon?: LucideIcon
  className?: string
  id?: string
  tone?: 'default' | 'danger'
}) {
  const danger = tone === 'danger'
  return (
    <h2
      id={id}
      className={twMerge(
        'mb-4 flex items-center gap-2.5 text-base font-semibold',
        danger ? 'text-red-300' : 'text-white',
        className
      )}
    >
      <span
        className={`h-4 w-[3px] shrink-0 rounded-sm ${danger ? 'bg-red-400' : 'bg-primary-light'}`}
        aria-hidden="true"
      />
      {Icon && (
        <Icon className="size-4 shrink-0 text-gray-400" aria-hidden="true" />
      )}
      {children}
    </h2>
  )
}
