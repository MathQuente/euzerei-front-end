const EXPANDED_GAME = 10

export function parentGameLabel(category: number | undefined) {
  if (category === EXPANDED_GAME) {
    return { heading: 'Outras versões', caption: 'Versão anterior' }
  }
  return { heading: 'Jogo Original', caption: 'Jogo base' }
}
