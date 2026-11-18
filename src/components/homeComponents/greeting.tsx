import { Link } from 'react-router-dom'
import { focusRing } from '../../styles/focus'
import { periodGreeting, statusLine } from '../../utils/greeting'

const greetingLink = `rounded-sm font-semibold tabular-nums text-white transition-colors hover:text-primary-link ${focusRing}`

/** Saudação do topo da home: o período do dia, o nome e uma frase com atalhos. */
export function Greeting({
  name,
  playing,
  backlog,
}: {
  name?: string | null
  playing: number
  backlog: number
}) {
  const hello = periodGreeting(new Date().getHours())
  const line = statusLine(playing, backlog)
  const trimmed = name?.trim()

  return (
    <header>
      <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-white lg:text-3xl">
        {hello}
        {trimmed ? (
          <>
            , <span className="text-primary-link">{trimmed}</span>
          </>
        ) : null}
        .
      </h1>
      {line && (
        <p className="mt-2 max-w-prose text-gray-400">
          {line.kind === 'idle' ? (
            <>
              Nada em andamento por aqui.{' '}
              <Link to="/userLibrary/backlogGames" className={greetingLink}>
                Retomar um da fila?
              </Link>
            </>
          ) : (
            <>
              Você está jogando{' '}
              <Link to="/userLibrary/playingGames" className={greetingLink}>
                {line.playing} {line.playing === 1 ? 'jogo' : 'jogos'}
              </Link>
              {line.kind === 'both' ? (
                <>
                  {' '}
                  e tem{' '}
                  <Link to="/userLibrary/backlogGames" className={greetingLink}>
                    {line.backlog.toLocaleString('pt-BR')}
                  </Link>{' '}
                  esperando na fila.
                </>
              ) : (
                '. Sua fila está vazia.'
              )}
            </>
          )}
        </p>
      )}
    </header>
  )
}
