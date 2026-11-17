const SPARKS = Array.from({ length: 12 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 12 + (index % 2 ? 0.2 : -0.1)
  const reach = 22 + (index % 3) * 9
  return {
    dx: Math.round(Math.cos(angle) * reach),
    dy: Math.round(Math.sin(angle) * reach) - 6,
    delay: (index % 4) * 25,
  }
})

export const IMPORT_FINISH_MS = 900
export const IMPORT_LEAVE_MS = 500

export function ImportFinishBurst() {
  return (
    <div className="py-1" aria-hidden="true">
      <div className="relative w-full">
        <div className="h-1.5 w-full rounded-full bg-dark-bg">
          <div className="h-full w-full rounded-full bg-primary import-burst-fill" />
        </div>
        <div className="absolute right-0 top-[3px]">
          {SPARKS.map(spark => (
            <span
              key={`${spark.dx}:${spark.dy}`}
              className="import-spark"
              style={
                {
                  '--dx': `${spark.dx}px`,
                  '--dy': `${spark.dy}px`,
                  animationDelay: `${spark.delay}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
