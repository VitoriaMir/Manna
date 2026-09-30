import { hashString, seededRandom } from './utils'

// O catálogo de demonstração não tem páginas reais de manhwa (direitos autorais),
// então cada capítulo é montado como uma sequência de painéis a partir da capa:
// enquadramentos diferentes, narração e diálogos — o suficiente para exercitar
// o leitor vertical de verdade (scroll, progresso, navegação entre capítulos).

const NARRATION = [
  'Naquela noite, o palácio inteiro parecia prender a respiração.',
  'Eu já tinha vivido este dia uma vez. E ele terminou mal.',
  'Dizem que toda história tem um preço. Eu só não sabia que seria o meu nome.',
  'O sino da torre tocou três vezes. Ninguém se lembrava da última vez que isso havia acontecido.',
  'Havia algo diferente no jeito como ele me olhava. Algo que o livro nunca descreveu.',
  'Se eu fosse mesmo a vilã, pelo menos seria uma vilã com um plano.',
  'O inverno chegou cedo naquele ano — e com ele, as cartas sem assinatura.',
  'Por um instante, esqueci que tudo isto era só uma história.',
  'Algumas promessas são feitas para serem quebradas. Esta não.',
  'A chuva apagou as pegadas. Mas não apagou o que eu vi.',
  'Três dias. Era tudo o que eu tinha para mudar o final.',
  'Pela primeira vez, o futuro que eu conhecia começou a mudar.',
]

const DIALOGUE = [
  'Você não deveria estar aqui.',
  'Então é verdade… você lembra de tudo.',
  'Não vou fugir desta vez.',
  'Quem te contou isso?',
  'Eu escolho o meu próprio final.',
  'Se é um jogo, pretendo vencer.',
  'Fique. Só esta noite.',
  'Você mudou. E eu não sei se gosto disso.',
  'Isso não estava no roteiro…',
  'Me prometa que vai voltar.',
  'O que exatamente você quer de mim?',
  'Já é tarde demais para voltar atrás.',
]

const SFX = ['TUM', 'CRAC', 'SHHH', 'BAM', 'TIC TAC', 'FWOOSH']

// Pontos focais usados para "enquadrar" a capa em painéis diferentes.
const FOCUS = ['50% 18%', '30% 35%', '70% 30%', '50% 60%', '20% 70%', '80% 55%', '50% 40%', '40% 85%']

export function buildDemoPages(series, chapter) {
  const rand = seededRandom(hashString(`${series.id}:${chapter.number}`))
  const pick = (list) => list[Math.floor(rand() * list.length)]
  const count = 7 + Math.floor(rand() * 4)
  const pages = []

  pages.push({
    kind: 'title',
    title: series.title,
    subtitle: `Capítulo ${chapter.number}${chapter.title ? ` — ${chapter.title}` : ''}`,
  })

  for (let i = 0; i < count; i++) {
    const r = rand()
    if (i > 0 && r < 0.18) {
      pages.push({ kind: 'text', text: pick(NARRATION) })
      continue
    }
    pages.push({
      kind: 'panel',
      cover: series.cover,
      focus: pick(FOCUS),
      zoom: 1.15 + rand() * 0.9,
      tall: rand() > 0.55,
      tint: rand() > 0.7,
      narration: rand() > 0.45 ? pick(NARRATION) : null,
      dialogue: rand() > 0.35 ? { text: pick(DIALOGUE), side: rand() > 0.5 ? 'left' : 'right' } : null,
      sfx: rand() > 0.85 ? pick(SFX) : null,
    })
  }

  pages.push({ kind: 'end', text: 'Continua…' })
  return pages
}
