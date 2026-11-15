import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { isCanonicalReplace } from './useCanonicalGameUrl'

function isEditing(el: Element | null) {
  return (
    el instanceof HTMLElement &&
    (el.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
  )
}

function focusTarget(el: HTMLElement) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

function focusMainHeading(allowMainFallback: boolean) {
  const h1 = document.querySelector<HTMLElement>('main h1')
  if (h1) {
    focusTarget(h1)
    return true
  }
  if (!allowMainFallback) return false
  const main = document.querySelector<HTMLElement>('main')
  if (!main) return false
  focusTarget(main)
  return true
}

export function useFocusOnRouteChange() {
  const { pathname, state } = useLocation()
  const navigationType = useNavigationType()

  // biome-ignore lint/correctness/useExhaustiveDependencies: só a troca de pathname refoca; state e navigationType são lidos na hora e, como dependências, refocariam ao mudar só ?page= depois de um replace canônico
  useEffect(() => {
    if (isCanonicalReplace(navigationType, state)) return
    let retry = 0
    const first = requestAnimationFrame(() => {
      if (isEditing(document.activeElement)) return
      if (!focusMainHeading(false)) {
        retry = window.setTimeout(() => {
          if (!isEditing(document.activeElement)) focusMainHeading(true)
        }, 400)
      }
    })
    return () => {
      cancelAnimationFrame(first)
      clearTimeout(retry)
    }
  }, [pathname])
}
