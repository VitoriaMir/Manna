import Link from 'next/link'
import { asset, cn } from '@/lib/utils'

export function Logo({ className, compact = false }) {
  return (
    <Link href="/" className={cn('group flex items-center gap-2.5', className)} aria-label="Manna — página inicial">
      <span className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset('/images/logo-192.png')} alt="" width={36} height={36} className="h-9 w-9 rounded-xl object-cover ring-1 ring-amber-400/30 transition-transform group-hover:scale-105" />
        <span className="absolute -inset-1.5 -z-10 rounded-2xl bg-amber-400/25 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
      </span>
      {!compact && <span className="font-display text-xl font-semibold tracking-tight text-gradient-gold">Manna</span>}
    </Link>
  )
}
