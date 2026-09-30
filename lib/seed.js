// Dados de demonstração do Manna.
// Tudo aqui é criado no primeiro acesso e depois vive no navegador (localStorage),
// então leitores, criadores e moderadores podem usar a plataforma inteira sem servidor.

export const SEED_VERSION = 3

export const GENRES = [
  'Romance',
  'Fantasia',
  'Drama',
  'Reencarnação',
  'Histórico',
  'Comédia',
  'Ação',
  'Sobrenatural',
  'Mistério',
  'Slice of Life',
  'Realeza',
  'Vilã',
]

export const STATUS_LABEL = {
  ongoing: 'Em andamento',
  completed: 'Completo',
  hiatus: 'Em hiato',
}

export const PUBLICATION_LABEL = {
  draft: 'Rascunho',
  review: 'Em revisão',
  published: 'Publicado',
  rejected: 'Ajustes pedidos',
}

export const ROLE_LABEL = {
  reader: 'Leitor(a)',
  creator: 'Criador(a)',
  moderator: 'Moderação',
  admin: 'Admin',
}

// Senha de todas as contas demo: manna123
export const DEMO_ACCOUNTS = [
  {
    id: 'u-leitora',
    name: 'Aya Moreira',
    username: 'aya',
    email: 'leitora@manna.app',
    passwordHash: '6e95ff88d6c49faf4a3aa001b920f82e8e7e0dcce8b660b17e5052de1b5c002c',
    roles: ['reader'],
    bio: 'Leio um capítulo antes de dormir. Às vezes dez.',
    label: 'Leitora',
    description: 'Biblioteca, favoritos e progresso de leitura.',
  },
  {
    id: 'u-criadora',
    name: 'Mina Kang',
    username: 'minakang',
    email: 'criadora@manna.app',
    passwordHash: 'b44b7fa5b4d54a7d33df38527c1c78039de7a0966421520adce1e4140218e519',
    roles: ['reader', 'creator'],
    bio: 'Roteirista e ilustradora. Histórias de corte, magia e segundas chances.',
    label: 'Criadora',
    description: 'Creator Studio: séries, capítulos e estatísticas.',
  },
  {
    id: 'u-admin',
    name: 'Equipe Manna',
    username: 'manna',
    email: 'admin@manna.app',
    passwordHash: '8fae45884184510a3bcfe0e267993ce34a10332ebf439366dbd087d69edb0366',
    roles: ['reader', 'creator', 'moderator', 'admin'],
    bio: 'Curadoria e moderação da plataforma.',
    label: 'Admin',
    description: 'Fila de moderação, aprovação e histórico.',
  },
]

const H = 3600 * 1000
const D = 24 * H

// creatorId aponta para uma conta demo ou para um estúdio fictício (sem login).
const CATALOG = [
  {
    slug: 'ser-uma-vila-nao-e-muito-melhor',
    title: 'Ser uma Vilã Não é Muito Melhor?',
    author: 'Mina Kang',
    creatorId: 'u-criadora',
    genres: ['Romance', 'Fantasia', 'Vilã', 'Reencarnação'],
    status: 'ongoing',
    description:
      'Ao acordar no corpo da vilã de seu romance favorito, Evangeline decide que não vai implorar por perdão a ninguém. Se o destino já a escolheu como antagonista, ela vai ser a melhor que este reino já viu — e talvez descobrir que os vilões também merecem finais felizes.',
    views: 2_540_000,
    rating: 4.8,
    votes: 18_320,
    chapters: 12,
    featured: true,
    accent: '330 70% 45%',
  },
  {
    slug: 'me-tornei-serva',
    title: 'Eu Me Tornei a Serva do Tirano',
    author: 'Estúdio Lumen',
    creatorId: 'studio-lumen',
    genres: ['Romance', 'Fantasia', 'Realeza'],
    status: 'ongoing',
    description:
      'Uma funcionária exausta é transportada para dentro de um romance de fantasia — como a criada pessoal do imperador que, segundo o livro, destrói o próprio império. Para sobreviver, ela precisa ser indispensável. Para mudar o final, precisa entender o homem por trás da coroa.',
    views: 1_820_000,
    rating: 4.7,
    votes: 12_904,
    chapters: 10,
    featured: true,
    accent: '350 60% 40%',
  },
  {
    slug: 'not-your-typical',
    title: 'Não é uma História Típica de Reencarnação',
    author: 'Estúdio Lumen',
    creatorId: 'studio-lumen',
    genres: ['Comédia', 'Fantasia', 'Reencarnação'],
    status: 'completed',
    description:
      'Renascer como figurante deveria ser tranquilo. Mas Suna sabe exatamente quais tragédias vão acontecer com as pessoas ao seu redor — e não consegue ficar parada. Uma comédia de erros sobre mudar o roteiro sem querer virar protagonista.',
    views: 3_210_000,
    rating: 4.9,
    votes: 24_117,
    chapters: 9,
    featured: true,
    accent: '210 70% 40%',
  },
  {
    slug: 'for-my-derelict-favorite',
    title: 'Pelo Meu Favorito Abandonado',
    author: 'Han Seori',
    creatorId: 'studio-seori',
    genres: ['Romance', 'Drama', 'Reencarnação'],
    status: 'ongoing',
    description:
      'Ela sempre torceu pelo personagem secundário que ninguém amava. Agora que está dentro da história, tem uma única missão: garantir que ele sobreviva ao capítulo em que foi esquecido pelo autor.',
    views: 1_530_000,
    rating: 4.6,
    votes: 9_880,
    chapters: 8,
    featured: true,
    accent: '265 55% 42%',
  },
  {
    slug: 'our-contract-marriage-ends-here',
    title: 'Nosso Contrato de Casamento Termina Aqui',
    author: 'Mina Kang',
    creatorId: 'u-criadora',
    genres: ['Romance', 'Drama', 'Realeza'],
    status: 'ongoing',
    description:
      'Três anos de casamento por contrato, uma cláusula de saída e um duque que de repente não quer assinar o divórcio. Leonie tem planos para a própria vida — e nenhum deles inclui se apaixonar pelo marido de fachada.',
    views: 1_210_000,
    rating: 4.5,
    votes: 7_402,
    chapters: 9,
    featured: true,
    accent: '160 50% 30%',
  },
  {
    slug: 'this-marriage-will-definitely-work-out',
    title: 'Este Casamento Vai Dar Certo',
    author: 'Estúdio Aurora',
    creatorId: 'studio-aurora',
    genres: ['Romance', 'Comédia', 'Realeza'],
    status: 'ongoing',
    description:
      'Dois nobres que se detestam desde a infância são obrigados a se casar para salvar suas famílias. Eles juram que vai ser um desastre. O reino inteiro aposta o contrário.',
    views: 986_000,
    rating: 4.6,
    votes: 6_120,
    chapters: 7,
    accent: '40 70% 40%',
  },
  {
    slug: 'my-fake-crush',
    title: 'Minha Paixão de Mentira',
    author: 'Yuri Park',
    creatorId: 'studio-yuri',
    genres: ['Romance', 'Slice of Life', 'Comédia'],
    status: 'ongoing',
    description:
      'Para escapar de um encontro arranjado, Dahye inventa um namorado. O problema é que o rapaz que ela apontou no café existe — e resolveu entrar na brincadeira.',
    views: 642_000,
    rating: 4.3,
    votes: 3_870,
    chapters: 6,
    accent: '340 60% 50%',
  },
  {
    slug: 'desejos-bestiais',
    title: 'Desejos Bestiais',
    author: 'Estúdio Aurora',
    creatorId: 'studio-aurora',
    genres: ['Romance', 'Sobrenatural', 'Fantasia'],
    status: 'ongoing',
    description:
      'No reino onde os clãs-fera governam, uma curandeira humana é chamada para tratar a maldição do herdeiro lobo. Quanto mais ela se aproxima da cura, mais perigoso fica o que sente.',
    views: 874_000,
    rating: 4.1,
    votes: 5_004,
    chapters: 8,
    accent: '20 60% 35%',
  },
  {
    slug: 'por-tras-da-fachada',
    title: 'Por Trás da Fachada Alegre da Princesa',
    author: 'Han Seori',
    creatorId: 'studio-seori',
    genres: ['Drama', 'Fantasia', 'Realeza'],
    status: 'ongoing',
    description:
      'A princesa mais sorridente do palácio sobreviveu a um massacre que ninguém mais lembra. Por trás de cada sorriso existe um plano — e ela está a três passos de executá-lo.',
    views: 713_000,
    rating: 4.5,
    votes: 4_390,
    chapters: 7,
    accent: '280 45% 40%',
  },
  {
    slug: 'how-send-husband',
    title: 'Como Despachar Meu Marido',
    author: 'Yuri Park',
    creatorId: 'studio-yuri',
    genres: ['Comédia', 'Romance', 'Realeza'],
    status: 'completed',
    description:
      'Uma imperatriz decidida a mandar o marido para a guerra mais longa possível descobre que ele volta sempre mais rápido. E cada vez mais apaixonado.',
    views: 1_040_000,
    rating: 4.7,
    votes: 8_016,
    chapters: 8,
    accent: '0 60% 42%',
  },
  {
    slug: 'how-to-make-my-husband-stay-by-my-side',
    title: 'Como Fazer Meu Marido Ficar do Meu Lado',
    author: 'Estúdio Lumen',
    creatorId: 'studio-lumen',
    genres: ['Romance', 'Drama', 'Histórico'],
    status: 'ongoing',
    description:
      'Ela recebeu uma segunda chance e sabe exatamente o dia em que o marido vai deixá-la. Desta vez, vai lutar pela família que perdeu — mesmo que precise reescrever o próprio coração.',
    views: 1_380_000,
    rating: 4.6,
    votes: 9_210,
    chapters: 9,
    accent: '200 55% 38%',
  },
  {
    slug: 'tear-on-a-flowers',
    title: 'Lágrimas em uma Flor Murcha',
    author: 'Han Seori',
    creatorId: 'studio-seori',
    genres: ['Drama', 'Romance', 'Histórico'],
    status: 'ongoing',
    description:
      'Uma jardineira do palácio guarda o segredo de uma flor que só floresce com lágrimas verdadeiras. Quando o príncipe adoece, todos querem a flor. Ninguém pergunta o que ela custa.',
    views: 522_000,
    rating: 4.2,
    votes: 2_940,
    chapters: 6,
    accent: '120 30% 35%',
  },
  {
    slug: 'segundo-filho',
    title: 'Criando o Filho do Segundo Protagonista',
    author: 'Estúdio Aurora',
    creatorId: 'studio-aurora',
    genres: ['Slice of Life', 'Fantasia', 'Comédia'],
    status: 'completed',
    description:
      'Ela encontrou um bebê na porta de casa — e reconheceu os olhos do futuro vilão da história. Criá-lo com amor pode ser a única forma de salvar o mundo. E, quem sabe, a si mesma.',
    views: 1_120_000,
    rating: 4.6,
    votes: 7_760,
    chapters: 7,
    accent: '30 70% 45%',
  },
  {
    slug: 'the-dawn-to-come',
    title: 'O Amanhecer que Virá',
    author: 'Mina Kang',
    creatorId: 'u-criadora',
    genres: ['Fantasia', 'Ação', 'Drama'],
    status: 'ongoing',
    description:
      'No continente onde o sol não nasce há cem anos, uma cavaleira sem título jura escoltar a última sacerdotisa até o templo da aurora. O caminho é longo. As mentiras entre elas, maiores ainda.',
    views: 418_000,
    rating: 4.4,
    votes: 2_310,
    chapters: 7,
    accent: '25 80% 45%',
  },
  {
    slug: 'its-just-business',
    title: 'É Só um Negócio',
    author: 'Yuri Park',
    creatorId: 'studio-yuri',
    genres: ['Romance', 'Slice of Life'],
    status: 'ongoing',
    description:
      'A CEO mais temida de Seul e o consultor que ela contratou para salvar a empresa têm uma regra: nada pessoal. A regra dura exatamente um capítulo.',
    views: 587_000,
    rating: 4.3,
    votes: 3_190,
    chapters: 8,
    accent: '220 40% 35%',
  },
  {
    slug: 'operation-true-love',
    title: 'Operação Amor Verdadeiro',
    author: 'Yuri Park',
    creatorId: 'studio-yuri',
    genres: ['Comédia', 'Romance', 'Slice of Life'],
    status: 'ongoing',
    description:
      'Dois melhores amigos montam um plano infalível para arrumar namorados um para o outro. Quanto melhor o plano funciona, pior eles se sentem.',
    views: 764_000,
    rating: 4.4,
    votes: 4_870,
    chapters: 9,
    accent: '350 70% 55%',
  },
  {
    slug: 'cant-get-enough-of-you',
    title: 'Não Me Canso de Você',
    author: 'Estúdio Aurora',
    creatorId: 'studio-aurora',
    genres: ['Romance', 'Drama'],
    status: 'hiatus',
    description:
      'Ela voltou para a cidade natal para vender a casa da avó. Ele nunca foi embora. Um verão, uma casa cheia de lembranças e tudo o que ficou por dizer.',
    views: 391_000,
    rating: 4.2,
    votes: 2_020,
    chapters: 5,
    accent: '10 50% 45%',
  },
  {
    slug: 'desejo-diabo',
    title: 'O Desejo do Diabo',
    author: 'Han Seori',
    creatorId: 'studio-seori',
    genres: ['Sobrenatural', 'Romance', 'Mistério'],
    status: 'ongoing',
    description:
      'Invocar um demônio por acidente já seria ruim. Pior é descobrir que ele só pode voltar para casa depois de realizar um desejo sincero — e ela não sabe o que deseja.',
    views: 933_000,
    rating: 4.5,
    votes: 6_430,
    chapters: 8,
    accent: '0 70% 35%',
  },
  {
    slug: 'ex-esposa-protagonista',
    title: 'A Ex-Esposa do Protagonista',
    author: 'Estúdio Lumen',
    creatorId: 'studio-lumen',
    genres: ['Drama', 'Romance', 'Vilã'],
    status: 'ongoing',
    description:
      'Na história original, ela é a ex-esposa amarga que atrapalha o casal principal. Nesta versão, ela assina o divórcio no primeiro capítulo e abre o próprio negócio. O protagonista não sabe lidar com isso.',
    views: 1_270_000,
    rating: 4.7,
    votes: 8_900,
    chapters: 10,
    accent: '300 40% 40%',
  },
  {
    slug: 'promessa-nao-minha',
    title: 'Uma Promessa que Não Era Minha',
    author: 'Mina Kang',
    creatorId: 'u-criadora',
    genres: ['Romance', 'Mistério', 'Histórico'],
    status: 'ongoing',
    description:
      'Ela foi confundida com a noiva prometida de um general que voltou da guerra sem memória. Dizer a verdade significa perder tudo. Continuar mentindo pode custar muito mais.',
    views: 0,
    rating: 0,
    votes: 0,
    chapters: 2,
    publication: 'review',
    accent: '190 45% 35%',
  },
  {
    slug: 'santa-falsa',
    title: 'A Santa Falsa',
    author: 'Estúdio Aurora',
    creatorId: 'studio-aurora',
    genres: ['Fantasia', 'Mistério', 'Drama'],
    status: 'ongoing',
    description:
      'O templo precisava de uma santa, e ela precisava de comida. Fingir milagres era fácil até o primeiro milagre de verdade acontecer — nas mãos erradas.',
    views: 1_460_000,
    rating: 4.8,
    votes: 11_380,
    chapters: 10,
    accent: '45 80% 45%',
  },
]

export const FICTIONAL_CREATORS = {
  'studio-lumen': 'Estúdio Lumen',
  'studio-seori': 'Han Seori',
  'studio-aurora': 'Estúdio Aurora',
  'studio-yuri': 'Yuri Park',
}

const SUBTITLES = [
  'O primeiro dia',
  'Um convite inesperado',
  'Promessas ao luar',
  'A carta sem remetente',
  'O baile de inverno',
  'Segredos no jardim',
  'O que eu não disse',
  'Coroa de espinhos',
  'Chuva no palácio',
  'O preço da verdade',
  'Um passo à frente',
  'Antes do amanhecer',
]

export function buildSeed(now = Date.now()) {
  const series = []
  const chapters = []

  CATALOG.forEach((item, index) => {
    const id = `s-${item.slug}`
    const publication = item.publication || 'published'
    // Séries mais recentes ficam no fim do catálogo.
    const createdAt = now - (CATALOG.length - index) * 21 * D
    // Espalha a última atualização para alimentar "Últimos lançamentos".
    const lastUpdate = now - ((index * 7) % 60) * H - (index % 5) * D

    for (let n = 1; n <= item.chapters; n++) {
      const fromEnd = item.chapters - n
      chapters.push({
        id: `${id}-c${n}`,
        seriesId: id,
        number: n,
        title: SUBTITLES[(n - 1 + index) % SUBTITLES.length],
        pages: null, // null = páginas demo geradas no leitor
        publication,
        views: Math.max(0, Math.round(item.views / item.chapters / (1 + fromEnd * 0.08))),
        createdAt: lastUpdate - fromEnd * 7 * D,
      })
    }

    series.push({
      id,
      slug: item.slug,
      title: item.title,
      author: item.author,
      creatorId: item.creatorId,
      description: item.description,
      cover: `/images/covers/${item.slug}.webp`,
      genres: item.genres,
      status: item.status,
      publication,
      featured: !!item.featured,
      accent: item.accent,
      views: item.views,
      baseRating: item.rating,
      baseVotes: item.votes,
      createdAt,
      updatedAt: lastUpdate,
    })
  })

  const users = DEMO_ACCOUNTS.map(({ label, description, ...user }, i) => ({
    ...user,
    avatar: null,
    createdAt: now - (120 - i * 30) * D,
  }))

  // Uma biblioteca inicial para a conta leitora, para a demo não começar vazia.
  const history = {
    'u-leitora': {
      's-santa-falsa': { chapterId: 's-santa-falsa-c4', progress: 0.62, updatedAt: now - 3 * H },
      's-not-your-typical': { chapterId: 's-not-your-typical-c9', progress: 1, updatedAt: now - 2 * D },
      's-me-tornei-serva': { chapterId: 's-me-tornei-serva-c2', progress: 0.3, updatedAt: now - 5 * D },
    },
  }

  const comments = [
    {
      id: 'cm-1',
      seriesId: 's-santa-falsa',
      chapterId: 's-santa-falsa-c1',
      userId: 'u-leitora',
      text: 'O final desse capítulo me pegou desprevenida. Já quero o próximo!',
      createdAt: now - 20 * H,
    },
    {
      id: 'cm-2',
      seriesId: 's-ser-uma-vila-nao-e-muito-melhor',
      chapterId: 's-ser-uma-vila-nao-e-muito-melhor-c1',
      userId: 'u-admin',
      text: 'Bem-vindos ao Manna! Deixem aqui o que acharam do primeiro capítulo.',
      createdAt: now - 4 * D,
    },
  ]

  const notifications = [
    {
      id: 'n-welcome-criadora',
      userId: 'u-criadora',
      type: 'info',
      title: 'Série enviada para revisão',
      body: '"Uma Promessa que Não Era Minha" está na fila de moderação.',
      href: '/studio/',
      read: false,
      createdAt: now - 6 * H,
    },
    {
      id: 'n-welcome-leitora',
      userId: 'u-leitora',
      type: 'chapter',
      title: 'Novo capítulo de A Santa Falsa',
      body: 'O capítulo 10 acabou de sair.',
      href: '/ler/?obra=s-santa-falsa&cap=10',
      read: false,
      createdAt: now - 2 * H,
    },
  ]

  return {
    version: SEED_VERSION,
    session: null,
    users,
    series,
    chapters,
    favorites: { 'u-leitora': ['s-santa-falsa', 's-not-your-typical', 's-ser-uma-vila-nao-e-muito-melhor'] },
    history,
    ratings: {},
    comments,
    notifications,
    moderationLog: [],
    prefs: { readerWidth: 'normal', readerGap: false },
  }
}
