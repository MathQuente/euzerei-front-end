import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { focusRing } from '../../styles/focus'
import { FAVORITE_SLOTS } from '../../utils/favorites'

const ways = [
  {
    to: '/games',
    title: 'Adicionar um jogo',
    hint: 'Busque pelo nome e escolha o status.',
  },
  {
    to: '/userLibrary',
    title: `Escolher até ${FAVORITE_SLOTS} favoritos`,
    hint: 'Eles ficam no topo do seu perfil.',
  },
]

/** Primeira vez: biblioteca vazia. Some sozinho quando entra o primeiro jogo. */
export function Welcome({ name }: { name?: string | null }) {
  const trimmed = name?.trim()

  return (
    <section className="min-w-0">
      <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white">
        Boas-vindas
        {trimmed ? (
          <>
            , <span className="text-primary-link">{trimmed}</span>
          </>
        ) : null}
        .
      </h1>
      <p className="mt-2 max-w-md text-gray-400">
        Sua estante está vazia por enquanto. Traga o que você já jogou, ou
        comece por um jogo só.
      </p>
      <Link
        to="/configuracoes/importar"
        className={`mt-5 inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-base font-bold text-white transition-colors duration-200 hover:bg-primary-light ${focusRing} active:scale-[0.98]`}
      >
        Importar da Steam, PSN ou Xbox
      </Link>
      <ul className="mt-6 max-w-md list-none border-t border-dark-border p-0">
        {ways.map(way => (
          <li key={way.to + way.title}>
            <Link
              to={way.to}
              className={`group flex min-h-11 items-center justify-between gap-4 border-b border-dark-border px-0.5 py-3 text-gray-100 transition-[color,padding] duration-200 hover:pl-2 hover:text-white motion-reduce:transition-none motion-reduce:hover:pl-0.5 ${focusRing}`}
            >
              <span>
                {way.title}
                <small className="mt-px block text-[13px] text-gray-400">
                  {way.hint}
                </small>
              </span>
              <ChevronRight
                className="size-4 flex-none text-gray-400"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
