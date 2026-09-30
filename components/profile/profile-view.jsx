'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { Award, BookOpen, Camera, Download, Heart, KeyRound, Loader2, LogOut, MessageCircle, RotateCcw, Save, Star } from 'lucide-react'
import { toast } from 'sonner'
import { PageShell } from '@/components/layout/page-shell'
import { RequireAuth } from '@/components/auth/require-auth'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Avatar } from '@/components/ui/misc'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppState, useCurrentUser } from '@/lib/hooks'
import { changePassword, exportMyData, logout, resetDemo, updateProfile } from '@/lib/api'
import { deleteMedia, saveImage } from '@/lib/media'
import { ROLE_LABEL } from '@/lib/seed'
import { cn, formatDate } from '@/lib/utils'

function useStats(state, user) {
  return useMemo(() => {
    const history = Object.values(state.history[user.id] || {})
    const chaptersRead = history.reduce((sum, h) => {
      const ch = state.chapters.find((c) => c.id === h.chapterId)
      return sum + (ch ? ch.number - 1 + (h.progress >= 1 ? 1 : 0) : 0)
    }, 0)
    const favorites = (state.favorites[user.id] || []).length
    const comments = state.comments.filter((c) => c.userId === user.id).length
    const ratings = Object.values(state.ratings).filter((r) => r[user.id]).length
    const published = state.series.filter((s) => s.creatorId === user.id && s.publication === 'published').length
    return { series: history.length, chaptersRead, favorites, comments, ratings, published }
  }, [state, user.id])
}

const ACHIEVEMENTS = [
  { id: 'first', icon: BookOpen, label: 'Primeira página', text: 'Comece a ler uma série', test: (s) => s.series >= 1 },
  { id: 'reader', icon: BookOpen, label: 'Maratonista', text: 'Leia 10 capítulos', test: (s) => s.chaptersRead >= 10 },
  { id: 'collector', icon: Heart, label: 'Colecionador(a)', text: 'Favorite 5 séries', test: (s) => s.favorites >= 5 },
  { id: 'critic', icon: Star, label: 'Crítico(a)', text: 'Avalie 3 séries', test: (s) => s.ratings >= 3 },
  { id: 'voice', icon: MessageCircle, label: 'Voz da comunidade', text: 'Deixe um comentário', test: (s) => s.comments >= 1 },
  { id: 'author', icon: Award, label: 'Autor(a) publicado(a)', text: 'Tenha uma série aprovada', test: (s) => s.published >= 1 },
]

function PasswordDialog({ open, onOpenChange }) {
  const [form, setForm] = useState({ current: '', next: '' })
  const [pending, setPending] = useState(false)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setPending(true)
            try {
              await changePassword(form.current, form.next)
              toast.success('Senha alterada')
              setForm({ current: '', next: '' })
              onOpenChange(false)
            } catch (error) {
              toast.error(error.message)
            } finally {
              setPending(false)
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
          <Field label="Senha atual" htmlFor="pw-current">
            <Input id="pw-current" type="password" autoComplete="current-password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} required />
          </Field>
          <Field label="Nova senha" htmlFor="pw-next" hint="Mínimo de 6 caracteres.">
            <Input id="pw-next" type="password" autoComplete="new-password" minLength={6} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} required />
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Profile() {
  const state = useAppState()
  const user = useCurrentUser()
  const router = useRouter()
  const stats = useStats(state, user)
  const fileRef = useRef(null)
  const [form, setForm] = useState({ name: user.name, bio: user.bio || '' })
  const [pwOpen, setPwOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const dirty = form.name !== user.name || form.bio !== (user.bio || '')

  const changeAvatar = async (file) => {
    if (!file) return
    try {
      const ref = await saveImage(file, { maxWidth: 256, quality: 0.85 })
      const old = user.avatar
      updateProfile({ avatar: ref })
      if (old) deleteMedia(old).catch(() => {})
      toast.success('Foto atualizada')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const download = () => {
    const blob = new Blob([JSON.stringify(exportMyData(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: `manna-${user.username}.json` })
    a.click()
    URL.revokeObjectURL(url)
  }

  const statItems = [
    { label: 'Séries lidas', value: stats.series },
    { label: 'Capítulos', value: stats.chaptersRead },
    { label: 'Favoritos', value: stats.favorites },
    { label: 'Comentários', value: stats.comments },
  ]

  return (
    <div className="container max-w-5xl py-8 sm:py-12">
      <section className="relative overflow-hidden rounded-3xl border bg-card">
        <div className="h-32 bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-purple-600/30 sm:h-40" />
        <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="relative -mt-14 w-fit">
            <Avatar user={user} className="h-28 w-28 text-3xl ring-4 ring-card" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"
              aria-label="Trocar foto"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => changeAvatar(e.target.files[0])} />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              @{user.username} · membro desde {formatDate(user.createdAt)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.roles.map((r) => (
                <span key={r} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {ROLE_LABEL[r]}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {statItems.map((s) => (
              <div key={s.label} className="rounded-xl bg-muted/60 px-3 py-2">
                <p className="font-display text-xl font-semibold">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5 rounded-3xl border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Informações</h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              try {
                updateProfile(form)
                toast.success('Perfil atualizado')
              } catch (error) {
                toast.error(error.message)
              }
            }}
          >
            <Field label="Nome" htmlFor="p-name">
              <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} />
            </Field>
            <Field label="E-mail" htmlFor="p-email" hint="O e-mail é usado para entrar e não pode ser alterado nesta versão.">
              <Input id="p-email" value={user.email} disabled />
            </Field>
            <Field label="Bio" htmlFor="p-bio" hint={`${form.bio.length}/280`}>
              <Textarea id="p-bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={280} placeholder="Conte um pouco sobre o que você gosta de ler." />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={!dirty}>
                <Save /> Salvar
              </Button>
            </div>
          </form>
        </section>

        <div className="space-y-8">
          <section className="rounded-3xl border bg-card p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">Conquistas</h2>
            <ul className="grid grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = a.test(stats)
                return (
                  <li
                    key={a.id}
                    title={a.text}
                    className={cn('rounded-xl border p-3 transition', unlocked ? 'border-primary/40 bg-primary/10' : 'opacity-50 grayscale')}
                  >
                    <a.icon className={cn('mb-1.5 h-5 w-5', unlocked ? 'text-primary' : 'text-muted-foreground')} />
                    <p className="text-sm font-semibold leading-tight">{a.label}</p>
                    <p className="text-[11px] text-muted-foreground">{a.text}</p>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="space-y-2 rounded-3xl border bg-card p-6">
            <h2 className="mb-2 font-display text-xl font-semibold">Conta</h2>
            <Button variant="outline" className="w-full justify-start" onClick={() => setPwOpen(true)}>
              <KeyRound /> Alterar senha
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={download}>
              <Download /> Baixar meus dados (JSON)
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setResetOpen(true)}>
              <RotateCcw /> Restaurar demonstração
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => {
                logout()
                router.push('/')
              }}
            >
              <LogOut /> Sair
            </Button>
          </section>
        </div>
      </div>

      <PasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar a demonstração?</DialogTitle>
            <DialogDescription>
              Apaga todas as contas criadas, séries publicadas, comentários e imagens enviadas neste navegador, e volta ao catálogo original.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await resetDemo()
                toast.success('Demonstração restaurada')
                router.push('/')
              }}
            >
              <RotateCcw /> Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function ProfileView() {
  return (
    <PageShell>
      <RequireAuth title="Entre para ver seu perfil">
        <Profile />
      </RequireAuth>
    </PageShell>
  )
}
