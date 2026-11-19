const DEFAULT_API_ORIGIN = 'https://euzerei-api.onrender.com'

export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const origin = env.API_ORIGIN ?? DEFAULT_API_ORIGIN
  const target = new URL(url.pathname.replace(/^\/api/, '') + url.search, origin)

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.set('x-forwarded-for', request.headers.get('cf-connecting-ip') ?? '')

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'

  return fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: 'manual'
  })
}
