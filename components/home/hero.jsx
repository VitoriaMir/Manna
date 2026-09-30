'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaImage } from '@/components/ui/misc'
import { FavoriteButton, RatingValue, StatusBadge } from '@/components/manhwa/series-bits'
import { cn, formatCompact } from '@/lib/utils'

const INTERVAL = 7000

export function HeroCarousel({ items }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = items.length
  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count])

  useEffect(() => {
    if (paused || count < 2) return
    const t = setTimeout(() => go(index + 1), INTERVAL)
    return () => clearTimeout(t)
  }, [index, paused, count, go])

  if (!count) return null
  const current = items[index]

  return (
    <section
      className="dark relative isolate flex min-h-[640px] items-end overflow-hidden bg-stone-950 text-foreground md:min-h-[720px] lg:items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrossel"
      aria-label="Destaques"
    >
      {/* Fundo: capa desfocada com a cor de destaque da série */}
      {items.map((s, i) => (
        <div key={s.id} aria-hidden className={cn('absolute inset-0 -z-10 transition-opacity duration-1000', i === index ? 'opacity-100' : 'opacity-0')}>
          <MediaImage src={s.cover} alt="" className="h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 40%, hsl(${s.accent} / 0.55), transparent 60%)` }} />
        </div>
      ))}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/40 to-black/40" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

      <div className="container grid items-center gap-10 pb-16 pt-28 lg:grid-cols-[1fr_auto] lg:gap-16 lg:pb-10">
        <div key={current.id} className="max-w-2xl animate-fade-up space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30">
              Destaque #{index + 1}
            </span>
            <StatusBadge status={current.status} />
            <RatingValue series={current} className="text-amber-300" />
            <span className="hidden text-white/60 sm:inline">· {formatCompact(current.views)} leituras</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl xl:text-6xl">{current.title}</h1>
            <p className="text-white/70">
              por <span className="font-semibold text-amber-300">{current.author}</span>
            </p>
          </div>

          <p className="line-clamp-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{current.description}</p>

          <div className="flex flex-wrap gap-2">
            {current.genres.map((g) => (
              <Link
                key={g}
                href={`/explorar/?genero=${encodeURIComponent(g)}`}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur transition hover:border-amber-300/50 hover:text-amber-200"
              >
                {g}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button asChild variant="gold" size="lg">
              <Link href={`/ler/?obra=${current.id}&cap=1`}>
                <BookOpen /> Começar a ler
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link href={`/obra/?id=${current.id}`} aria-label="Detalhes">
                <Info /> <span className="hidden sm:inline">Detalhes</span>
              </Link>
            </Button>
            <FavoriteButton seriesId={current.id} variant="glass" size="icon" showLabel={false} className="h-12 w-12 rounded-xl" />
          </div>
        </div>

        <Link
          href={`/obra/?id=${current.id}`}
          key={`cover-${current.id}`}
          className="group relative hidden w-72 animate-fade-in lg:block xl:w-80"
          aria-label={`Ver ${current.title}`}
        >
          <div className="absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-3xl" style={{ background: `hsl(${current.accent} / 0.8)` }} />
          <MediaImage
            src={current.cover}
            alt={`Capa de ${current.title}`}
            className="aspect-[3/4] w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/20 transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]"
          />
        </Link>
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-10">
          <div className="container flex items-center gap-4">
            <div className="flex flex-1 gap-2" role="tablist" aria-label="Escolher destaque">
              {items.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={s.title}
                  onClick={() => go(i)}
                  className="group relative h-1.5 max-w-16 flex-1 overflow-hidden rounded-full bg-white/20"
                >
                  {i === index && (
                    <span
                      key={`${index}-${paused}`}
                      className="absolute inset-0 origin-left rounded-full bg-amber-400"
                      style={paused ? undefined : { animation: `progress ${INTERVAL}ms linear both` }}
                    />
                  )}
                  {i < index && <span className="absolute inset-0 rounded-full bg-white/50" />}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="glass" size="icon-sm" className="rounded-full" onClick={() => go(index - 1)} aria-label="Destaque anterior">
                <ChevronLeft />
              </Button>
              <Button variant="glass" size="icon-sm" className="rounded-full" onClick={() => go(index + 1)} aria-label="Próximo destaque">
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
