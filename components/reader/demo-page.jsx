'use client'

import { MediaImage } from '@/components/ui/misc'
import { cn } from '@/lib/utils'

/** Renderiza uma página gerada por lib/demo-pages.js. */
export function DemoPage({ page }) {
  if (page.kind === 'title') {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 px-8 text-center">
        <span className="h-px w-16 bg-amber-400/60" />
        <h2 className="font-display text-3xl font-semibold leading-tight text-amber-100 sm:text-4xl">{page.title}</h2>
        <p className="text-sm uppercase tracking-[0.25em] text-amber-300/80">{page.subtitle}</p>
        <span className="h-px w-16 bg-amber-400/60" />
      </div>
    )
  }

  if (page.kind === 'text' || page.kind === 'end') {
    return (
      <div className={cn('flex items-center justify-center bg-stone-950 px-10 text-center', page.kind === 'end' ? 'aspect-[16/9]' : 'aspect-[16/10]')}>
        <p className={cn('font-display leading-relaxed text-stone-100', page.kind === 'end' ? 'text-3xl italic text-amber-200' : 'text-xl sm:text-2xl')}>
          {page.text}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden bg-stone-900', page.tall ? 'aspect-[3/4]' : 'aspect-[4/3]')}>
      <MediaImage
        src={page.cover}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: page.focus, transform: `scale(${page.zoom})`, transformOrigin: page.focus }}
      />
      {page.tint && <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-transparent to-black/60 mix-blend-multiply" />}

      {page.narration && (
        <div className="absolute left-4 top-4 max-w-[70%] border-2 border-stone-900 bg-amber-50 px-3.5 py-2 text-left font-display text-sm leading-snug text-stone-900 shadow-lg sm:text-base">
          {page.narration}
        </div>
      )}

      {page.dialogue && (
        <div className={cn('absolute bottom-6 max-w-[65%]', page.dialogue.side === 'left' ? 'left-5' : 'right-5')}>
          <div className="relative rounded-[1.75rem] border-2 border-stone-900 bg-white px-5 py-3 text-center text-sm font-semibold leading-snug text-stone-900 shadow-lg sm:text-base">
            {page.dialogue.text}
            <span
              className={cn(
                'absolute -top-3 h-5 w-5 rotate-45 border-l-2 border-t-2 border-stone-900 bg-white',
                page.dialogue.side === 'left' ? 'left-8' : 'right-8'
              )}
            />
          </div>
        </div>
      )}

      {page.sfx && (
        <span
          className="absolute right-6 top-1/3 -rotate-12 font-display text-5xl font-black italic tracking-tight text-amber-300 sm:text-6xl"
          style={{ WebkitTextStroke: '2px #1c1917', textShadow: '4px 4px 0 #1c1917' }}
        >
          {page.sfx}
        </span>
      )}
    </div>
  )
}
