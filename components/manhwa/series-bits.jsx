'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MediaImage } from '@/components/ui/misc'
import { useAppState, useCurrentUser } from '@/lib/hooks'
import { rateSeries, ratingOf, toggleFavorite, userRating } from '@/lib/api'
import { PUBLICATION_LABEL, STATUS_LABEL } from '@/lib/seed'
import { cn, formatCompact } from '@/lib/utils'
import { toast } from 'sonner'

export function StatusBadge({ status, className, variant }) {
  const tone = { ongoing: 'success', completed: 'secondary', hiatus: 'warning' }[status] || 'muted'
  return (
    <Badge variant={variant || tone} className={className}>
      {STATUS_LABEL[status] || status}
    </Badge>
  )
}

export function PublicationBadge({ publication, className }) {
  const tone = { draft: 'muted', review: 'warning', published: 'success', rejected: 'destructive' }[publication]
  return (
    <Badge variant={tone} className={className}>
      {PUBLICATION_LABEL[publication]}
    </Badge>
  )
}

export function RatingValue({ series, className }) {
  const state = useAppState()
  const { value } = ratingOf(state, series)
  if (!value) return <span className={cn('text-xs text-muted-foreground', className)}>Sem notas</span>
  return (
    <span className={cn('inline-flex items-center gap-1 font-semibold text-amber-500 dark:text-amber-400', className)}>
      <Star className="h-3.5 w-3.5 fill-current" />
      {value.toFixed(1)}
    </span>
  )
}

/** Card de capa usado em grades e trilhos. */
export function SeriesCard({ series, rank, subtitle, badge, className, priority = false }) {
  const state = useAppState()
  const { value } = ratingOf(state, series)
  return (
    <Link href={`/obra/?id=${series.id}`} className={cn('group block focus-visible:outline-none', className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted shadow-md ring-1 ring-black/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-amber-900/20 group-focus-visible:ring-2 group-focus-visible:ring-ring dark:ring-white/5">
        <MediaImage
          src={series.cover}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0" />
        {rank && (
          <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-br-xl bg-gradient-to-br from-amber-400 to-orange-500 font-display text-lg font-bold text-stone-950">
            {rank}
          </span>
        )}
        {badge && <div className="absolute right-2 top-2">{badge}</div>}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-2.5 text-xs text-white">
          {value ? (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
              <Star className="h-3 w-3 fill-current" />
              {value.toFixed(1)}
            </span>
          ) : (
            <span />
          )}
          {series.views > 0 && <span className="opacity-80">{formatCompact(series.views)} leituras</span>}
        </div>
      </div>
      <div className="mt-2.5 space-y-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">{series.title}</h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">{subtitle ?? series.genres.slice(0, 2).join(' · ')}</p>
      </div>
    </Link>
  )
}

/** Trilho horizontal com rolagem por setas (desktop) e toque (mobile). */
export function Rail({ children, className }) {
  const ref = useRef(null)
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <div className={cn('group/rail relative', className)}>
      <div ref={ref} className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {children}
      </div>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => scroll(-1)}
        aria-label="Anterior"
        className="absolute -left-4 top-[38%] hidden rounded-full shadow-lg opacity-0 transition-opacity group-hover/rail:opacity-100 lg:flex"
      >
        <ChevronLeft />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => scroll(1)}
        aria-label="Próximo"
        className="absolute -right-4 top-[38%] hidden rounded-full shadow-lg opacity-0 transition-opacity group-hover/rail:opacity-100 lg:flex"
      >
        <ChevronRight />
      </Button>
    </div>
  )
}

export function RailItem({ children, className }) {
  return <div className={cn('w-[42%] shrink-0 snap-start sm:w-[30%] md:w-[22%] lg:w-[15.5%]', className)}>{children}</div>
}

export function FavoriteButton({ seriesId, className, variant = 'outline', size = 'default', showLabel = true }) {
  const state = useAppState()
  const user = useCurrentUser()
  const router = useRouter()
  const active = !!user && (state.favorites[user.id] || []).includes(seriesId)

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(active && 'border-rose-500/40 text-rose-500 hover:text-rose-500', className)}
      aria-pressed={active}
      onClick={() => {
        if (!user) {
          toast('Entre para montar sua biblioteca', { action: { label: 'Entrar', onClick: () => router.push('/entrar/') } })
          return
        }
        const added = toggleFavorite(seriesId)
        toast.success(added ? 'Adicionado à biblioteca' : 'Removido da biblioteca')
      }}
    >
      <Heart className={cn(active && 'fill-current')} />
      {showLabel && (active ? 'Na biblioteca' : 'Favoritar')}
    </Button>
  )
}

export function RatingInput({ series }) {
  const state = useAppState()
  const user = useCurrentUser()
  const router = useRouter()
  const mine = user ? userRating(state, series.id, user.id) : 0
  const [hover, setHover] = useState(0)
  const { value, votes } = useMemo(() => ratingOf(state, series), [state, series])
  const shown = hover || mine

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Sua avaliação">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={mine === n}
            aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => {
              if (!user) {
                toast('Entre para avaliar', { action: { label: 'Entrar', onClick: () => router.push('/entrar/') } })
                return
              }
              rateSeries(series.id, n)
              toast.success(`Você deu ${n} estrela${n > 1 ? 's' : ''}`)
            }}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star className={cn('h-6 w-6 transition-colors', n <= shown ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')} />
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {value ? (
          <>
            <strong className="text-foreground">{value.toFixed(1)}</strong> de 5 · {formatCompact(votes)} {votes === 1 ? 'voto' : 'votos'}
          </>
        ) : (
          'Seja a primeira pessoa a avaliar'
        )}
        {mine > 0 && <span className="ml-1 text-primary">· sua nota: {mine}</span>}
      </p>
    </div>
  )
}
