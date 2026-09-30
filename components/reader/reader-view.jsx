'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowUp, ChevronLeft, ChevronRight, List, Settings2, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { DemoPage } from './demo-page'
import { Comments } from '@/components/manhwa/comments'
import { FavoriteButton } from '@/components/manhwa/series-bits'
import { Button } from '@/components/ui/button'
import { EmptyState, MediaImage } from '@/components/ui/misc'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAppState, useCurrentUser, useHydrated } from '@/lib/hooks'
import { canModerate, findSeries, isVisible, registerView, saveProgress, seriesChapters, setPrefs } from '@/lib/api'
import { getState } from '@/lib/store'
import { buildDemoPages } from '@/lib/demo-pages'
import { cn } from '@/lib/utils'

const WIDTHS = {
  narrow: { label: 'Estreita', className: 'max-w-lg' },
  normal: { label: 'Normal', className: 'max-w-2xl' },
  wide: { label: 'Larga', className: 'max-w-4xl' },
}

function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0)
  const [barsVisible, setBarsVisible] = useState(true)

  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const value = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1
        setProgress(value)
        const y = window.scrollY
        if (Math.abs(y - lastY) > 12) {
          setBarsVisible(y < lastY || y < 80 || value >= 1)
          lastY = y
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref])

  return { progress, barsVisible, setBarsVisible }
}

export function ReaderView() {
  const params = useSearchParams()
  const router = useRouter()
  const seriesId = params.get('obra')
  const number = Number(params.get('cap') || 1)
  const state = useAppState()
  const user = useCurrentUser()
  const hydrated = useHydrated()

  const data = useMemo(() => {
    const series = findSeries(state, seriesId)
    if (!series) return null
    const owner = user && (series.creatorId === user.id || canModerate(user))
    const chapters = seriesChapters(state, series.id, { all: !!owner })
    const index = chapters.findIndex((c) => c.number === number)
    const chapter = chapters[index]
    return { series, chapters, chapter, prev: chapters[index - 1], next: chapters[index + 1] }
  }, [state, seriesId, number, user])

  if (!data || !data.chapter || !isVisible(data.series, user)) {
    if (!hydrated) return <div className="min-h-screen bg-stone-950" />
    return (
      <div className="container flex min-h-screen items-center py-20">
        <EmptyState
          className="w-full"
          icon={SearchX}
          title="Capítulo não encontrado"
          action={
            <Button asChild>
              <Link href={data?.series ? `/obra/?id=${data.series.id}` : '/explorar/'}>Voltar</Link>
            </Button>
          }
        >
          Ele pode não existir ou ainda estar em revisão.
        </EmptyState>
      </div>
    )
  }

  // key = capítulo: trocar de capítulo remonta o leitor e zera o progresso.
  return <ChapterReader key={data.chapter.id} data={data} prefs={state.prefs || {}} hydrated={hydrated} router={router} />
}

function ChapterReader({ data, prefs, hydrated, router }) {
  const pagesRef = useRef(null)
  const { progress, barsVisible, setBarsVisible } = useScrollProgress(pagesRef)
  const { series, chapter } = data
  const pages = useMemo(() => (series && chapter ? chapter.pages || buildDemoPages(series, chapter) : []), [series, chapter])
  const width = WIDTHS[prefs.readerWidth] || WIDTHS.normal

  // Conta a leitura e oferece retomar de onde parou.
  const sid = series?.id
  const cid = chapter?.id
  useEffect(() => {
    if (!hydrated || !sid || !cid) return
    const s = getState()
    const current = s.chapters.find((c) => c.id === cid)
    document.title = `${findSeries(s, sid).title} · Cap. ${current.number} · Manna`
    registerView(sid, cid)
    window.scrollTo({ top: 0 })
    const entry = s.session ? s.history[s.session]?.[sid] : null
    // Abrir outro capítulo já o torna o "atual" na biblioteca.
    if (entry?.chapterId !== cid) saveProgress(sid, cid, 0)
    if (entry?.chapterId === cid && entry.progress > 0.05 && entry.progress < 0.97) {
      const target = entry.progress
      toast('Continuar de onde parou?', {
        description: `Você estava em ${Math.round(target * 100)}% deste capítulo.`,
        action: {
          label: 'Continuar',
          onClick: () => {
            const el = pagesRef.current
            if (el) window.scrollTo({ top: el.offsetTop + (el.offsetHeight - window.innerHeight) * target, behavior: 'smooth' })
          },
        },
        duration: 8000,
      })
    }
  }, [hydrated, sid, cid])

  // Salva o progresso enquanto rola (a API ignora mudanças pequenas).
  useEffect(() => {
    if (sid && cid && progress > 0) saveProgress(sid, cid, progress)
  }, [sid, cid, progress])

  // Atalhos de teclado: ← / → trocam de capítulo.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select, [contenteditable]')) return
      if (e.key === 'ArrowLeft' && data?.prev) router.push(`/ler/?obra=${series.id}&cap=${data.prev.number}`)
      if (e.key === 'ArrowRight' && data?.next) router.push(`/ler/?obra=${series.id}&cap=${data.next.number}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [data, series, router])

  const { chapters, prev, next } = data
  const go = (n) => router.push(`/ler/?obra=${series.id}&cap=${n}`)

  return (
    <div className="dark min-h-screen bg-stone-950 text-foreground">
      {/* Barra de progresso */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-white/5">
        <div className="h-full origin-left bg-gradient-to-r from-amber-400 to-orange-500 transition-transform duration-150" style={{ transform: `scaleX(${progress})` }} />
      </div>

      {/* Barra superior */}
      <header
        className={cn(
          'fixed inset-x-0 top-1 z-40 border-b border-white/10 bg-stone-950/85 backdrop-blur-xl transition-transform duration-300',
          !barsVisible && '-translate-y-[calc(100%+4px)]'
        )}
      >
        <div className="container flex h-14 items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Voltar para a obra">
            <Link href={`/obra/?id=${series.id}`}>
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{series.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              Capítulo {chapter.number}
              {chapter.title && ` — ${chapter.title}`}
            </p>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            <Button variant="ghost" size="icon" disabled={!prev} onClick={() => go(prev.number)} aria-label="Capítulo anterior">
              <ChevronLeft />
            </Button>
            <div className="relative">
              <List className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={chapter.number}
                onChange={(e) => go(e.target.value)}
                aria-label="Escolher capítulo"
                className="h-9 appearance-none rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {chapters.map((c) => (
                  <option key={c.id} value={c.number} className="bg-stone-900">
                    Cap. {c.number}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="ghost" size="icon" disabled={!next} onClick={() => go(next.number)} aria-label="Próximo capítulo">
              <ChevronRight />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Preferências de leitura">
                <Settings2 />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark">
              <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Largura</DropdownMenuLabel>
              {Object.entries(WIDTHS).map(([key, w]) => (
                <DropdownMenuItem key={key} onSelect={() => setPrefs({ readerWidth: key })} className={cn(prefs.readerWidth === key && 'text-primary')}>
                  {w.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setPrefs({ readerGap: !prefs.readerGap })}>
                {prefs.readerGap ? 'Juntar páginas' : 'Separar páginas'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Páginas */}
      <main className={cn('mx-auto pt-[3.75rem]', width.className)} onClick={() => setBarsVisible((v) => !v)}>
        <div ref={pagesRef} className={cn('flex flex-col', prefs.readerGap ? 'gap-4 py-4' : 'gap-0')}>
          {pages.map((page, i) =>
            typeof page === 'string' ? (
              <MediaImage key={i} src={page} alt={`Página ${i + 1}`} loading={i < 2 ? 'eager' : 'lazy'} className="block w-full select-none" draggable={false} />
            ) : (
              <DemoPage key={i} page={page} />
            )
          )}
        </div>
      </main>

      {/* Fim do capítulo */}
      <section className={cn('mx-auto space-y-10 px-4 py-12', width.className)}>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-sm text-muted-foreground">Fim do capítulo {chapter.number}</p>
          {next ? (
            <Link href={`/ler/?obra=${series.id}&cap=${next.number}`} className="group mt-4 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-3 pr-5 text-left text-stone-950 transition hover:brightness-110">
              <MediaImage src={series.cover} alt="" className="h-16 w-12 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Próximo</p>
                <p className="font-display text-lg font-semibold">
                  Capítulo {next.number}
                  {next.title && ` — ${next.title}`}
                </p>
              </div>
              <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <p className="mt-2 font-display text-xl">Você chegou ao capítulo mais recente 🎉</p>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <FavoriteButton seriesId={series.id} variant="outline" />
            <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <ArrowUp /> Topo
            </Button>
            <Button asChild variant="outline">
              <Link href={`/obra/?id=${series.id}`}>Todos os capítulos</Link>
            </Button>
          </div>
        </div>

        <Comments seriesId={series.id} chapterId={chapter.id} title="Comentários do capítulo" />
      </section>

      {/* Navegação inferior (mobile) */}
      <nav
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-stone-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-transform duration-300 sm:hidden',
          !barsVisible && 'translate-y-full'
        )}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-2">
          <Button variant="ghost" size="sm" disabled={!prev} onClick={() => go(prev.number)}>
            <ChevronLeft /> Anterior
          </Button>
          <span className="text-xs text-muted-foreground">{Math.round(progress * 100)}%</span>
          <Button variant="ghost" size="sm" disabled={!next} onClick={() => go(next.number)}>
            Próximo <ChevronRight />
          </Button>
        </div>
      </nav>
    </div>
  )
}
