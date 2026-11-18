/** Saudação do período do dia, pelo relógio do aparelho. */
export function periodGreeting(hour: number) {
  if (hour >= 5 && hour < 12) return 'Bom dia'
  if (hour >= 12 && hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export type StatusLine =
  | { kind: 'both'; playing: number; backlog: number }
  | { kind: 'playing'; playing: number }
  | { kind: 'idle' }
  | null

/**
 * A segunda frase da saudação, só com o que a biblioteca já sabe. Sem jogo em
 * andamento nem fila (só zerados ou desejos) não há o que dizer.
 */
export function statusLine(playing: number, backlog: number): StatusLine {
  if (playing > 0 && backlog > 0) return { kind: 'both', playing, backlog }
  if (playing > 0) return { kind: 'playing', playing }
  if (backlog > 0) return { kind: 'idle' }
  return null
}
