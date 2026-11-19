/** Como o nome de usuário aparece na tela: `@matheusdesousa`. */
export function handleLabel(
  userName: string | null | undefined,
  fallback = 'Usuário'
): string {
  return userName ? `@${userName}` : fallback
}
