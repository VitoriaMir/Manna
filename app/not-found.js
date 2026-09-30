import Link from 'next/link'
import { Compass } from 'lucide-react'
import { PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Página não encontrada' }

export default function NotFound() {
  return (
    <PageShell>
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-8xl font-semibold text-gradient-gold">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">Esta página saiu do roteiro</h1>
        <p className="mt-2 max-w-md text-muted-foreground">O link pode estar quebrado ou a página foi removida. Que tal voltar para o catálogo?</p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="gold">
            <Link href="/">Página inicial</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/explorar/">
              <Compass /> Explorar
            </Link>
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
