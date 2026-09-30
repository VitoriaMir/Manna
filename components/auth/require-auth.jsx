'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Lock, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, Skeleton } from '@/components/ui/misc'
import { useCurrentUser, useHydrated } from '@/lib/hooks'

/**
 * Protege uma área por login e (opcionalmente) por papel.
 * `roles` aceita qualquer um dos papéis listados.
 */
export function RequireAuth({ roles, children, title = 'Entre para continuar', description, forbidden }) {
  const hydrated = useHydrated()
  const user = useCurrentUser()
  const pathname = usePathname()

  if (!hydrated) {
    return (
      <div className="container space-y-4 py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={Lock}
          title={title}
          action={
            <Button asChild variant="gold">
              <Link href={`/entrar/?next=${encodeURIComponent(pathname)}`}>Entrar ou criar conta</Link>
            </Button>
          }
        >
          {description}
        </EmptyState>
      </div>
    )
  }

  if (roles && !roles.some((r) => user.roles.includes(r))) {
    return (
      <div className="container py-16">
        {forbidden || (
          <EmptyState
            icon={ShieldAlert}
            title="Acesso restrito"
            action={
              <Button asChild variant="outline">
                <Link href="/">Voltar ao início</Link>
              </Button>
            }
          >
            Sua conta não tem permissão para acessar esta área.
          </EmptyState>
        )}
      </div>
    )
  }

  return children
}
