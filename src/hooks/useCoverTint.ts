import { useEffect, useState } from 'react'

export type CoverTint = [string, string]

/** Roxo da marca, usado quando a capa não pode ser lida (sem imagem ou bloqueada por CORS). */
export const FALLBACK_TINT: CoverTint = ['#7a38ca', '#3b1a66']

const SIZE = 24
const cache = new Map<string, CoverTint | null>()

function rgb([r, g, b]: number[]) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

function saturation([r, g, b]: number[]) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return max === 0 ? 0 : (max - min) / max
}

/** Duas cores da capa: a mais viva e a média, para o fundo do destaque. */
function readTint(image: HTMLImageElement): CoverTint | null {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null
  context.drawImage(image, 0, 0, SIZE, SIZE)
  // Lança SecurityError se a imagem veio de outro domínio sem CORS.
  const { data } = context.getImageData(0, 0, SIZE, SIZE)

  const average = [0, 0, 0]
  let vivid: number[] | null = null
  let vividScore = -1
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    const pixel = [data[i], data[i + 1], data[i + 2]]
    const brightness = (pixel[0] + pixel[1] + pixel[2]) / 3
    average[0] += pixel[0]
    average[1] += pixel[1]
    average[2] += pixel[2]
    count += 1
    const score =
      saturation(pixel) * (brightness > 40 && brightness < 230 ? 1 : 0.2)
    if (score > vividScore) {
      vividScore = score
      vivid = pixel
    }
  }
  if (count === 0 || !vivid) return null
  return [rgb(vivid), rgb(average.map(value => value / count))]
}

export function useCoverTint(url: string | null | undefined): CoverTint {
  const [tint, setTint] = useState<CoverTint | null>(
    url ? (cache.get(url) ?? null) : null
  )

  useEffect(() => {
    if (!url) {
      setTint(null)
      return
    }
    if (cache.has(url)) {
      setTint(cache.get(url) ?? null)
      return
    }
    let cancelled = false
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      let result: CoverTint | null = null
      try {
        result = readTint(image)
      } catch {
        result = null
      }
      cache.set(url, result)
      if (!cancelled) setTint(result)
    }
    image.onerror = () => {
      cache.set(url, null)
      if (!cancelled) setTint(null)
    }
    image.src = url
    return () => {
      cancelled = true
    }
  }, [url])

  return tint ?? FALLBACK_TINT
}
