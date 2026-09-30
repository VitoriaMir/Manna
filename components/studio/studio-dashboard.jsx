'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { BarChart3, Eye, Heart, Layers, MessageCircle, PenTool, Plus, Sparkles, Star } from 'lucide-react'
import { PageShell } from '@/components/layout/page-shell'
import { RequireAuth } from '@/components/auth/require-auth'
import { PublicationBadge, StatusBadge } from '@/components/manhwa/series-bits'
import { Button } from '@/components/ui/button'
import { Avatar, EmptyState, MediaImage, TimeAgo } from '@/components/ui/misc'
import { useAppState, useCurrentUser } from '@/lib/hooks'
import { becomeCreator, ratingOf } from '@/lib/api'
import { formatCompact, formatNumber } from '@/lib/utils'
import { toast } from 'sonner'

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Dashboard() {
  const state = useAppState()
  const user = useCurrentUser()

  const data = useMemo(() => {
    const mine = state.series.filter((s) => s.creatorId === user.id).sort((a, b) => b.updatedAt - a.updatedAt)
    const ids = new Set(mine.map((s) => s.id))
    const rows = mine.map((s) => {
      const chapters = state.chapters.filter((c) => c.seriesId === s.id)
      return {
        series: s,
        chapters: chapters.length,
        pendingChapters: chapters.filter((c) => c.publication !== 'published').length,
        favorites: Object.values(state.favorites).filter((l) => l.includes(s.id)).length,
        rating: ratingOf(state, s),
      }
    })
    const rated = rows.filter((r) => r.rating.votes)
    const avg = rated.length ? rated.reduce((a, r) => a + r.rating.value, 0) / rated.length : 0
    const comments = state.comments
      .filter((c) => ids.has(c.seriesId))
      .slice(0, 5)
      .map((c) => ({ ...c, user: state.users.find((u) => u.id === c.userId), series: mine.find((s) => s.id === c.seriesId) }))
    const totals = {
      views: mine.reduce((a, s) => a + s.views, 0),
      favorites: rows.reduce((a, r) => a + r.favorites, 0),
      chapters: rows.reduce((a, r) => a + r.chapters, 0),
      avg,
    }
    const maxViews = Math.max(1, ...mine.map((s) => s.views))
    return { rows, comments, totals, maxViews }
  }, [state, user.id])

  return (
    <div className="container py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Creator Studio</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Olá, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-muted-foreground">Gerencie suas séries, capítulos e acompanhe seus leitores.</p>
        </div>
        <Button asChild variant="gold" size="lg">
          <Link href="/studio/obra/">
            <Plus /> Nova série
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Eye} label="Leituras" value={formatCompact(data.totals.views)} hint={`${formatNumber(data.totals.views)} no total`} />
        <StatCard icon={Heart} label="Favoritos" value={formatNumber(data.totals.favorites)} />
        <StatCard icon={Star} label="Nota média" value={data.totals.avg ? data.totals.avg.toFixed(1) : '—'} />
        <StatCard icon={Layers} label="Capítulos" value={formatNumber(data.totals.chapters)} hint={`${data.rows.length} séries`} />
      </div>

      <div className="mt-10 grid gap-10 xl:grid-cols-[1fr_340px]">
        <section className="min-w-0">
          <h2 className="mb-4 font-display text-xl font-semibold">Minhas séries</h2>
          {data.rows.length ? (
            <ul className="space-y-3">
              {data.rows.map(({ series, chapters, pendingChapters, favorites, rating }) => (
                <li key={series.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <MediaImage src={series.cover} alt="" className="h-24 w-[4.5rem] shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <PublicationBadge publication={series.publication} />
                        <StatusBadge status={series.status} variant="muted" />
                        {pendingChapters > 0 && series.publication === 'published' && (
                          <span className="text-xs text-muted-foreground">{pendingChapters} cap. não publicado(s)</span>
                        )}
                      </div>
                      <p className="line-clamp-1 font-semibold">{series.title}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> {formatCompact(series.views)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" /> {favorites}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" /> {rating.votes ? rating.value.toFixed(1) : '—'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" /> {chapters} cap.
                        </span>
                      </div>
                      <div className="h-1.5 max-w-xs overflow-hidden rounded-full bg-muted" title="Leituras em relação à sua série mais lida">
                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${(series.views / data.maxViews) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-col lg:flex-row">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/studio/obra/?id=${series.id}`}>
                        <PenTool /> Gerenciar
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/obra/?id=${series.id}`}>
                        <Eye /> Ver
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="Sua primeira série começa aqui"
              action={
                <Button asChild variant="gold">
                  <Link href="/studio/obra/">
                    <Plus /> Criar série
                  </Link>
                </Button>
              }
            >
              Crie a série, envie os capítulos e mande para revisão. Assim que a moderação aprovar, ela aparece no catálogo.
            </EmptyState>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <MessageCircle className="h-4 w-4 text-primary" /> Comentários recentes
            </h2>
            {data.comments.length ? (
              <ul className="space-y-4">
                {data.comments.map((c) => (
                  <li key={c.id} className="flex gap-3">
                    <Avatar user={c.user} className="h-8 w-8" />
                    <div className="min-w-0 text-sm">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{c.user?.name}</span> em{' '}
                        <Link href={`/obra/?id=${c.seriesId}`} className="hover:text-primary">
                          {c.series?.title}
                        </Link>{' '}
                        · <TimeAgo date={c.createdAt} />
                      </p>
                      <p className="mt-0.5 line-clamp-3">{c.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Os comentários dos leitores nas suas séries aparecem aqui.</p>
            )}
          </div>
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-5 text-sm">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" /> Como publicar
            </h2>
            <ol className="list-decimal space-y-1.5 pl-4 text-muted-foreground">
              <li>Crie a série com capa, sinopse e gêneros.</li>
              <li>Adicione capítulos enviando as páginas.</li>
              <li>Envie para revisão.</li>
              <li>A moderação aprova ou pede ajustes — você é notificado(a).</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  )
}

function BecomeCreator() {
  return (
    <EmptyState
      icon={PenTool}
      title="Ative o Creator Studio"
      action={
        <Button
          variant="gold"
          onClick={() => {
            becomeCreator()
            toast.success('Creator Studio ativado!')
          }}
        >
          Quero publicar
        </Button>
      }
    >
      Sua conta é de leitura. Ative o Studio para publicar suas próprias séries — é grátis.
    </EmptyState>
  )
}

export function StudioDashboard() {
  return (
    <PageShell>
      <RequireAuth roles={['creator']} title="Entre para abrir o Creator Studio" description="Publique suas séries e acompanhe seus leitores." forbidden={<BecomeCreator />}>
        <Dashboard />
      </RequireAuth>
    </PageShell>
  )
}
