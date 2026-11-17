import { Crown } from 'lucide-react'

export function FavoriteCardMarks({
  main,
  hundred,
  index,
}: {
  main: boolean
  hundred: boolean
  index: number
}) {
  if (!main && !hundred) return null

  const delay = `${((index * 0.7) % 2.8).toFixed(1)}s`

  return (
    <>
      {main && (
        <span
          className={`favorite-ring${hundred ? ' favorite-ring--holo' : ''}`}
          aria-hidden="true"
        />
      )}
      <span
        className={`favorite-wave ${hundred ? 'favorite-wave--holo' : 'favorite-wave--purple'}`}
        style={{ '--favorite-delay': delay } as React.CSSProperties}
        aria-hidden="true"
      />
      {main && (
        <span
          className={`favorite-pin${hundred ? ' favorite-pin--holo' : ''}`}
          aria-hidden="true"
        >
          <Crown
            className="size-3.5 fill-current"
            strokeWidth={2}
            aria-hidden="true"
          />
        </span>
      )}
    </>
  )
}
