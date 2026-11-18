import type { ImportResultSection } from '../types/import'

export function countNotFound(sections: ImportResultSection[]): number {
  return sections.reduce(
    (total, section) => total + (section.result.notFound?.length ?? 0),
    0
  )
}

export function notFoundMessage(count: number): string | null {
  if (count <= 0) return null
  return count === 1
    ? '1 jogo não foi encontrado e ficou de fora.'
    : `${count} jogos não foram encontrados e ficaram de fora.`
}
