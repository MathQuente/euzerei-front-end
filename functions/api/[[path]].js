const DEFAULT_API_ORIGIN = 'https://euzerei-api.onrender.com'

const CLIENT_FORWARDING_HEADERS = [
  'host',
  'forwarded',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-forwarded-port',
  'x-real-ip',
  'true-client-ip',
  'x-client-ip'
]

function badRequest() {
  return new Response('Bad request', { status: 400 })
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const base = new URL(env.API_ORIGIN ?? DEFAULT_API_ORIGIN)

  const path = url.pathname.replace(/^\/api/, '') || '/'
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return badRequest()
  }

  const target = new URL(base)
  target.pathname = path
  target.search = url.search
  if (target.origin !== base.origin) return badRequest()

  const clientIp = request.headers.get('cf-connecting-ip')
  if (!clientIp) return badRequest()

  const headers = new Headers(request.headers)
  for (const name of CLIENT_FORWARDING_HEADERS) headers.delete(name)
  headers.set('x-forwarded-for', clientIp)
  headers.set('x-real-ip', clientIp)

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'

  return fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: 'manual'
  })
}
