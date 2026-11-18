import type { ReactNode } from 'react'
import { SectionHeading } from './sectionHeading'

/** Casca comum dos cartões das abas de Configurações. */
export const settingsCardClass =
  'overflow-hidden rounded-xl border border-dark-border bg-dark-bg-darker'

export const settingsCardDangerClass =
  'overflow-hidden rounded-xl border border-red-400/30 bg-dark-bg-darker'

/** Cabeçalho padrão: barra, título e descrição, com o mesmo respiro em todas as abas. */
export function SettingsCardHeader({
  id,
  title,
  description,
  tone = 'default',
  action,
}: {
  id: string
  title: string
  description?: ReactNode
  tone?: 'default' | 'danger'
  action?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-start gap-x-4 gap-y-2 px-4 pb-3.5 pt-4 sm:px-5">
      <div className="flex min-w-0 flex-1 basis-60 flex-col gap-1">
        <SectionHeading id={id} tone={tone} className="mb-0">
          {title}
        </SectionHeading>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
      {action}
    </header>
  )
}
