'use client'

import { useMediaSrc } from '@/lib/media'
import { useHydrated } from '@/lib/store'
import { cn, initials, timeAgo } from '@/lib/utils'

/** Tempo relativo renderizado só no cliente (evita divergência de hidratação). */
export function TimeAgo({ date, className }) {
  const hydrated = useHydrated()
  return (
    <time dateTime={new Date(date).toISOString()} className={className}>
      {hydrated ? timeAgo(date) : ' '}
    </time>
  )
}

export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-lg bg-muted', className)} {...props} />
}

/** <img> que entende referências do IndexedDB e o basePath do Pages. */
export function MediaImage({ src, alt = '', className, fallbackClassName, ...props }) {
  const url = useMediaSrc(src)
  if (!url) return <div aria-hidden className={cn('bg-gradient-to-br from-stone-700 to-stone-900', className, fallbackClassName)} />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} decoding="async" {...props} />
}

export function Avatar({ user, className }) {
  const url = useMediaSrc(user?.avatar)
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-xs font-bold text-stone-950',
        'h-9 w-9',
        className
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(user?.name)
      )}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, children, action, className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {children && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function SectionHeading({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
