'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, BookOpen, Check, Eye, Heart, Layers, Pencil, Share2, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState, MediaImage, Skeleton, TimeAgo } from '@/components/ui/misc'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FavoriteButton, PublicationBadge, RatingInput, RatingValue, SeriesCard, StatusBadge } from './series-bits'
import { Comments } from './comments'
import { useAppState, useCurrentUser, useHydrated } from '@/lib/hooks'
import { creatorName, findSeries, hasRole, isVisible, publishedSeries, seriesChapters } from '@/lib/api'
import { cn, formatCompact, formatNumber } from '@/lib/utils'

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-primary" />
      <div className="leading-tight">
        <p className="font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function ChapterList({ series, chapters, entry }) {
  const [desc, setDesc] = useState(true)
  const sorted = desc ? [...chapters].reverse() : chapters
  const isRead = (ch) => entry && (ch.number < entry.chapterNumber || (ch.number === entry.chapterNumber && entry.progress >= 1))

  if (!chapters.length) return <EmptyState icon={Layers} title="Nenhum capítulo publicado ainda" />

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{chapters.length} capítulos</p>
        <Button variant="ghost" size="sm" onClick={() => setDesc(!desc)}>
          <ArrowDownUp /> {desc ? 'Mais recentes' : 'Mais antigos'}
        </Button>
      </div>
      <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
        {sorted.map((ch) => {
          const current = entry?.chapterNumber === ch.number && entry.progress < 1
          return (
            <li key={ch.id}>
              <Link href={`/ler/?obra=${series.id}&cap=${ch.number}`} className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-accent/60">
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-semibold',
                    current ? 'bg-primary text-primary-foreground' : isRead(ch) ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                  )}
                >
                  {isRead(ch) ? <Check className="h-4 w-4" /> : ch.number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('line-clamp-1 font-medium group-hover:text-primary', isRead(ch) && 'text-muted-foreground')}>
                    Capítulo {ch.number}
                    {ch.title && <span className="font-normal text-muted-foreground"> — {ch.title}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <TimeAgo date={ch.createdAt} /> · {formatCompact(ch.views)} leituras
                    {current && <span className="ml-1 font-semibold text-primary">· parou em {Math.round(entry.progress * 100)}%</span>}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function SeriesView() {
  const params = useSearchParams()
  const id = params.get('id')
  const state = useAppState()
  const user = useCurrentUser()
  const hydrated = useHydrated()

  const data = useMemo(() => {
    const series = findSeries(state, id)
    if (!series) return null
    const chapters = seriesChapters(state, series.id)
    const favCount = Object.values(state.favorites).filter((l) => l.includes(series.id)).length
    const raw = user ? state.history[user.id]?.[series.id] : null
    const entryChapter = raw && state.chapters.find((c) => c.id === raw.chapterId)
    const entry = entryChapter ? { ...raw, chapterNumber: entryChapter.number } : null
    const related = publishedSeries(state)
      .filter((s) => s.id !== series.id)
      .map((s) => ({ s, score: s.genres.filter((g) => series.genres.includes(g)).length }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.s.views - a.s.views)
      .slice(0, 6)
      .map((x) => x.s)
    return { series, chapters, favCount, entry, related, creator: creatorName(state, series) }
  }, [state, id, user])

  const title = data?.series.title
  useEffect(() => {
    if (title) document.title = `${title} · Manna`
  }, [title])

  if (!hydrated && !data) {
    return (
      <PageShell>
        <div className="container grid gap-8 py-10 md:grid-cols-[280px_1fr]">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </PageShell>
    )
  }

  if (!data || !isVisible(data.series, user)) {
    return (
      <PageShell>
        <div className="container py-20">
          <EmptyState
            icon={SearchX}
            title="Série não encontrada"
            action={
              <Button asChild>
                <Link href="/explorar/">Explorar o catálogo</Link>
              </Button>
            }
          >
            Ela pode ter sido removida ou ainda não foi publicada.
          </EmptyState>
        </div>
      </PageShell>
    )
  }

  const { series, chapters, favCount, entry, related, creator } = data
  const canEdit = user && (series.creatorId === user.id || hasRole(user, 'admin'))
  const continueNumber = entry ? (entry.progress >= 1 && entry.chapterNumber < chapters.length ? entry.chapterNumber + 1 : entry.chapterNumber) : 1

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: series.title, url })
      else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copiado!')
      }
    } catch {
      /* cancelado */
    }
  }

  return (
    <PageShell transparentHeader>
      <section className="dark relative isolate overflow-hidden bg-stone-950 text-foreground">
        <MediaImage src={series.cover} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-50 blur-2xl" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-black/60 to-black/50" />
        <div className="container grid gap-8 pb-10 pt-24 md:grid-cols-[260px_1fr] md:items-end md:pt-32 lg:grid-cols-[300px_1fr]">
          <MediaImage
            src={series.cover}
            alt={`Capa de ${series.title}`}
            className="mx-auto aspect-[3/4] w-48 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20 md:w-full"
          />
          <div className="space-y-5 text-white">
            {series.publication !== 'published' && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-200">
                <PublicationBadge publication={series.publication} /> Só você e a moderação veem esta página.
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={series.status} />
              {series.genres.map((g) => (
                <Link key={g} href={`/explorar/?genero=${encodeURIComponent(g)}`}>
                  <Badge variant="glass" className="hover:border-amber-300/50">
                    {g}
                  </Badge>
                </Link>
              ))}
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{series.title}</h1>
              <p className="mt-2 text-white/70">
                por <span className="font-semibold text-amber-300">{creator}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <Stat icon={Eye} label="leituras" value={formatCompact(series.views)} />
              <Stat icon={Heart} label="favoritos" value={formatNumber(favCount)} />
              <Stat icon={Layers} label="capítulos" value={chapters.length} />
              <div className="flex items-center">
                <RatingValue series={series} className="text-lg text-amber-300" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {chapters.length > 0 && (
                <Button asChild variant="gold" size="lg" className="w-full sm:w-auto">
                  <Link href={`/ler/?obra=${series.id}&cap=${continueNumber}`}>
                    <BookOpen /> {entry ? `Continuar · cap. ${continueNumber}` : 'Ler capítulo 1'}
                  </Link>
                </Button>
              )}
              <FavoriteButton seriesId={series.id} variant="glass" size="lg" className="flex-1 sm:flex-none" />
              <Button variant="glass" size="lg" onClick={share} aria-label="Compartilhar">
                <Share2 />
              </Button>
              {canEdit && (
                <Button asChild variant="glass" size="lg">
                  <Link href={`/studio/obra/?id=${series.id}`}>
                    <Pencil /> Editar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mt-8 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-8">
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Sinopse</h2>
            <p className="max-w-3xl whitespace-pre-line leading-relaxed text-muted-foreground">{series.description}</p>
            <div className="rounded-2xl border bg-card p-4">
              <p className="mb-2 text-sm font-medium">Sua avaliação</p>
              <RatingInput series={series} />
            </div>
          </div>

          <Tabs defaultValue="chapters">
            <TabsList>
              <TabsTrigger value="chapters">
                <Layers /> Capítulos
              </TabsTrigger>
              <TabsTrigger value="comments">Comentários</TabsTrigger>
            </TabsList>
            <TabsContent value="chapters">
              <ChapterList series={series} chapters={chapters} entry={entry} />
            </TabsContent>
            <TabsContent value="comments">
              <Comments seriesId={series.id} />
            </TabsContent>
          </Tabs>
        </div>

        {related.length > 0 && (
          <aside className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Você também pode gostar</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
              {related.map((s) => (
                <SeriesCard key={s.id} series={s} />
              ))}
            </div>
          </aside>
        )}
      </div>
    </PageShell>
  )
}
