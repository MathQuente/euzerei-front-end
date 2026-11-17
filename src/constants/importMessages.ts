const ROTATION_SECONDS = 6

const QUEUED_MESSAGES = [
  'Entrando na fila da importação...',
  'Soprando o cartucho antes de começar...',
  'Reticulando splines...',
  'Esperando a vez, sem furar a fila...',
  'Carregando a fila de importação...',
]

const PROGRESS_BANDS: { from: number; messages: string[] }[] = [
  {
    from: 0,
    messages: [
      'Abrindo sua biblioteca...',
      'Batendo na porta do servidor da loja...',
      'Pedindo a lista de jogos, com educação...',
      'Conferindo se a senha do Wi-Fi do cartucho ainda vale...',
      'Desenrolando a lista de jogos...',
    ],
  },
  {
    from: 10,
    messages: [
      'Contando os jogos comprados em promoção e nunca abertos...',
      'Achamos um jogo de 2014 com 12 minutos jogados.',
      'Separando o que veio de bundle do que você escolheu de verdade...',
      'Alguns desses jogos têm mais anos de casa que sua geladeira...',
      'Procurando aquele jogo que você jurava ter comprado...',
    ],
  },
  {
    from: 25,
    messages: [
      'Encontramos aquele RPG de 150 horas que você largou no chefe final.',
      'Anotando os jogos que ficaram em "só mais uma missão" pra sempre...',
      'Achamos um save de 2019 que ninguém abriu desde então...',
      'Registrando o jogo que você começou três vezes...',
      'Contando as vezes que você instalou e desinstalou o mesmo jogo...',
    ],
  },
  {
    from: 40,
    messages: [
      'Separando o que você zerou do que jura que ainda vai zerar...',
      'Conferindo quais créditos finais você realmente viu...',
      'Contando as vezes que você zerou o mesmo jogo...',
      'Decidindo se "quase no final" conta como zerado...',
      'Anotando os finais que você viu e os que ficou devendo...',
    ],
  },
  {
    from: 55,
    messages: [
      'Somando as horas jogadas. Fica entre a gente.',
      'Convertendo horas jogadas em "dava pra ter aprendido um idioma"...',
      'Descobrindo qual jogo comeu mais das suas noites...',
      'Tem jogo aqui que passou mais tempo aberto que seu navegador...',
      'Arredondando as horas pra baixo, por educação...',
    ],
  },
  {
    from: 70,
    messages: [
      'Conferindo conquistas. A platina ficou pra depois, né?',
      'Procurando a conquista que faltou por causa de um colecionável...',
      'Olhando as conquistas raras que você pegou sem querer...',
      'Achamos aquela conquista que exige 100 horas de grind...',
      'Separando os 100% dos 99% que doem...',
    ],
  },
  {
    from: 85,
    messages: [
      'Tirando a poeira dos jogos que só rodaram o tutorial...',
      'Arrumando tudo na estante...',
      'Alinhando as capas pela lombada...',
      'Pondo cada jogo no lugar que ele merece...',
      'Colocando os favoritos na frente...',
    ],
  },
  {
    from: 95,
    messages: [
      'Quase lá. Salvando seus jogos na biblioteca.',
      'Só falta fechar a estante...',
      'Dando os últimos retoques...',
      'Última conferência antes de abrir...',
    ],
  },
]

const SLOW_NOTICES = [
  'Bibliotecas grandes podem levar alguns minutos. Pode continuar navegando enquanto isso.',
  'Está demorando mais que o normal, mas segue em andamento.',
  'A loja às vezes responde devagar. A gente espera por você.',
]

const VERY_SLOW_NOTICES = [
  'Biblioteca grande, hein? Ainda estamos trabalhando. Pode sair desta página e continuar navegando, a importação segue em segundo plano.',
  'Quase lá, de verdade. A importação continua em segundo plano se você sair.',
  'Mais um pouco. A importação continua em segundo plano e o resultado fica aqui quando você voltar.',
]

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const random = seededRandom(seed)
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}

function pick(
  messages: string[],
  elapsedSeconds: number,
  seed: number,
  salt: number
) {
  const order = shuffled(messages, seed + salt)
  return order[Math.floor(elapsedSeconds / ROTATION_SECONDS) % order.length]
}

export function getImportMessage(
  progress: number | undefined,
  elapsedSeconds: number,
  seed = 0
): string {
  if (progress === undefined) {
    return pick(QUEUED_MESSAGES, elapsedSeconds, seed, 101)
  }

  const band =
    [...PROGRESS_BANDS].reverse().find(b => progress >= b.from) ??
    PROGRESS_BANDS[0]
  return pick(band.messages, elapsedSeconds, seed, band.from)
}

const SLOW_AFTER_SECONDS = 20
const VERY_SLOW_AFTER_SECONDS = 90

export function getSlowImportNotice(
  elapsedSeconds: number,
  seed = 0
): string | null {
  if (elapsedSeconds >= VERY_SLOW_AFTER_SECONDS) {
    return shuffled(VERY_SLOW_NOTICES, seed + 7)[0]
  }
  if (elapsedSeconds >= SLOW_AFTER_SECONDS) {
    return shuffled(SLOW_NOTICES, seed + 3)[0]
  }
  return null
}

export const IMPORT_MESSAGE_BANDS = PROGRESS_BANDS
export const IMPORT_QUEUED_MESSAGES = QUEUED_MESSAGES
