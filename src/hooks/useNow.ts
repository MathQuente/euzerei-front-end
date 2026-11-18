import { useSyncExternalStore } from 'react'

/**
 * Relógio compartilhado de 1 s. O `now` é guardado uma vez por tick: o
 * `getSnapshot` de cada assinante só lê esse valor guardado (nunca chama
 * `Date.now()` enquanto há assinantes), então duas leituras seguidas dão o
 * mesmo resultado e o React não reclama de snapshot instável. O intervalo só
 * existe enquanto há assinantes; ao voltar para a aba, o valor é atualizado
 * na hora (navegadores atrasam timers em abas de fundo).
 */
const TICK_MS = 1000

let storedNow = Date.now()
let timer: ReturnType<typeof setInterval> | undefined
const listeners = new Set<() => void>()

function refresh() {
  storedNow = Date.now()
  for (const listener of listeners) listener()
}

function onVisibility() {
  if (document.visibilityState === 'visible') refresh()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    storedNow = Date.now()
    timer = setInterval(refresh, TICK_MS)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', refresh)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      clearInterval(timer)
      timer = undefined
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', refresh)
    }
  }
}

function currentNow() {
  // Sem assinantes o valor guardado pode estar velho. Só nesse caso relê o
  // relógio, e no máximo uma vez por segundo, para que duas leituras seguidas
  // (o React confere o snapshot duas vezes) devolvam o mesmo valor.
  if (timer === undefined && Date.now() - storedNow > TICK_MS) {
    storedNow = Date.now()
  }
  return storedNow
}

/**
 * Assina o relógio e re-renderiza só quando o valor derivado muda. O
 * `selector` deve ser puro e devolver um primitivo (string ou número).
 */
export function useNowSelector<T extends string | number>(
  selector: (now: number) => T
): T {
  return useSyncExternalStore(subscribe, () => selector(currentNow()))
}
