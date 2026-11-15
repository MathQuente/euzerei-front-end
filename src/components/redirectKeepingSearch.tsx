import { Navigate, useLocation } from 'react-router-dom'

export function RedirectKeepingSearch({ to }: { to: string }) {
  const { search, hash } = useLocation()
  return <Navigate to={`${to}${search}${hash}`} replace />
}
