import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { focusRing } from '../styles/focus'

const TABS = [
  { to: '/configuracoes/perfil', label: 'Perfil' },
  { to: '/configuracoes/importar', label: 'Importar jogos' },
  { to: '/configuracoes/conta', label: 'Conta' },
  { to: '/configuracoes/seguranca', label: 'Segurança' },
]

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 shrink-0 items-center whitespace-nowrap border-b-2 px-3 text-sm font-semibold transition-colors duration-150 ${focusRing} ${
    isActive
      ? 'border-primary-light text-white'
      : 'border-transparent text-gray-400 hover:text-white'
  }`

export function SettingsTabs() {
  const navRef = useRef<HTMLElement>(null)
  const [fadeRight, setFadeRight] = useState(false)
  const { pathname } = useLocation()

  // biome-ignore lint/correctness/useExhaustiveDependencies: traz a aba ativa à vista quando a rota muda
  useEffect(() => {
    navRef.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [pathname])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const update = () =>
      setFadeRight(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 1)
    update()
    nav.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(nav)
    for (const child of nav.children) observer.observe(child)
    return () => {
      nav.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="relative">
      <nav
        ref={navRef}
        aria-label="Configurações"
        className="flex gap-0.5 overflow-x-auto shadow-[inset_0_-1px_0_theme(colors.dark-border)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map(tab => (
          <NavLink key={tab.to} to={tab.to} className={tabClass}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-7 bg-gradient-to-l from-dark-bg to-transparent transition-opacity duration-150 ${
          fadeRight ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
