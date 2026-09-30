'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, BookOpen, Eye, Layers, Loader2, Pencil, Plus, Save, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageShell } from '@/components/layout/page-shell'
import { RequireAuth } from '@/components/auth/require-auth'
import { PublicationBadge } from '@/components/manhwa/series-bits'
import { CoverUpload, PagesUpload } from './uploads'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState, TimeAgo } from '@/components/ui/misc'
import { useAppState, useCurrentUser } from '@/lib/hooks'
import { createSeries, deleteChapter, deleteSeries, findSeries, hasRole, saveChapter, seriesChapters, submitForReview, updateSeries } from '@/lib/api'
import { deleteMedia } from '@/lib/media'
import { GENRES, STATUS_LABEL } from '@/lib/seed'
import { cn, formatCompact } from '@/lib/utils'

const MAX_GENRES = 5

function SeriesForm({ series, onSaved }) {
  const [form, setForm] = useState(() => ({
    title: series?.title || '',
    description: series?.description || '',
    genres: series?.genres || [],
    status: series?.status || 'ongoing',
    cover: series?.cover || null,
  }))
  const [saving, setSaving] = useState(false)
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const toggleGenre = (g) => {
    if (form.genres.includes(g)) set({ genres: form.genres.filter((x) => x !== g) })
    else if (form.genres.length < MAX_GENRES) set({ genres: [...form.genres, g] })
    else toast.error(`Escolha no máximo ${MAX_GENRES} gêneros.`)
  }

  const submit = (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (series) {
        updateSeries(series.id, form)
        toast.success('Alterações salvas')
        onSaved?.(series)
      } else {
        const created = createSeries(form)
        toast.success('Série criada! Agora adicione o primeiro capítulo.')
        onSaved?.(created)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 md:grid-cols-[240px_1fr]">
      <div className="mx-auto w-48 md:w-full">
        <CoverUpload value={form.cover} onChange={(cover) => set({ cover })} />
      </div>
      <div className="space-y-5">
        <Field label="Título" htmlFor="title">
          <Input id="title" value={form.title} onChange={(e) => set({ title: e.target.value })} maxLength={90} placeholder="Ex.: A Duquesa das Estrelas" required />
        </Field>
        <Field label="Sinopse" htmlFor="description" hint={`${form.description.length}/800 · mínimo de 20 caracteres`}>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            maxLength={800}
            rows={5}
            placeholder="Conte o suficiente para fisgar sem entregar a história."
            required
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Status" htmlFor="status">
            <Select id="status" value={form.status} onChange={(e) => set({ status: e.target.value })}>
              {Object.entries(STATUS_LABEL).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            Gêneros <span className="font-normal text-muted-foreground">({form.genres.length}/{MAX_GENRES})</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={form.genres.includes(g)}
                onClick={() => toggleGenre(g)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition',
                  form.genres.includes(g) ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary/50'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />} {series ? 'Salvar alterações' : 'Criar série'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function ChapterDialog({ open, onOpenChange, series, chapter }) {
  const [title, setTitle] = useState('')
  const [pages, setPages] = useState([])
  const original = useRef([])

  useEffect(() => {
    if (open) {
      setTitle(chapter?.title || '')
      setPages(chapter?.pages || [])
      original.current = chapter?.pages || []
    }
  }, [open, chapter])

  const cleanup = (keep) => {
    // Apaga do IndexedDB as imagens que não ficaram em nenhum capítulo.
    const all = new Set([...original.current, ...pages])
    for (const ref of all) if (!keep.includes(ref)) deleteMedia(ref).catch(() => {})
  }

  const close = (saved) => {
    if (!saved) cleanup(original.current)
    onOpenChange(false)
  }

  const save = () => {
    try {
      saveChapter(series.id, { id: chapter?.id, title, pages })
      cleanup(pages)
      toast.success(chapter ? 'Capítulo atualizado' : 'Capítulo salvo como rascunho')
      close(true)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const isDemo = chapter && !chapter.pages

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close(false))}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{chapter ? `Editar capítulo ${chapter.number}` : 'Novo capítulo'}</DialogTitle>
          <DialogDescription>Capítulos novos ou editados voltam para rascunho e precisam ser enviados para revisão.</DialogDescription>
        </DialogHeader>
        <Field label="Título (opcional)" htmlFor="chapter-title">
          <Input id="chapter-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Ex.: O baile de inverno" />
        </Field>
        {isDemo && pages.length === 0 && (
          <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">Este capítulo de demonstração usa páginas geradas automaticamente. Envie imagens para substituí-las.</p>
        )}
        <PagesUpload pages={pages} onChange={setPages} />
        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!pages.length}>
            <Save /> Salvar {pages.length > 0 && `(${pages.length} páginas)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await onConfirm()
              onOpenChange(false)
            }}
          >
            <Trash2 /> {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ChaptersManager({ series }) {
  const state = useAppState()
  const chapters = useMemo(() => seriesChapters(state, series.id, { all: true }), [state, series.id])
  const [editing, setEditing] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const open = (chapter) => {
    setEditing(chapter)
    setDialogOpen(true)
  }

  const trySubmit = (kind, id) => {
    try {
      submitForReview(kind, id)
      toast.success('Enviado para revisão. Você será notificado(a) da decisão.')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Layers className="h-5 w-5 text-primary" /> Capítulos
        </h2>
        <Button onClick={() => open(null)}>
          <Plus /> Novo capítulo
        </Button>
      </div>

      {chapters.length ? (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
          {chapters.map((ch) => (
            <li key={ch.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display font-semibold text-primary">{ch.number}</span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium">
                  Capítulo {ch.number}
                  {ch.title && <span className="text-muted-foreground"> — {ch.title}</span>}
                </p>
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <PublicationBadge publication={ch.publication} />
                  <span>{ch.pages ? `${ch.pages.length} páginas` : 'páginas demo'}</span>
                  <span>· {formatCompact(ch.views)} leituras</span>
                  <span>
                    · <TimeAgo date={ch.updatedAt || ch.createdAt} />
                  </span>
                </p>
              </div>
              <div className="flex gap-1">
                {series.publication === 'published' && ['draft', 'rejected'].includes(ch.publication) && (
                  <Button size="sm" variant="secondary" onClick={() => trySubmit('chapter', ch.id)}>
                    <Send /> Enviar
                  </Button>
                )}
                <Button asChild size="icon-sm" variant="ghost" aria-label="Pré-visualizar">
                  <Link href={`/ler/?obra=${series.id}&cap=${ch.number}`}>
                    <Eye />
                  </Link>
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => open(ch)} aria-label="Editar capítulo">
                  <Pencil />
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => setToDelete(ch)} aria-label="Excluir capítulo" className="hover:text-destructive">
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={BookOpen} title="Nenhum capítulo ainda" action={<Button onClick={() => open(null)}>Adicionar capítulo 1</Button>}>
          Envie as páginas do primeiro capítulo para poder mandar a série para revisão.
        </EmptyState>
      )}

      <ChapterDialog open={dialogOpen} onOpenChange={setDialogOpen} series={series} chapter={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Excluir o capítulo ${toDelete?.number}?`}
        description="As páginas e os comentários deste capítulo serão apagados. Não dá para desfazer."
        confirmLabel="Excluir capítulo"
        onConfirm={async () => {
          await deleteChapter(toDelete.id)
          toast.success('Capítulo excluído')
        }}
      />
    </section>
  )
}

function Editor() {
  const params = useSearchParams()
  const router = useRouter()
  const state = useAppState()
  const user = useCurrentUser()
  const id = params.get('id')
  const series = id ? findSeries(state, id) : null
  const [confirmDelete, setConfirmDelete] = useState(false)

  const lastRejection = useMemo(
    () => (series ? state.moderationLog.find((l) => l.seriesId === series.id && l.decision === 'reject') : null),
    [state.moderationLog, series]
  )
  const hasDrafts = useMemo(
    () => !!series && state.chapters.some((c) => c.seriesId === series.id && ['draft', 'rejected'].includes(c.publication)),
    [state.chapters, series]
  )

  if (id && (!series || (series.creatorId !== user.id && !hasRole(user, 'admin')))) {
    return (
      <div className="container py-16">
        <EmptyState icon={AlertTriangle} title="Série não encontrada" action={<Button asChild><Link href="/studio/">Voltar ao Studio</Link></Button>}>
          Ela não existe ou pertence a outra pessoa.
        </EmptyState>
      </div>
    )
  }

  const canSubmit = series && (['draft', 'rejected'].includes(series.publication) || (series.publication === 'published' && hasDrafts))

  return (
    <div className="container max-w-5xl py-8 sm:py-12">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-4">
        <Link href="/studio/">
          <ArrowLeft /> Studio
        </Link>
      </Button>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">{series && <PublicationBadge publication={series.publication} />}</div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{series ? series.title : 'Nova série'}</h1>
        </div>
        {series && (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/obra/?id=${series.id}`}>
                <Eye /> Ver página
              </Link>
            </Button>
            {canSubmit && (
              <Button
                variant="gold"
                onClick={() => {
                  try {
                    submitForReview('series', series.id)
                    toast.success('Enviado para revisão. Você será notificado(a) da decisão.')
                  } catch (error) {
                    toast.error(error.message)
                  }
                }}
              >
                <Send /> Enviar para revisão
              </Button>
            )}
          </div>
        )}
      </div>

      {series?.publication === 'review' && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <strong>Em revisão.</strong> A moderação está avaliando esta série. Você pode continuar editando enquanto isso.
        </div>
      )}
      {series?.publication === 'rejected' && lastRejection && (
        <div className="mb-8 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold">A moderação pediu ajustes</p>
            <p className="mt-1 text-muted-foreground">“{lastRejection.note}”</p>
            <p className="mt-2 text-xs text-muted-foreground">Faça as alterações e envie novamente.</p>
          </div>
        </div>
      )}

      <div className="space-y-12">
        <section className="rounded-3xl border bg-card p-5 sm:p-8">
          <SeriesForm key={series?.id || 'new'} series={series} onSaved={(s) => !series && router.replace(`/studio/obra/?id=${s.id}`)} />
        </section>

        {series && <ChaptersManager series={series} />}

        {series && (
          <section className="rounded-2xl border border-destructive/30 p-5">
            <h2 className="font-semibold text-destructive">Zona de perigo</h2>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Excluir a série apaga todos os capítulos, páginas e comentários.</p>
              <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 /> Excluir série
              </Button>
            </div>
          </section>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Excluir "${series?.title}"?`}
        description="Todos os capítulos, páginas e comentários serão apagados. Não dá para desfazer."
        confirmLabel="Excluir série"
        onConfirm={async () => {
          await deleteSeries(series.id)
          toast.success('Série excluída')
          router.replace('/studio/')
        }}
      />
    </div>
  )
}

export function SeriesEditor() {
  return (
    <PageShell>
      <RequireAuth roles={['creator']} title="Entre para abrir o Creator Studio">
        <Editor />
      </RequireAuth>
    </PageShell>
  )
}
