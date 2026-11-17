import { Gem } from 'lucide-react'
import { useId } from 'react'
import { useHundredPercent } from '../hooks/useHundredPercent'
import { focusRing } from '../styles/focus'

export function HundredPercentToggle({ igdbId }: { igdbId: string }) {
  const { hundredPercent, setHundredPercent, isLoading } =
    useHundredPercent(igdbId)
  const descriptionId = useId()

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-dark-bg-lighter min-h-11">
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-sm text-white">
          <Gem className="size-4 text-primary-light" aria-hidden />
          Concluído a 100%
        </span>
        <span id={descriptionId} className="text-xs text-gray-400">
          Todas as conquistas. A importação da Steam marca sozinha quando todas
          estão desbloqueadas.
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={hundredPercent}
        aria-label="Concluído a 100%"
        aria-describedby={descriptionId}
        disabled={isLoading}
        onClick={() => {
          setHundredPercent(!hundredPercent).catch(() => undefined)
        }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${focusRing} ${hundredPercent ? 'bg-primary' : 'bg-dark-border'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform ${hundredPercent ? 'translate-x-5' : ''}`}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
