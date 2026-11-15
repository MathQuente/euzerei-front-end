import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const toastMock = vi.hoisted(() => {
  const fn = {
    success: vi.fn((..._args: unknown[]) => 'id-success'),
    error: vi.fn((..._args: unknown[]) => 'id-error'),
    info: vi.fn((..._args: unknown[]) => 'id-info'),
    isActive: vi.fn(() => false),
    update: vi.fn(),
  }
  return fn
})

vi.mock('react-toastify', () => ({ toast: toastMock }))

import { notify } from './notify'

beforeEach(() => {
  vi.clearAllMocks()
  toastMock.isActive.mockReturnValue(false)
})

describe('notify', () => {
  it('shows success and info as polite status messages', () => {
    notify.success('Nota removida.')
    notify.info('Sua sessão terminou. Entre de novo.')
    expect(toastMock.success).toHaveBeenCalledWith('Nota removida.', {
      role: 'status',
    })
    expect(toastMock.info).toHaveBeenCalledWith(
      'Sua sessão terminou. Entre de novo.',
      { role: 'status' }
    )
  })

  it('shows errors as alerts', () => {
    notify.error('Algo deu errado. Tente de novo.')
    expect(toastMock.error).toHaveBeenCalledWith(
      'Algo deu errado. Tente de novo.',
      { role: 'alert' }
    )
  })

  it('passes the custom time and id to the toast', () => {
    notify.success('Marcado.', { id: 'undo', autoClose: 10_000 })
    expect(toastMock.success).toHaveBeenCalledWith('Marcado.', {
      toastId: 'undo',
      role: 'status',
      autoClose: 10_000,
    })
  })

  it('updates the visible toast instead of stacking a new one with the same id', () => {
    toastMock.isActive.mockReturnValue(true)
    notify.success('Nota removida.', { id: 'rating-feedback' })
    expect(toastMock.success).not.toHaveBeenCalled()
    expect(toastMock.update).toHaveBeenCalledWith('rating-feedback', {
      render: 'Nota removida.',
      type: 'success',
      role: 'status',
    })
  })

  it('creates the toast with the id when none is visible', () => {
    notify.error('Não foi possível entrar.', { id: 'login-error' })
    expect(toastMock.update).not.toHaveBeenCalled()
    expect(toastMock.error).toHaveBeenCalledWith('Não foi possível entrar.', {
      toastId: 'login-error',
      role: 'alert',
    })
  })

  it('uses the fallback text when the error carries no server message', () => {
    notify.failure(
      new Error('boom'),
      'Não foi possível salvar a nota. Tente de novo.'
    )
    expect(toastMock.error).toHaveBeenCalledWith(
      'Não foi possível salvar a nota. Tente de novo.',
      { role: 'alert' }
    )
  })

  it('does not pass undefined options, so the container defaults apply', () => {
    notify.error('Algo deu errado. Tente de novo.')
    const options = toastMock.error.mock.calls[0][1] as object
    expect(Object.keys(options)).toEqual(['role'])
  })
})

describe('notify live region', () => {
  function stubPage(rootHidden: string | null) {
    const regions = {
      'notify-live-polite': { textContent: '' },
      'notify-live-assertive': { textContent: '' },
    }
    vi.stubGlobal('document', {
      querySelector: (selector: string) =>
        selector === '.Toastify'
          ? { closest: () => (rootHidden === 'true' ? {} : null) }
          : null,
      getElementById: (id: string) =>
        regions[id as keyof typeof regions] ?? null,
    })
    vi.stubGlobal('window', {
      setTimeout: (callback: () => void) => {
        callback()
        return 0
      },
    })
    return regions
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('repeats a text message in the polite region while a dialog hides the toast container', () => {
    const regions = stubPage('true')
    notify.success('Status atualizado.')
    expect(regions['notify-live-polite'].textContent).toBe('Status atualizado.')
    expect(regions['notify-live-assertive'].textContent).toBe('')
  })

  it('repeats errors in the assertive region', () => {
    const regions = stubPage('true')
    notify.error('Algo deu errado. Tente de novo.')
    expect(regions['notify-live-assertive'].textContent).toBe(
      'Algo deu errado. Tente de novo.'
    )
  })

  it('stays silent when the toast container is not hidden, because the toast is already announced', () => {
    const regions = stubPage(null)
    notify.success('Status atualizado.')
    expect(regions['notify-live-polite'].textContent).toBe('')
  })

  it('does not repeat a message when the caller already announces it', () => {
    const regions = stubPage('true')
    notify.success('Marcado como Jogado.', { announce: false })
    notify.error('Não foi possível dispensar a sugestão.', { announce: false })
    expect(regions['notify-live-polite'].textContent).toBe('')
    expect(regions['notify-live-assertive'].textContent).toBe('')
  })

  it('ignores content that is not plain text', () => {
    const regions = stubPage('true')
    notify.success(() => null)
    expect(regions['notify-live-polite'].textContent).toBe('')
  })
})
