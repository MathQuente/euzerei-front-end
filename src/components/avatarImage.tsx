import { useEffect, useState, type ImgHTMLAttributes } from 'react'
import userProfilePictureDefault from '../assets/Default_pfp.svg.png'

type AvatarImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null
}

/**
 * Foto de perfil que nunca aparece quebrada. A imagem padrão fica na tela até a foto do provedor (Google, Discord)
 * provar que carrega, num carregamento à parte; só então ela entra no <img> visível. Se ela falhar (o googleusercontent
 * recusa pedidos às vezes), nada muda e a pessoa continua vendo a padrão, sem o ícone quebrado nem o texto alternativo
 * vazando do círculo. `no-referrer` porque o Google recusa pedidos com referência de outro site.
 */
export default function AvatarImage({ src, alt = '', ...rest }: AvatarImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  useEffect(() => {
    setLoadedSrc(null)
    setFailedSrc(null)
    if (!src) return

    let cancelled = false
    const probe = new Image()
    probe.referrerPolicy = 'no-referrer'
    probe.onload = () => {
      if (!cancelled) setLoadedSrc(src)
    }
    probe.src = src
    return () => {
      cancelled = true
      probe.onload = null
    }
  }, [src])

  const showPhoto = Boolean(src) && loadedSrc === src && failedSrc !== src

  return (
    <img
      {...rest}
      src={showPhoto ? src! : userProfilePictureDefault}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (showPhoto && src) setFailedSrc(src)
      }}
    />
  )
}
