import { focusRing } from '../../styles/focus'

const linkFocus = `rounded-sm ${focusRing}`

export const sectionTitle =
  'font-display text-lg font-extrabold tracking-tight text-white lg:text-xl'

export const textLink = `whitespace-nowrap text-gray-300 transition-colors hover:text-white ${linkFocus}`

/** Ação dentro de uma linha de texto (estado vazio ou de erro): roxa, sem sublinhado e com área de toque maior que o texto. */
export const inlineAction = `relative whitespace-nowrap rounded-sm text-primary-link transition-colors before:absolute before:-inset-x-1 before:-inset-y-3 before:content-[''] hover:text-white ${focusRing}`

export const coverLink = `block rounded-lg ${focusRing}`

export const rowLink = `-mx-2 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-dark-bg-light active:bg-dark-bg-lighter ${focusRing}`
