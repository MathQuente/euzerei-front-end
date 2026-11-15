import { ArrowLeft } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { SettingsTabs } from '../components/settingsTabs'
import { usePlatformLinkResult } from '../hooks/usePlatformLinkResult'
import { focusRing } from '../styles/focus'

export function SettingsPage() {
  usePlatformLinkResult()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-8">
      <Link
        to="/userLibrary"
        className={`inline-flex w-fit items-center gap-1.5 rounded text-sm text-primary-light hover:underline ${focusRing}`}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Minha biblioteca
      </Link>
      <h1 className="text-2xl font-bold text-white">Configurações</h1>
      <SettingsTabs />
      <Outlet />
    </div>
  )
}
