import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageRejectedError, api } from './useApi'

const signed = {
  cloudName: 'mycloud',
  apiKey: 'key',
  timestamp: 1700000000,
  folder: 'images',
  publicId: 'abc-123',
  allowedFormats: 'jpg,png,webp',
  uploadPreset: 'signed_preset',
  signature: 'sig',
}

const file = new File(['x'], 'a.png', { type: 'image/png' })

afterEach(() => vi.restoreAllMocks())

describe('api.uploadFile', () => {
  it('asks for a signature, then posts exactly the signed fields', async () => {
    const signatureCall = vi
      .spyOn(axios.Axios.prototype, 'request')
      .mockResolvedValue({ data: signed })
    const cloudinary = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { secure_url: 'https://res.cloudinary.com/x.png' },
    })

    await expect(api.uploadFile(file)).resolves.toBe(
      'https://res.cloudinary.com/x.png'
    )

    expect(signatureCall).toHaveBeenCalledTimes(1)
    const [url, body] = cloudinary.mock.calls[0]
    expect(url).toBe('https://api.cloudinary.com/v1_1/mycloud/image/upload')
    const form = body as FormData
    expect([...form.keys()].sort()).toEqual([
      'allowed_formats',
      'api_key',
      'file',
      'folder',
      'public_id',
      'signature',
      'timestamp',
      'upload_preset',
    ])
    expect(form.get('public_id')).toBe('abc-123')
    expect(form.get('upload_preset')).toBe('signed_preset')
  })

  it('turns a Cloudinary 400 into ImageRejectedError', async () => {
    vi.spyOn(axios.Axios.prototype, 'request').mockResolvedValue({
      data: signed,
    })
    vi.spyOn(axios, 'post').mockRejectedValue(
      new axios.AxiosError('bad', '400', undefined, undefined, {
        status: 400,
        data: {},
        statusText: '',
        headers: {},
        config: {} as never,
      })
    )

    await expect(api.uploadFile(file)).rejects.toBeInstanceOf(
      ImageRejectedError
    )
  })

  it('lets a failed signature request through untouched', async () => {
    const failure = new Error('429')
    vi.spyOn(axios.Axios.prototype, 'request').mockRejectedValue(failure)
    const cloudinary = vi.spyOn(axios, 'post')

    await expect(api.uploadFile(file)).rejects.toBe(failure)
    expect(cloudinary).not.toHaveBeenCalled()
  })
})
