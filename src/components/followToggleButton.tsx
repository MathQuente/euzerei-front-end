import { UserCheck, UserPlus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './button'

// Mesma célula de grade para os rótulos: a largura é a do maior deles, então
// nada pula quando o botão troca de estado ou de rótulo.
const label =
  'col-start-1 row-start-1 inline-flex items-center justify-center whitespace-nowrap transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none'

const hoverOnly = '[@media(hover:hover)]'

/**
 * Botão de seguir de quatro estados visuais: "Seguir", "Seguindo" (roxo
 * suave), "Deixar de seguir" (vermelho, ao passar o mouse ou focar com o
 * teclado) e ocupado. Quem usa só informa se já segue e o que fazer ao clicar.
 */
export function FollowToggleButton({
  following,
  busy = false,
  onToggle,
  followLabel = 'Seguir',
  size = 'sm',
  className = '',
  ariaLabel,
  children,
}: {
  following: boolean
  busy?: boolean
  onToggle: () => void
  followLabel?: string
  size?: 'sm' | 'md'
  className?: string
  ariaLabel?: string
  /** Fica ao lado do botão (efeito de celebração, por exemplo). */
  children?: ReactNode
}) {
  return (
    <span className="relative inline-flex rounded">
      <Button
        type="button"
        variant="secondary"
        size={size}
        aria-busy={busy || undefined}
        aria-label={
          ariaLabel ?? (following ? 'Seguindo. Deixar de seguir' : undefined)
        }
        onClick={() => {
          if (!busy) onToggle()
        }}
        className={`group transition-[background-color,border-color,color,transform] duration-300 motion-reduce:transition-none ${
          following
            ? 'border-primary-light/40 bg-primary/15 text-primary-link hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 focus-visible:border-red-400/40 focus-visible:bg-red-400/10 focus-visible:text-red-300'
            : 'border-transparent bg-primary font-bold text-white hover:bg-primary-hover hover:text-white'
        } ${busy ? 'cursor-progress' : ''} ${className}`}
      >
        <span className="grid">
          <span
            aria-hidden={following}
            className={`${label} ${following ? '-translate-y-1 scale-95 opacity-0' : 'opacity-100'}`}
          >
            <UserPlus className="mr-1.5 size-4" aria-hidden="true" />
            {followLabel}
          </span>
          <span
            aria-hidden={!following}
            className={`${label} ${
              following
                ? `opacity-100 ${hoverOnly}:group-hover:-translate-y-1 ${hoverOnly}:group-hover:scale-95 ${hoverOnly}:group-hover:opacity-0 group-focus-visible:-translate-y-1 group-focus-visible:scale-95 group-focus-visible:opacity-0`
                : 'translate-y-1 scale-95 opacity-0'
            }`}
          >
            <UserCheck className="mr-1.5 size-4" aria-hidden="true" />
            Seguindo
          </span>
          <span
            aria-hidden="true"
            className={`${label} translate-y-1 scale-95 opacity-0 ${
              following
                ? `${hoverOnly}:group-hover:translate-y-0 ${hoverOnly}:group-hover:scale-100 ${hoverOnly}:group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100`
                : ''
            }`}
          >
            Deixar de seguir
          </span>
        </span>
      </Button>
      {children}
    </span>
  )
}
