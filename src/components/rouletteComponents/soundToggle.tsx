import { Volume2, VolumeX } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { focusRing } from '../../styles/focus'
import {
  isSoundEnabled,
  setSoundEnabled,
  subscribeSound,
} from '../../utils/rouletteAudio'

export function SoundToggle() {
  const enabled = useSyncExternalStore(
    subscribeSound,
    isSoundEnabled,
    () => true
  )
  const Icon = enabled ? Volume2 : VolumeX

  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label="Som da roleta"
      title={enabled ? 'Silenciar a roleta' : 'Ligar o som da roleta'}
      onClick={() => setSoundEnabled(!enabled)}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-dark-bg-light hover:text-white ${focusRing}`}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  )
}
