'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowRight, BarChart3, Clock, Flame, History, PenTool, ShieldCheck, Sparkles, Star, Upload } from 'lucide-react'
import { PageShell } from '@/components/layout/page-shell'
import { HeroCarousel } from './hero'
import { Rail, RailItem, SeriesCard } from '@/components/manhwa/series-bits'
import { Button } from '@/components/ui/button'
import { MediaImage, SectionHeading, TimeAgo } from '@/components/ui/misc'
import { useAppState, useCurrentUser, useHydrated } from '@/lib/hooks'
import { continueReading, latestUpdates, publishedSeries, ratingOf } from '@/lib/api'
import { GENRES } from '@/lib/seed'

function SeeAll({ href, children = 'Ver tudo' }) {
  return (
    <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

function ContinueReading() {
  const state = useAppState()
  const user = useCurrentUser()
  const hydrated = useHydrated()
  const items = useMemo(() => (user ? continueReading(state, user.id).slice(0, 6) : []), [state, user])
  if (!hydrated || !items.length) return null

  return (
    <section className="container mt-14">
      <SectionHeading title="Continue lendo" icon={History} action={<SeeAll href="/biblioteca/">Biblioteca</SeeAll>} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ series, chapter, progress, total, updatedAt }) => {
          const done = progress >= 1 && chapter.number >= total
          const nextNumber = progress >= 1 && chapter.number < total ? chapter.number + 1 : chapter.number
          return (
            <Link
              key={series.id}
              href={`/ler/?obra=${series.id}&cap=${nextNumber}`}
              className="group flex gap-4 rounded-2xl border bg-card p-3 transition hover:border-primary/40 hover:shadow-lg"
            >
              <MediaImage src={series.cover} alt="" className="h-24 w-[4.5rem] shrink-0 rounded-lg object-cover" />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                <p className="line-clamp-1 font-semibold group-hover:text-primary">{series.title}</p>
                <p className="text-xs text-muted-foreground">
                  {done ? 'Você está em dia' : progress >= 1 ? `Próximo: capítulo ${nextNumber}` : `Capítulo ${chapter.number} de ${total}`} · <TimeAgo date={updatedAt} />
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${Math.round(((chapter.number - 1 + progress) / total) * 100)}%` }} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function LatestUpdates() {
  const state = useAppState()
  const items = useMemo(() => latestUpdates(state, 8), [state])
  return (
    <section className="container mt-16">
      <SectionHeading title="Últimos lançamentos" subtitle="Capítulos que acabaram de sair" icon={Clock} action={<SeeAll href="/explorar/?ordem=recent" />} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ series, chapter }) => (
          <Link
            key={chapter.id}
            href={`/ler/?obra=${series.id}&cap=${chapter.number}`}
            className="group flex items-center gap-3 rounded-2xl border bg-card p-2.5 pr-4 transition hover:border-primary/40 hover:shadow-md"
          >
            <MediaImage src={series.cover} alt="" loading="lazy" className="h-16 w-12 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-semibold group-hover:text-primary">{series.title}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">Cap. {chapter.number}</span> · <TimeAgo date={chapter.createdAt} />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function GenreGrid() {
  return (
    <section className="container mt-16">
      <SectionHeading title="Explore por gênero" icon={Sparkles} />
      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => (
          <Link
            key={g}
            href={`/explorar/?genero=${encodeURIComponent(g)}`}
            className="rounded-full border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          >
            {g}
          </Link>
        ))}
      </div>
    </section>
  )
}

function CreatorCta() {
  const features = [
    { icon: Upload, title: 'Upload em lote', text: 'Arraste as páginas, reordene e publique. As imagens são otimizadas no navegador.' },
    { icon: ShieldCheck, title: 'Revisão com feedback', text: 'Cada envio passa pela moderação, que aprova ou pede ajustes com comentário.' },
    { icon: BarChart3, title: 'Estatísticas', text: 'Acompanhe leituras, favoritos e avaliações de cada série e capítulo.' },
  ]
  return (
    <section className="container mt-20">
      <div className="dark relative overflow-hidden rounded-3xl border border-amber-400/20 bg-stone-950 p-8 text-foreground sm:p-12">
        <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30">
              <PenTool className="h-3.5 w-3.5" /> Creator Studio
            </span>
            <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">Sua história merece leitores.</h2>
            <p className="text-white/70">Publique séries e capítulos, acompanhe o que os leitores acham e cresça junto com a comunidade do Manna.</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="/entrar/?modo=criador">Começar a publicar</Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <Link href="/studio/">Abrir o Studio</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">{f.title}</p>
                  <p className="mt-0.5 text-sm text-white/60">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomeView() {
  const state = useAppState()
  const { featured, trending, newest, topRated } = useMemo(() => {
    const all = publishedSeries(state)
    return {
      featured: all.filter((s) => s.featured),
      trending: [...all].sort((a, b) => b.views - a.views).slice(0, 10),
      newest: [...all].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12),
      topRated: [...all].sort((a, b) => ratingOf(state, b).value - ratingOf(state, a).value).slice(0, 12),
    }
  }, [state])

  return (
    <PageShell transparentHeader>
      <HeroCarousel items={featured} />
      <ContinueReading />

      <section className="container mt-14">
        <SectionHeading title="Em alta" subtitle="As séries mais lidas da semana" icon={Flame} action={<SeeAll href="/explorar/?ordem=popular" />} />
        <Rail>
          {trending.map((s, i) => (
            <RailItem key={s.id}>
              <SeriesCard series={s} rank={i + 1} priority={i < 4} />
            </RailItem>
          ))}
        </Rail>
      </section>

      <LatestUpdates />

      <section className="container mt-16">
        <SectionHeading title="Novidades" subtitle="Séries que chegaram agora ao Manna" icon={Sparkles} action={<SeeAll href="/explorar/?ordem=newest" />} />
        <Rail>
          {newest.map((s) => (
            <RailItem key={s.id}>
              <SeriesCard series={s} />
            </RailItem>
          ))}
        </Rail>
      </section>

      <GenreGrid />

      <section className="container mt-16">
        <SectionHeading title="Mais bem avaliados" subtitle="Notas dos leitores" icon={Star} action={<SeeAll href="/explorar/?ordem=rating" />} />
        <Rail>
          {topRated.map((s) => (
            <RailItem key={s.id}>
              <SeriesCard series={s} />
            </RailItem>
          ))}
        </Rail>
      </section>

      <CreatorCta />
    </PageShell>
  )
}
