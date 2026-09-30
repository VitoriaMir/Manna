'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github } from 'lucide-react'
import { SiteHeader, isActive, useNavItems } from './site-header'
import { Logo } from './logo'
import { cn } from '@/lib/utils'

function MobileNav() {
  const pathname = usePathname()
  const nav = useNavItems().slice(0, 5)
  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {nav.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors', active ? 'text-primary' : 'text-muted-foreground')}
            >
              <item.icon className={cn('h-5 w-5', active && 'fill-primary/20')} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-surface pb-24 lg:pb-0">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Leia, publique e descubra manhwas em um só universo. Leitura vertical contínua, biblioteca pessoal e ferramentas para quem cria.
          </p>
          <p className="max-w-sm rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            Versão de demonstração: contas, favoritos e publicações ficam salvos apenas neste navegador. As capas pertencem aos seus respectivos autores e são usadas só para ilustrar.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Plataforma</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/explorar/">Explorar catálogo</Link></li>
            <li><Link className="hover:text-foreground" href="/biblioteca/">Minha biblioteca</Link></li>
            <li><Link className="hover:text-foreground" href="/studio/">Creator Studio</Link></li>
            <li><Link className="hover:text-foreground" href="/entrar/">Entrar ou criar conta</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Projeto</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a className="inline-flex items-center gap-1.5 hover:text-foreground" href="https://github.com/VitoriaMir/Manna" target="_blank" rel="noreferrer">
                <Github className="h-4 w-4" /> Código no GitHub
              </a>
            </li>
            <li>Feito com Next.js e Tailwind CSS</li>
            <li suppressHydrationWarning>© {new Date().getFullYear()} Manna</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

/** Estrutura padrão das páginas: header fixo, conteúdo, rodapé e navegação móvel. */
export function PageShell({ children, transparentHeader = false, className, footer = true }) {
  return (
    <>
      <a href="#conteudo" className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Pular para o conteúdo
      </a>
      <SiteHeader transparent={transparentHeader} />
      <main id="conteudo" className={cn(!transparentHeader && 'pt-16', className)}>
        {children}
      </main>
      {footer && <SiteFooter />}
      <MobileNav />
    </>
  )
}
