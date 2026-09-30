'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { BookOpen, CheckCircle2, Heart, History, X } from 'lucide-react'
import { PageShell } from '@/components/layout/page-shell'
import { RequireAuth } from '@/components/auth/require-auth'
import { SeriesCard } from '@/components/manhwa/series-bits'
import { Button } from '@/components/ui/button'
import { EmptyState, MediaImage, TimeAgo } from '@/components/ui/misc'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppState, useCurrentUser } from '@/lib/hooks'
import { continueReading, findSeries, removeFromHistory } from '@/lib/api'

function ReadingRow({ item }) {
  const { series, chapter, progress, total, updatedAt } = item
  const finishedChapter = progress >= 1
  const nextNumber = finishedChapter && chapter.number < total ? chapter.number + 1 : chapter.number
  const overall = Math.round(((chapter.number - 1 + progress) / total) * 100)

  return (
    <li className="group flex items-center gap-4 rounded-2xl border bg-card p-3 transition hover:border-primary/40">
      <Link href={`/obra/?id=${series.id}`} className="shrink-0">
        <MediaImage src={series.cover} alt="" className="h-24 w-[4.5rem] rounded-lg object-cover" />
      </Link>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <Link href={`/obra/?id=${series.id}`} className="line-clamp-1 font-semibold hover:text-primary">
            {series.title}
          </Link>
          <p className="text-xs text-muted-foreground">
            Capítulo {chapter.number} de {total} · <TimeAgo date={updatedAt} />
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${overall}%` }} />
          </div>
          <span className="w-9 text-right text-xs font-medium text-muted-foreground">{overall}%</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        <Button asChild size="sm">
          <Link href={`/ler/?obra=${series.id}&cap=${nextNumber}`}>
            <BookOpen /> <span className="hidden sm:inline">{overall >= 100 ? 'Reler' : 'Continuar'}</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => removeFromHistory(series.id)} aria-label={`Remover ${series.title} do histórico`}>
          <X />
        </Button>
      </div>
    </li>
  )
}

function LibraryContent() {
  const state = useAppState()
  const user = useCurrentUser()

  const { reading, finished, favorites } = useMemo(() => {
    const all = continueReading(state, user.id)
    const done = (i) => i.progress >= 1 && i.chapter.number >= i.total
    return {
      reading: all.filter((i) => !done(i)),
      finished: all.filter(done),
      favorites: (state.favorites[user.id] || []).map((id) => findSeries(state, id)).filter((s) => s && s.publication === 'published'),
    }
  }, [state, user.id])

  const stats = [
    { icon: History, label: 'Lendo agora', value: reading.length },
    { icon: Heart, label: 'Favoritos', value: favorites.length },
    { icon: CheckCircle2, label: 'Em dia', value: finished.length },
  ]

  const explore = (
    <Button asChild>
      <Link href="/explorar/">Explorar séries</Link>
    </Button>
  )

  return (
    <div className="container py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Minha biblioteca</h1>
          <p className="mt-1 text-muted-foreground">Tudo o que você está lendo, em um lugar.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card px-4 py-3 text-center sm:min-w-28">
              <p className="font-display text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="reading">
        <TabsList>
          <TabsTrigger value="reading">
            <History /> Lendo
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart /> Favoritos
          </TabsTrigger>
          <TabsTrigger value="finished">
            <CheckCircle2 /> Em dia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reading">
          {reading.length ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {reading.map((item) => (
                <ReadingRow key={item.series.id} item={item} />
              ))}
            </ul>
          ) : (
            <EmptyState icon={BookOpen} title="Nenhuma leitura em andamento" action={explore}>
              Quando você abrir um capítulo, ele aparece aqui com o seu progresso.
            </EmptyState>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          {favorites.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {favorites.map((s) => (
                <SeriesCard key={s.id} series={s} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Heart} title="Nenhum favorito ainda" action={explore}>
              Toque no coração de uma série para guardá-la aqui e receber aviso de capítulos novos.
            </EmptyState>
          )}
        </TabsContent>

        <TabsContent value="finished">
          {finished.length ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {finished.map((item) => (
                <ReadingRow key={item.series.id} item={item} />
              ))}
            </ul>
          ) : (
            <EmptyState icon={CheckCircle2} title="Nada por aqui ainda">
              Séries em que você leu o capítulo mais recente aparecem aqui.
            </EmptyState>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function LibraryView() {
  return (
    <PageShell>
      <RequireAuth title="Sua biblioteca espera por você" description="Entre para salvar favoritos e continuar a leitura de onde parou, em qualquer série.">
        <LibraryContent />
      </RequireAuth>
    </PageShell>
  )
}

