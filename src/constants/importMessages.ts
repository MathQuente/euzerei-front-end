export type ImportStore = 'STEAM' | 'PLAYSTATION' | 'XBOX'

export const IMPORT_STORES: ImportStore[] = ['STEAM', 'PLAYSTATION', 'XBOX']

const ROTATION_SECONDS = 6

const BAND_STARTS = [0, 10, 25, 40, 55, 70, 85, 95] as const
type BandStart = (typeof BAND_STARTS)[number]

interface StoreMessages {
  queued: string[]
  bands: Record<BandStart, string[]>
  slow: string[]
  verySlow: string[]
}

/** Frases que valem para qualquer loja; cada loja as mistura com as suas. */
const SHARED = {
  spf: 'Achamos um jogo de 2014 com 12 minutos jogados.',
  rpg: 'Encontramos aquele RPG de 150 horas que você largou no chefe final.',
  sv: 'Achamos um save de 2019 que ninguém abriu desde então...',
  mi: 'Anotando os jogos que ficaram em "só mais uma missão" pra sempre...',
  z1: 'Separando o que você zerou do que jura que ainda vai zerar...',
  z3: 'Contando as vezes que você zerou o mesmo jogo...',
  z4: 'Decidindo se "quase no final" conta como zerado...',
  h1: 'Somando as horas jogadas. Fica entre a gente.',
  h2: 'Descobrindo qual jogo comeu mais das suas noites...',
  h4: 'Arredondando as horas pra baixo, por educação...',
  e1: 'Tirando a poeira dos jogos que só rodaram o tutorial...',
  e2: 'Alinhando as capas pela lombada...',
  e3: 'Pondo cada jogo no lugar que ele merece...',
  e4: 'Colocando os favoritos na frente...',
  f2: 'Só falta fechar a estante...',
  f3: 'Dando os últimos retoques...',
  f4: 'Última conferência antes de abrir...',
} as const

const STORE_MESSAGES: Record<ImportStore, StoreMessages> = {
  STEAM: {
    queued: [
      'Na fila da importação. Tempo estimado: horário da Valve...',
      'Esperando a vez, igualzinho ao download de 100 GB que parou nos 99%...',
      'Entrando na fila. Prometemos não pedir para reiniciar a Steam...',
      'Aguardando a vez. Dá tempo de verificar a integridade dos arquivos de um jogo, o ritual sagrado...',
      'Na fila. Pelo menos aqui ninguém está compilando shaders de novo...',
    ],
    bands: {
      0: [
        'Batendo na porta da Steam...',
        'Pedindo a lista de jogos à Steam, com educação...',
        'Abrindo sua biblioteca da Steam...',
        'Perguntando à Steam quantos jogos você tem. Ela também se assustou...',
        'Perguntando ao seu PC: "mas roda Crysis?" (a gente só está importando, fica tranquilo)...',
      ],
      10: [
        'Contando os jogos comprados na promoção de verão e nunca abertos...',
        SHARED.spf,
        'Separando o que veio de bundle do que você escolheu de verdade...',
        'Achamos uma lista de desejos com 400 jogos esperando 75% de desconto...',
        'Somando os "depois eu jogo" que a Steam guardou com carinho...',
      ],
      25: [
        SHARED.rpg,
        'Achamos um jogo em acesso antecipado desde 2016 que continua "quase pronto"...',
        'Procurando o mod que conserta o que o estúdio nunca consertou...',
        SHARED.mi,
        SHARED.sv,
      ],
      40: [
        SHARED.z1,
        'Conferindo quem zerou de verdade e quem só viu o final no YouTube...',
        SHARED.z3,
        SHARED.z4,
        'Contando quantos "só mais um turno" viraram o dia seguinte...',
      ],
      55: [
        SHARED.h1,
        SHARED.h2,
        'Tem jogo aqui que passou mais tempo aberto que seu navegador...',
        SHARED.h4,
        'Separando as horas jogadas das horas só mexendo nas configurações gráficas...',
      ],
      70: [
        'Conferindo conquistas. Aquela de "apertar o botão 1000 vezes" ficou pra depois, né?',
        'Procurando a conquista que faltou por causa de um colecionável...',
        'Achando a conquista rara que só 0,1% dos jogadores tem. Parabéns, você é o 0,1%...',
        'Achamos aquela conquista que exige 100 horas de grind...',
        'Separando os 100% dos 99% que dão vontade de desinstalar o jogo...',
      ],
      85: [
        SHARED.e1,
        'Organizando a biblioteca em coleções que você nunca vai abrir...',
        SHARED.e2,
        SHARED.e3,
        SHARED.e4,
      ],
      95: [
        'Quase lá. Salvando seus jogos da Steam na biblioteca.',
        SHARED.f2,
        SHARED.f3,
        SHARED.f4,
      ],
    },
    slow: [
      'Bibliotecas grandes da Steam podem levar alguns minutos. Pode continuar navegando enquanto isso.',
      'Está demorando mais que o normal, mas segue em andamento.',
      'A Steam às vezes responde devagar. A gente espera por você.',
    ],
    verySlow: [
      'Biblioteca grande, hein? Ainda estamos falando com a Steam. Pode sair desta página e continuar navegando, a importação segue em segundo plano.',
      'Quase lá, de verdade. A importação da Steam continua em segundo plano se você sair.',
      'Mais um pouco. A importação continua em segundo plano e o resultado da Steam fica aqui quando você voltar.',
    ],
  },
  PLAYSTATION: {
    queued: [
      'Na fila da importação. Pressione X para continuar esperando...',
      'Esperando a vez, sem puxar o cabo do console...',
      'Entrando na fila. A PSN promete não cair justo agora...',
      'Aguardando a vez. Dá tempo de olhar os jogos do mês do PS Plus...',
      'Na fila. Cada minuto aqui é um troféu de bronze de paciência...',
    ],
    bands: {
      0: [
        'Batendo na porta da PlayStation Network...',
        'Pedindo a lista de jogos à PSN, com educação...',
        'Esperando a PSN decidir que hoje é dia de responder...',
        'Abrindo sua estante da PlayStation...',
        'Conferindo se o ID online é o mesmo que você jurava lembrar...',
      ],
      10: [
        'Contando os jogos do PS Plus que você resgatou e nunca baixou...',
        'Achamos um jogo de PS4 com 12 minutos jogados.',
        'Separando o que veio do PS Plus do que você comprou de verdade...',
        'Procurando aquele jogo que você jurava ter na PS Store...',
        'Contando as edições "Deluxe" que você nunca abriu...',
      ],
      25: [
        SHARED.rpg,
        'Achamos aquele jogo que ficou pausado no menu desde que o controle desligou sozinho...',
        'Registrando o jogo que você começou no PS4 e terminou no PS5, ou não...',
        SHARED.mi,
        SHARED.sv,
      ],
      40: [
        SHARED.z1,
        'Conferindo quem viu o final e quem só passou a cutscene apertando X...',
        SHARED.z3,
        SHARED.z4,
        'Contando os finais que ficaram devendo por falta de um save antes do chefe...',
      ],
      55: [
        SHARED.h1,
        SHARED.h2,
        'Convertendo horas jogadas em "dava pra ter aprendido um idioma"...',
        SHARED.h4,
        'Tem jogo aqui que passou mais tempo em modo repouso que ligado...',
      ],
      70: [
        'Conferindo troféus. Aquela platina que "só falta um" continua faltando...',
        'Procurando o troféu que faltou por causa de um colecionável...',
        'Procurando aquele troféu de 0,1% que exige jogar de olhos fechados...',
        'Achamos aquele troféu que exige 100 horas de grind...',
        'Separando as platinas dos 99% que dão vontade de arremessar o controle...',
      ],
      85: [
        SHARED.e1,
        'Colocando as platinas na prateleira de troféus, com iluminação...',
        SHARED.e2,
        SHARED.e3,
        SHARED.e4,
      ],
      95: [
        'Quase lá. Salvando seus jogos da PlayStation na biblioteca.',
        SHARED.f2,
        SHARED.f3,
        SHARED.f4,
      ],
    },
    slow: [
      'Bibliotecas grandes da PlayStation podem levar alguns minutos. Pode continuar navegando enquanto isso.',
      'Está demorando mais que o normal, mas segue em andamento.',
      'A PSN às vezes responde devagar. A gente espera por você.',
    ],
    verySlow: [
      'Biblioteca grande, hein? Ainda estamos falando com a PlayStation. Pode sair desta página e continuar navegando, a importação segue em segundo plano.',
      'Quase lá, de verdade. A importação da PlayStation continua em segundo plano se você sair.',
      'Mais um pouco. A importação continua em segundo plano e o resultado da PlayStation fica aqui quando você voltar.',
    ],
  },
  XBOX: {
    queued: [
      'Na fila da importação. Dá tempo de dar uma volta pelo Game Pass...',
      'Esperando a vez, sem sair da tela inicial que mudou de lugar de novo...',
      'Entrando na fila. O Quick Resume segura seu lugar...',
      'Aguardando a vez. Pelo menos aqui ninguém pede para atualizar o console...',
      'Na fila. Gamerscore não sobe esperando, mas a gente vai rápido...',
    ],
    bands: {
      0: [
        'Batendo na porta do Xbox...',
        'Pedindo a lista de jogos ao Xbox, com educação...',
        'Conferindo seu gamertag, aquele com números no fim...',
        'Abrindo sua biblioteca do Xbox...',
        'Acordando o servidor que estava em modo de espera...',
      ],
      10: [
        'Contando os jogos do Game Pass que você baixou e esqueceu...',
        SHARED.spf,
        'Separando o que veio do Game Pass do que você comprou de verdade...',
        'Procurando aquele jogo que você tinha certeza que estava no Game Pass...',
        'Alguns desses jogos saíram do catálogo antes de você abrir...',
      ],
      25: [
        SHARED.rpg,
        'Achamos aquele jogo que ficou pausado desde a última atualização do console...',
        'Registrando o jogo que você começou no console e continuou na nuvem...',
        SHARED.mi,
        SHARED.sv,
      ],
      40: [
        SHARED.z1,
        'Conferindo quem zerou de verdade e quem só deixou o jogo no Quick Resume...',
        SHARED.z3,
        SHARED.z4,
        'Contando os finais que ficaram na lista do "depois eu volto"...',
      ],
      55: [
        SHARED.h1,
        SHARED.h2,
        'Convertendo horas jogadas em "dava pra ter aprendido um idioma"...',
        SHARED.h4,
        'Tem jogo aqui que passou mais tempo no Game Pass que na sua rotina...',
      ],
      70: [
        'Conferindo conquistas. O gamerscore agradece...',
        'Procurando a conquista que faltou por causa de um colecionável...',
        'Achando a conquista de 0,1% que você pegou sem querer. O gamerscore sentiu...',
        'Somando o gamerscore. Sem julgamentos...',
        'Separando os 1000G dos 990G que tiram o sono...',
      ],
      85: [
        SHARED.e1,
        'Pondo o gamerscore em ordem e os jogos na ordem que você nunca vai seguir...',
        SHARED.e2,
        SHARED.e3,
        SHARED.e4,
      ],
      95: [
        'Quase lá. Salvando seus jogos do Xbox na biblioteca.',
        SHARED.f2,
        SHARED.f3,
        SHARED.f4,
      ],
    },
    slow: [
      'Bibliotecas grandes do Xbox podem levar alguns minutos. Pode continuar navegando enquanto isso.',
      'Está demorando mais que o normal, mas segue em andamento.',
      'O Xbox às vezes responde devagar. A gente espera por você.',
    ],
    verySlow: [
      'Biblioteca grande, hein? Ainda estamos falando com o Xbox. Pode sair desta página e continuar navegando, a importação segue em segundo plano.',
      'Quase lá, de verdade. A importação do Xbox continua em segundo plano se você sair.',
      'Mais um pouco. A importação continua em segundo plano e o resultado do Xbox fica aqui quando você voltar.',
    ],
  },
}

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
  store: ImportStore,
  progress: number | undefined,
  elapsedSeconds: number,
  seed = 0
): string {
  const { queued, bands } = STORE_MESSAGES[store]
  if (progress === undefined) {
    return pick(queued, elapsedSeconds, seed, 101)
  }

  const from = [...BAND_STARTS].reverse().find(start => progress >= start) ?? 0
  return pick(bands[from], elapsedSeconds, seed, from)
}

const SLOW_AFTER_SECONDS = 20
const VERY_SLOW_AFTER_SECONDS = 90

export function getSlowImportNotice(
  store: ImportStore,
  elapsedSeconds: number,
  seed = 0
): string | null {
  const { slow, verySlow } = STORE_MESSAGES[store]
  if (elapsedSeconds >= VERY_SLOW_AFTER_SECONDS) {
    return shuffled(verySlow, seed + 7)[0]
  }
  if (elapsedSeconds >= SLOW_AFTER_SECONDS) {
    return shuffled(slow, seed + 3)[0]
  }
  return null
}

export function getStoreMessages(store: ImportStore) {
  const { queued, bands, slow, verySlow } = STORE_MESSAGES[store]
  return {
    queued,
    bands: BAND_STARTS.map(from => ({ from, messages: bands[from] })),
    slow,
    verySlow,
  }
}
