'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CheckCircle2, Eye, History, Inbox, MessageSquareWarning, ShieldCheck, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PageShell } from '@/components/layout/page-shell'
import { RequireAuth } from '@/components/auth/require-auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState, MediaImage, TimeAgo } from '@/components/ui/misc'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppState } from '@/lib/hooks'
import { creatorName, moderate, moderationQueue, seriesChapters } from '@/lib/api'

const QUICK_NOTES = ['A capa está com baixa resolução.', 'A sinopse precisa de mais detalhes.', 'Há páginas fora de ordem.', 'Conteúdo precisa de classificação indicativa.']

function RejectDialog({ target, onOpenChange }) {
  const [note, setNote] = useState('')
  return (
    <Dialog open={!!target} onOpenChange={(v) => { if (!v) { setNote(''); onOpenChange(false) } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pedir ajustes</DialogTitle>
          <DialogDescription>O(a) criador(a) recebe esta mensagem e pode reenviar depois de corrigir.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {QUICK_NOTES.map((n) => (
            <button key={n} type="button" onClick={() => setNote((v) => (v ? `${v} ${n}` : n))} className="rounded-full border px-3 py-1 text-xs hover:border-primary/50 hover:text-primary">
              {n}
            </button>
          ))}
        </div>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Explique o que precisa mudar…" rows={4} autoFocus aria-label="Motivo" />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              try {
                moderate(target.kind, target.item.id, 'reject', note)
                toast.success('Ajustes solicitados')
                setNote('')
                onOpenChange(false)
              } catch (error) {
                toast.error(error.message)
              }
            }}
          >
            <MessageSquareWarning /> Enviar pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QueueItem({ entry, onReject }) {
  const state = useAppState()
  const { kind, item, series } = entry
  const chapters = kind === 'series' ? seriesChapters(state, series.id, { all: true }) : []
  const firstChapter = kind === 'series' ? chapters[0]?.number : item.number

  return (
    <li className="flex flex-col gap-5 rounded-2xl border bg-card p-4 sm:flex-row">
      <MediaImage src={series.cover} alt="" className="h-40 w-28 shrink-0 self-start rounded-xl object-cover" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={kind === 'series' ? 'default' : 'secondary'}>{kind === 'series' ? 'Nova série' : 'Novo capítulo'}</Badge>
          <span className="text-xs text-muted-foreground">
            enviado <TimeAgo date={item.submittedAt || item.updatedAt || item.createdAt} /> por <strong className="text-foreground">{creatorName(state, series)}</strong>
          </span>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">{series.title}</h3>
          {kind === 'chapter' ? (
            <p className="text-sm text-muted-foreground">
              Capítulo {item.number}
              {item.title && ` — ${item.title}`} · {item.pages ? `${item.pages.length} páginas` : 'páginas demo'}
            </p>
          ) : (
            <>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{series.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {series.genres.map((g) => (
                  <Badge key={g} variant="outline">
                    {g}
                  </Badge>
                ))}
                <Badge variant="muted">{chapters.length} capítulo(s)</Badge>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {firstChapter && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/ler/?obra=${series.id}&cap=${firstChapter}`}>
                <Eye /> Pré-visualizar
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            className="bg-success text-white hover:bg-success/90"
            onClick={() => {
              moderate(kind, item.id, 'approve')
              toast.success(kind === 'series' ? 'Série publicada' : 'Capítulo publicado')
            }}
          >
            <CheckCircle2 /> Aprovar e publicar
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => onReject(entry)}>
            <XCircle /> Pedir ajustes
          </Button>
        </div>
      </div>
    </li>
  )
}

function Moderation() {
  const state = useAppState()
  const queue = useMemo(() => moderationQueue(state), [state])
  const [rejecting, setRejecting] = useState(null)
  const log = useMemo(
    () => state.moderationLog.map((l) => ({ ...l, moderator: state.users.find((u) => u.id === l.moderatorId) })),
    [state.moderationLog, state.users]
  )
  const since = Date.now() - 7 * 24 * 3600 * 1000
  const week = log.filter((l) => l.createdAt > since)

  return (
    <div className="container py-8 sm:py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Moderação</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Fila de revisão</h1>
        <p className="mt-1 text-muted-foreground">Tudo que é publicado no Manna passa por aqui antes de chegar aos leitores.</p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3 sm:max-w-xl">
        {[
          { label: 'Pendentes', value: queue.length },
          { label: 'Aprovados (7d)', value: week.filter((l) => l.decision === 'approve').length },
          { label: 'Ajustes (7d)', value: week.filter((l) => l.decision === 'reject').length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card px-4 py-3">
            <p className="font-display text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">
            <Inbox /> Fila {queue.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">{queue.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="log">
            <History /> Histórico
          </TabsTrigger>
        </TabsList>
        <TabsContent value="queue">
          {queue.length ? (
            <ul className="space-y-4">
              {queue.map((entry) => (
                <QueueItem key={`${entry.kind}-${entry.item.id}`} entry={entry} onReject={setRejecting} />
              ))}
            </ul>
          ) : (
            <EmptyState icon={ShieldCheck} title="Fila zerada 🎉">
              Nenhum conteúdo aguardando revisão agora.
            </EmptyState>
          )}
        </TabsContent>
        <TabsContent value="log">
          {log.length ? (
            <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
              {log.map((l) => (
                <li key={l.id} className="flex gap-3 px-4 py-3 text-sm">
                  {l.decision === 'approve' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
                  <div className="min-w-0 flex-1">
                    <p>
                      <strong>{l.moderator?.name || 'Moderação'}</strong> {l.decision === 'approve' ? 'aprovou' : 'pediu ajustes em'}{' '}
                      <Link href={`/obra/?id=${l.seriesId}`} className="font-medium hover:text-primary">
                        {l.label}
                      </Link>
                    </p>
                    {l.note && <p className="mt-0.5 text-muted-foreground">“{l.note}”</p>}
                  </div>
                  <TimeAgo date={l.createdAt} className="shrink-0 text-xs text-muted-foreground" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={History} title="Sem decisões ainda">
              Aprovações e pedidos de ajuste ficam registrados aqui.
            </EmptyState>
          )}
        </TabsContent>
      </Tabs>

      <RejectDialog target={rejecting} onOpenChange={() => setRejecting(null)} />
    </div>
  )
}

export function ModerationView() {
  return (
    <PageShell>
      <RequireAuth roles={['moderator', 'admin']} title="Área da moderação">
        <Moderation />
      </RequireAuth>
    </PageShell>
  )
}
