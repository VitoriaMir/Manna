'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, Eye, EyeOff, Loader2, PenTool, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/layout/logo'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentUser, useHydrated } from '@/lib/hooks'
import { hasRole, login, register } from '@/lib/api'
import { DEMO_ACCOUNTS } from '@/lib/seed'
import { asset, cn } from '@/lib/utils'

const DEMO_ICONS = { 'u-leitora': BookOpen, 'u-criadora': PenTool, 'u-admin': ShieldCheck }

function PasswordInput({ id, ...props }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input id={id} type={show ? 'text' : 'password'} className="pr-10" {...props} />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground"
        aria-label={show ? 'Esconder senha' : 'Mostrar senha'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function passwordStrength(pw) {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export function AuthView() {
  const params = useSearchParams()
  const router = useRouter()
  const user = useCurrentUser()
  const hydrated = useHydrated()
  const creatorMode = params.get('modo') === 'criador'
  const next = params.get('next')

  const [tab, setTab] = useState(creatorMode ? 'register' : 'login')
  const [pending, setPending] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [form, setForm] = useState({ name: '', email: '', password: '', creator: creatorMode })

  const destination = (u) => {
    if (next && next.startsWith('/')) return next
    if (creatorMode && hasRole(u, 'creator')) return '/studio/'
    return '/'
  }

  // Quem já está logado não precisa ver esta tela.
  useEffect(() => {
    if (hydrated && user && !pending) router.replace(destination(user))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user])

  const run = async (fn, message) => {
    setPending(true)
    try {
      const u = await fn()
      toast.success(message(u))
      router.replace(destination(u))
    } catch (error) {
      toast.error(error.message)
      setPending(false)
    }
  }

  const strength = passwordStrength(form.password)

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(tab === 'login' ? '/images/backgrounds/login.webp' : '/images/backgrounds/register.webp')} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 space-y-4 p-12 text-white">
          <p className="font-display text-4xl font-semibold leading-tight">
            Leia, publique e descubra
            <br />
            <span className="text-gradient-gold">manhwas em um só universo.</span>
          </p>
          <p className="max-w-md text-white/70">Leitura vertical contínua, biblioteca que lembra onde você parou e um estúdio completo para quem cria.</p>
        </div>
      </div>

      <div className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft /> Voltar
            </Link>
          </Button>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{tab === 'login' ? 'Bem-vindo(a) de volta' : creatorMode ? 'Crie sua conta de criador(a)' : 'Crie sua conta'}</h1>
          <p className="mt-2 text-muted-foreground">{tab === 'login' ? 'Entre para continuar de onde parou.' : 'Leva menos de um minuto.'}</p>

          <Tabs value={tab} onValueChange={setTab} className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  run(() => login(loginForm), (u) => `Olá, ${u.name.split(' ')[0]}!`)
                }}
              >
                <Field label="E-mail" htmlFor="login-email">
                  <Input id="login-email" type="email" autoComplete="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                </Field>
                <Field label="Senha" htmlFor="login-password">
                  <PasswordInput id="login-password" autoComplete="current-password" required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                </Field>
                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={pending}>
                  {pending && <Loader2 className="animate-spin" />} Entrar
                </Button>
              </form>

              <div className="mt-8">
                <div className="relative mb-4 text-center text-xs uppercase tracking-wider text-muted-foreground">
                  <span className="relative z-10 bg-background px-3">ou experimente uma conta demo</span>
                  <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
                </div>
                <div className="grid gap-2">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const Icon = DEMO_ICONS[acc.id]
                    return (
                      <button
                        key={acc.id}
                        disabled={pending}
                        onClick={() => run(() => login({ email: acc.email, password: 'manna123' }), (u) => `Entrou como ${u.name}`)}
                        className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">{acc.label}</span>
                          <span className="block text-xs text-muted-foreground">{acc.description}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Senha das contas demo: <code className="rounded bg-muted px-1.5 py-0.5">manna123</code>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  run(() => register(form), (u) => `Conta criada. Boas-vindas, ${u.name.split(' ')[0]}!`)
                }}
              >
                <Field label="Nome" htmlFor="reg-name">
                  <Input id="reg-name" autoComplete="name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="E-mail" htmlFor="reg-email">
                  <Input id="reg-email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label="Senha" htmlFor="reg-password" hint="Mínimo de 6 caracteres.">
                  <PasswordInput id="reg-password" autoComplete="new-password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  {form.password && (
                    <div className="flex gap-1" aria-label={`Força da senha: ${strength} de 4`}>
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className={cn('h-1 flex-1 rounded-full', i < strength ? (strength < 2 ? 'bg-destructive' : strength < 3 ? 'bg-amber-500' : 'bg-success') : 'bg-muted')} />
                      ))}
                    </div>
                  )}
                </Field>

                <fieldset className="grid grid-cols-2 gap-2">
                  <legend className="mb-2 text-sm font-medium">Como você vai usar o Manna?</legend>
                  {[
                    { value: false, icon: BookOpen, title: 'Para ler', text: 'Biblioteca e favoritos' },
                    { value: true, icon: PenTool, title: 'Para ler e publicar', text: 'Inclui o Creator Studio' },
                  ].map((opt) => (
                    <label
                      key={String(opt.value)}
                      className={cn(
                        'cursor-pointer rounded-xl border p-3 transition',
                        form.creator === opt.value ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'hover:border-primary/40'
                      )}
                    >
                      <input type="radio" name="role" className="sr-only" checked={form.creator === opt.value} onChange={() => setForm({ ...form, creator: opt.value })} />
                      <opt.icon className="mb-2 h-5 w-5 text-primary" />
                      <span className="block text-sm font-semibold">{opt.title}</span>
                      <span className="block text-xs text-muted-foreground">{opt.text}</span>
                    </label>
                  ))}
                </fieldset>

                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={pending}>
                  {pending && <Loader2 className="animate-spin" />} Criar conta
                </Button>
                <p className="text-center text-xs text-muted-foreground">Nesta demonstração, sua conta fica salva apenas neste navegador.</p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
