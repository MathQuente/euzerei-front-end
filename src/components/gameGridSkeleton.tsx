/** Esqueleto da grade de capas, com a mesma grade e a quantidade de itens da página real. */
export function GameGridSkeleton({ count }: { count: number }) {
  return (
    <div
      className="grid grid-cols-4 sm:grid-cols-6 2xl:grid-cols-8 p-2 gap-x-1 sm:gap-x-2 gap-y-4 animate-pulse motion-reduce:animate-none"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => `sk${i}`).map(key => (
        <div
          key={key}
          className="aspect-[7/10] w-full rounded-lg bg-dark-bg-lighter"
        />
      ))}
    </div>
  )
}
