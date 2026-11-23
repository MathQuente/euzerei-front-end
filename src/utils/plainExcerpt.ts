const MAX_LENGTH = 280

export function plainExcerpt(markdown: string): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/(\*\*|\*|~~)(?=\S)([^*~]*?\S)\1/g, '$2')
    .replace(/(^|\W)(__|_)(\S[^_]*?\S|\S)\2(?=\W|$)/g, '$1$3')
    .replace(/\s+/g, ' ')
    .trim()

  return plain.length > MAX_LENGTH
    ? `${plain.slice(0, MAX_LENGTH).trimEnd()}…`
    : plain
}
