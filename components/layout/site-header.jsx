'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  Bell,
  BookMarked,
  Compass,
  Home,
  LogIn,
  LogOut,
  Menu,
  Moon,
  PenTool,
  Search,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react'
import { Logo } from './logo'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/misc'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppState, useCurrentUser, useHydrated } from '@/lib/hooks'
import { canModerate, hasRole, logout, markNotificationsRead, moderationQueue } from '@/lib/api'
import { cn, timeAgo } from '@/lib/utils'
import { ROLE_LABEL } from '@/lib/seed'

export function useNavItems() {
  const user = useCurrentUser()
  return useMemo(() => {
    const items = [
      { href: '/', label: 'Início', icon: Home },
      { href: '/explorar/', label: 'Explorar', icon: Compass },
      { href: '/biblioteca/', label: 'Biblioteca', icon: BookMarked },
    ]
    if (hasRole(user, 'creator')) items.push({ href: '/studio/', label: 'Studio', icon: PenTool })
    if (canModerate(user)) items.push({ href: '/moderacao/', label: 'Moderação', icon: ShieldCheck })
    return items
  }, [user])
}

export function isActive(pathname, href) {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href.replace(/\/$/, ''))
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const dark = !hydrated || resolvedTheme !== 'light'
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(dark ? 'light' : 'dark')} aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'} title="Alternar tema">
      {dark ? <Sun /> : <Moon />}
    </Button>
  )
}

function Notifications({ user }) {
  const state = useAppState()
  const router = useRouter()
  const items = useMemo(() => state.notifications.filter((n) => n.userId === user.id).slice(0, 8), [state.notifications, user.id])
  const unread = items.filter((n) => !n.read).length
  const pending = canModerate(user) ? moderationQueue(state).length : 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notificações${unread ? ` (${unread} não lidas)` : ''}`}>
          <Bell />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-semibold">Notificações</p>
          {unread > 0 && (
            <button className="text-xs font-medium text-primary hover:underline" onClick={() => markNotificationsRead()}>
              Marcar todas como lidas
            </button>
          )}
        </div>
        {pending > 0 && (
          <DropdownMenuItem className="m-1.5 bg-primary/10" onSelect={() => router.push('/moderacao/')}>
            <ShieldCheck className="!text-primary" />
            <span>
              <strong>{pending}</strong> {pending === 1 ? 'item aguarda' : 'itens aguardam'} moderação
            </span>
          </DropdownMenuItem>
        )}
        <div className="max-h-96 overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>
          ) : (
            items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="items-start"
                onSelect={() => {
                  markNotificationsRead([n.id])
                  if (n.href) router.push(n.href)
                }}
              >
                <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-primary')} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug">{n.title}</span>
                  {n.body && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{n.body}</span>}
                  <span className="mt-1 block text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserMenu({ user }) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full ring-offset-background transition hover:ring-2 hover:ring-primary/50" aria-label="Menu da conta">
          <Avatar user={user} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="font-semibold">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
          <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-primary">{user.roles.map((r) => ROLE_LABEL[r]).join(' · ')}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push('/perfil/')}>
          <User /> Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push('/biblioteca/')}>
          <BookMarked /> Biblioteca
        </DropdownMenuItem>
        {hasRole(user, 'creator') && (
          <DropdownMenuItem onSelect={() => router.push('/studio/')}>
            <PenTool /> Creator Studio
          </DropdownMenuItem>
        )}
        {canModerate(user) && (
          <DropdownMenuItem onSelect={() => router.push('/moderacao/')}>
            <ShieldCheck /> Moderação
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            logout()
            router.push('/')
          }}
        >
          <LogOut /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function HeaderSearch({ className, onDone }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  return (
    <form
      role="search"
      className={cn('relative', className)}
      onSubmit={(e) => {
        e.preventDefault()
        router.push(`/explorar/${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
        onDone?.()
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar títulos, autores, gêneros…"
        aria-label="Buscar"
        className="h-10 w-full rounded-full border border-input bg-muted/60 pl-9 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/30"
      />
    </form>
  )
}

export function SiteHeader({ transparent = false }) {
  const pathname = usePathname()
  const user = useCurrentUser()
  const hydrated = useHydrated()
  const nav = useNavItems()
  const [scrolled, setScrolled] = useState(!transparent)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!transparent) return
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [transparent])

  const solid = scrolled || menuOpen
  const onDark = transparent && !solid

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-colors duration-300',
        solid ? 'border-b bg-background/85 backdrop-blur-xl' : 'bg-gradient-to-b from-black/70 to-transparent',
        onDark && 'dark text-foreground'
      )}
    >
      <div className="container flex h-16 items-center gap-4">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Principal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive(pathname, item.href) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <HeaderSearch className="hidden w-64 md:block xl:w-80" />
          <Button variant="ghost" size="icon" className="md:hidden" asChild aria-label="Buscar">
            <Link href="/explorar/">
              <Search />
            </Link>
          </Button>
          <ThemeToggle />
          {hydrated && user ? (
            <>
              <Notifications user={user} />
              <UserMenu user={user} />
            </>
          ) : (
            <Button asChild variant="gold" size="sm" className="ml-1 h-9 px-4">
              <Link href="/entrar/">
                <LogIn /> Entrar
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu />
          </Button>
        </div>
      </div>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent side="right" className="gap-6">
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <Logo />
          <HeaderSearch onDone={() => setMenuOpen(false)} />
          <nav className="grid gap-1" aria-label="Menu móvel">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 font-medium transition-colors hover:bg-accent',
                  isActive(pathname, item.href) && 'bg-primary/10 text-primary'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            {user && (
              <Link href="/perfil/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 font-medium hover:bg-accent">
                <User className="h-5 w-5" /> Meu perfil
              </Link>
            )}
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  )
}
