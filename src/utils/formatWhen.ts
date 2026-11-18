/** "hoje, 05:15" ou "12 nov., 05:15". */
export function formatWhen(timestamp: number) {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const sameDay = date.toDateString() === new Date().toDateString()
  if (sameDay) return `hoje, ${time}`
  const day = date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
  return `${day}, ${time}`
}
