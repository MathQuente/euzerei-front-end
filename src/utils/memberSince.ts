const monthYear = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: 'numeric',
})

export function formatMemberSince(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return monthYear.format(date)
}
