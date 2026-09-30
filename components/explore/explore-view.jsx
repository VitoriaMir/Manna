'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Search, SearchX, SlidersHorizontal, Star, X } from 'lucide-react'
import { PageShell } from '@/components/layout/page-shell'
import { SeriesCard } from '@/components/manhwa/series-bits'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/misc'
import { useAppState, useDebounced } from '@/lib/hooks'
import { SORTS, searchSeries } from '@/lib/api'
import { GENRES, STATUS_LABEL } from '@/lib/seed'
import { cn } from '@/lib/utils'

function Chip({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary/50 hover:text-primary'
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function ExploreView() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const state = useAppState()

  const [q, setQ] = useState(params.get('q') || '')
  const genres = useMemo(() => params.getAll('genero'), [params])
  const status = params.get('status') || ''
  const sort = params.get('ordem') || 'popular'
  const minRating = Number(params.get('nota') || 0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const debouncedQ = useDebounced(q, 200)

  const update = (patch) => {
    const next = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(patch)) {
      next.delete(key)
      ;[].concat(value).filter((v) => v !== '' && v !== 0 && v != null).forEach((v) => next.append(key, v))
    }
    const qs = next.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  // Mantém ?q= sincronizado com o campo de busca.
  useEffect(() => {
    if ((params.get('q') || '') !== debouncedQ) update({ q: debouncedQ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ])

  // Busca feita no cabeçalho enquanto já estamos nesta página.
  useEffect(() => {
    setQ(params.get('q') || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('q')])

  const results = useMemo(() => searchSeries(state, { q: debouncedQ, genres, status, sort, minRating }), [state, debouncedQ, genres, status, sort, minRating])
  const activeCount = genres.length + (status ? 1 : 0) + (minRating ? 1 : 0)

  const toggleGenre = (g) => update({ genero: genres.includes(g) ? genres.filter((x) => x !== g) : [...genres, g] })
  const clearAll = () => {
    setQ('')
    router.replace(pathname, { scroll: false })
  }

  const filters = (
    <div className="space-y-7">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Status</h3>
        <div className="flex flex-wrap gap-2">
          <Chip active={!status} onClick={() => update({ status: '' })}>
            Todos
          </Chip>
          {Object.entries(STATUS_LABEL).map(([key, label]) => (
            <Chip key={key} active={status === key} onClick={() => update({ status: status === key ? '' : key })}>
              {label}
            </Chip>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Nota mínima</h3>
        <div className="flex flex-wrap gap-2">
          {[0, 4, 4.5].map((n) => (
            <Chip key={n} active={minRating === n} onClick={() => update({ nota: n })}>
              {n ? (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-current" /> {n.toFixed(1)}+
                </span>
              ) : (
                'Qualquer'
              )}
            </Chip>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">
          Gêneros <span className="font-normal text-muted-foreground">(combine vários)</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Chip key={g} active={genres.includes(g)} onClick={() => toggleGenre(g)}>
              {g}
            </Chip>
          ))}
        </div>
      </div>
      {(activeCount > 0 || q) && (
        <Button variant="outline" className="w-full" onClick={clearAll}>
          <X /> Limpar filtros
        </Button>
      )}
    </div>
  )

  return (
    <PageShell>
      <div className="container py-8 sm:py-12">
        <div className="mb-8 space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Explorar</h1>
          <p className="text-muted-foreground">Encontre sua próxima obsessão entre as séries do Manna.</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">{filters}</div>
          </aside>

          <div className="min-w-0 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Título, autor, gênero ou palavra da sinopse…"
                  className="h-11 rounded-xl pl-10 pr-10"
                  aria-label="Buscar séries"
                />
                {q && (
                  <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Limpar busca">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <Select value={sort} onChange={(e) => update({ ordem: e.target.value === 'popular' ? '' : e.target.value })} className="flex-1 sm:w-56" aria-label="Ordenar por">
                  {Object.entries(SORTS).map(([key, s]) => (
                    <option key={key} value={key}>
                      {s.label}
                    </option>
                  ))}
                </Select>
                <Button variant="outline" className="relative h-10 lg:hidden" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>
                  <SlidersHorizontal /> Filtros
                  {activeCount > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">{activeCount}</span>}
                </Button>
              </div>
            </div>

            {filtersOpen && <div className="animate-fade-up rounded-2xl border bg-card p-5 lg:hidden">{filters}</div>}

            {(genres.length > 0 || status) && (
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button key={g} onClick={() => toggleGenre(g)} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20">
                    {g} <X className="h-3.5 w-3.5" />
                  </button>
                ))}
                {status && (
                  <button onClick={() => update({ status: '' })} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20">
                    {STATUS_LABEL[status]} <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground" aria-live="polite">
              {results.length} {results.length === 1 ? 'série encontrada' : 'séries encontradas'}
            </p>

            {results.length ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {results.map((s, i) => (
                  <SeriesCard key={s.id} series={s} priority={i < 5} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title="Nada encontrado"
                action={
                  <Button variant="outline" onClick={clearAll}>
                    Limpar filtros
                  </Button>
                }
              >
                Tente outras palavras ou remova alguns filtros.
              </EmptyState>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
