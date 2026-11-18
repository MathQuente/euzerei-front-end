import { useState } from 'react'
import { prefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useReleaseCountdown } from '../../hooks/useReleaseCountdown'
import {
  type ReleasePrecision,
  countdownSpoken,
  formatCountdown,
  formatReleaseLabel,
} from '../../utils/releaseDate'
import { ConfettiLayer } from '../rouletteComponents/confettiLayer'

/**
 * Data de lançamento com contador nas últimas 24 horas. O confete só sai se o
 * contador chegar a zero com a página aberta, nunca para quem abre depois.
 */
export function ReleaseCountdown({
  releaseDate,
  precision,
}: {
  releaseDate: number
  precision?: ReleasePrecision
}) {
  const [burst, setBurst] = useState(0)
  const countdown = useReleaseCountdown(releaseDate, precision, {
    granularity: 'second',
    onRelease: () => {
      if (!prefersReducedMotion()) setBurst(count => count + 1)
    },
  })

  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
        Lançamento
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center px-2.5 py-1 bg-dark-bg-lighter border border-dark-border rounded-full text-sm text-gray-300">
          {formatReleaseLabel(releaseDate, precision)}
        </span>
        {countdown.kind === 'last-day' && (
          <span
            // biome-ignore lint/a11y/useSemanticElements: role="timer" explícito, não há elemento nativo equivalente (<output> é status, não timer)
            role="timer"
            aria-label={`Faltam ${countdownSpoken(countdown.ms)} para o lançamento`}
            className="inline-flex items-baseline gap-2.5 rounded-xl border border-primary/50 bg-primary/15 px-3.5 py-2"
          >
            <span
              aria-hidden="true"
              className="font-display text-[28px] font-extrabold leading-none tabular-nums text-white"
            >
              {formatCountdown(countdown.ms)}
            </span>
            <span
              aria-hidden="true"
              className="text-[11px] uppercase tracking-wider text-primary-link"
            >
              para lançar
            </span>
          </span>
        )}
        {countdown.kind === 'today' && (
          <span className="inline-flex items-center rounded-xl border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 font-display text-sm font-bold text-amber-400">
            Chegou o dia
          </span>
        )}
      </div>
      {countdown.kind === 'last-day' && (
        <p className="mt-2 text-xs text-gray-400">
          Contagem até 00:00 (horário de Brasília). A loja pode liberar em outro
          horário.
        </p>
      )}
      <ConfettiLayer burst={burst} />
    </div>
  )
}
