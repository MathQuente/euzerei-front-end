import { useEffect } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import { AppToastContainer } from './components/appToastContainer'
import { EmailVerificationNotice } from './components/emailVerificationNotice'
import { Footer } from './components/footer'
import { SideBar } from './components/sideBar'
import { GameModalProvider } from './contexts/gameModal/gameModalProvider'
import { isCanonicalReplace } from './hooks/useCanonicalGameUrl'
import { useFocusOnRouteChange } from './hooks/useFocusOnRouteChange'
import { parsePage } from './utils/parsePage'

export function Layout() {
  useFocusOnRouteChange()
  const { pathname, hash, search, state } = useLocation()
  const navigationType = useNavigationType()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(search)
    const raw = params.get('page')
    if (raw === null) return

    const page = parsePage(raw)
    if (String(page) === raw) return

    if (page === 1) params.delete('page')
    else params.set('page', String(page))
    const next = params.toString()
    navigate({ search: next ? `?${next}` : '' }, { replace: true })
  }, [search, navigate])

  // biome-ignore lint/correctness/useExhaustiveDependencies: só a troca de pathname rola ao topo; hash e navigationType são lidos na hora e, como dependências, rolariam também ao mudar só ?page= ou o hash
  useEffect(() => {
    if (
      navigationType !== 'POP' &&
      !hash &&
      !isCanonicalReplace(navigationType, state)
    )
      window.scrollTo(0, 0)
  }, [pathname])

  // Clicar num link para a página em que já se está não navega e, portanto, não
  // rola: o React Router só troca o histórico. Aqui devolvemos o feedback.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const anchor = (event.target as Element | null)?.closest?.('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.target && anchor.target !== '_self') return
      const url = new URL(anchor.href, window.location.href)
      if (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        !url.hash
      ) {
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'auto'
            : 'smooth',
        })
      }
    }
    // Captura: roda antes do Link do React Router, que chama preventDefault no clique.
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return (
    <GameModalProvider>
      <div className="flex flex-col min-h-screen bg-dark-bg mx-auto w-full max-w-[1920px] overflow-x-clip px-4 sm:px-6 lg:px-10 2xl:px-16 pt-4 pb-8">
        <SideBar />
        <EmailVerificationNotice />
        <main className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </main>
        <Footer />
        <AppToastContainer />
      </div>
    </GameModalProvider>
  )
}
