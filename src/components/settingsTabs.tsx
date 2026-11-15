import { NavLink } from 'react-router-dom'
import { focusRing } from '../styles/focus'

const TABS = [
  { to: '/configuracoes/perfil', label: 'Perfil' },
  { to: '/configuracoes/importar', label: 'Importar jogos' },
  { to: '/configuracoes/conta', label: 'Conta' },
]

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 shrink-0 items-center whitespace-nowrap border-b-2 px-3.5 text-sm font-semibold transition-colors duration-150 ${focusRing} ${
    isActive
      ? 'border-primary-light text-white'
      : 'border-transparent text-gray-400 hover:text-white'
  }`

export function SettingsTabs() {
  return (
    <nav
      aria-label="Configurações"
      className="flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_theme(colors.dark-border)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map(tab => (
        <NavLink key={tab.to} to={tab.to} className={tabClass}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
