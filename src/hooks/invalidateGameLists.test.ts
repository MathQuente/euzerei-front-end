import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  RELEASE_REFRESH_DELAY_MS,
  refreshAfterRelease,
} from './invalidateGameLists'

describe('refreshAfterRelease', () => {
  let queryClient: QueryClient
  let unsubscribe: Array<() => void>
  let fetched: Record<string, number>

  function observe(key: string) {
    fetched[key] = 0
    const observer = new QueryObserver(queryClient, {
      queryKey: [key],
      queryFn: async () => {
        fetched[key] += 1
        return key
      },
      staleTime: Number.POSITIVE_INFINITY,
    })
    unsubscribe.push(observer.subscribe(() => {}))
  }

  beforeEach(() => {
    vi.useFakeTimers()
    queryClient = new QueryClient()
    unsubscribe = []
    fetched = {}
  })

  afterEach(() => {
    for (const stop of unsubscribe) stop()
    queryClient.clear()
    vi.useRealTimers()
  })

  it('refetches the home list and the coming soon page right away, then once more', async () => {
    observe('comingSoon')
    observe('gamesFeatured')
    await vi.advanceTimersByTimeAsync(0)
    expect(fetched).toEqual({ comingSoon: 1, gamesFeatured: 1 })

    refreshAfterRelease(queryClient)
    await vi.advanceTimersByTimeAsync(0)
    expect(fetched).toEqual({ comingSoon: 2, gamesFeatured: 2 })

    await vi.advanceTimersByTimeAsync(RELEASE_REFRESH_DELAY_MS - 1)
    expect(fetched).toEqual({ comingSoon: 2, gamesFeatured: 2 })

    await vi.advanceTimersByTimeAsync(1)
    expect(fetched).toEqual({ comingSoon: 3, gamesFeatured: 3 })
  })

  it('fetches nothing when no list is on screen', async () => {
    const fetcher = vi.fn().mockResolvedValue('x')
    await queryClient.prefetchQuery({
      queryKey: ['gamesFeatured'],
      queryFn: fetcher,
      staleTime: Number.POSITIVE_INFINITY,
    })
    fetcher.mockClear()

    refreshAfterRelease(queryClient)
    await vi.advanceTimersByTimeAsync(RELEASE_REFRESH_DELAY_MS + 1)

    expect(fetcher).not.toHaveBeenCalled()
  })

  it('does not start a second request while one is already running', async () => {
    let resolve: (value: string) => void = () => {}
    let calls = 0
    const observer = new QueryObserver(queryClient, {
      queryKey: ['gamesFeatured'],
      queryFn: () => {
        calls += 1
        return new Promise<string>(done => {
          resolve = done
        })
      },
    })
    unsubscribe.push(observer.subscribe(() => {}))
    await vi.advanceTimersByTimeAsync(0)
    expect(calls).toBe(1)

    refreshAfterRelease(queryClient)
    refreshAfterRelease(queryClient)
    await vi.advanceTimersByTimeAsync(0)

    expect(calls).toBe(1)
    resolve('done')
  })

  it('schedules a single retry for many rows and forces a new request when one is stuck', async () => {
    let calls = 0
    const observer = new QueryObserver(queryClient, {
      queryKey: ['gamesFeatured'],
      queryFn: () => {
        calls += 1
        // a 2ª busca (a do zero do relógio) fica pendurada
        return calls === 2
          ? new Promise<string>(() => {})
          : Promise.resolve('x')
      },
    })
    unsubscribe.push(observer.subscribe(() => {}))
    await vi.advanceTimersByTimeAsync(0)
    expect(calls).toBe(1)

    for (let i = 0; i < 10; i++) refreshAfterRelease(queryClient)
    await vi.advanceTimersByTimeAsync(0)
    expect(calls).toBe(2)
    expect(vi.getTimerCount()).toBe(1)

    await vi.advanceTimersByTimeAsync(RELEASE_REFRESH_DELAY_MS)
    expect(calls).toBe(3)
  })
})
