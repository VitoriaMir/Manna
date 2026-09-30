'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { MessageCircle, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Avatar, TimeAgo } from '@/components/ui/misc'
import { useAction, useAppState, useCurrentUser } from '@/lib/hooks'
import { addComment, canModerate, deleteComment } from '@/lib/api'

/** Lista e formulário de comentários de uma série (ou de um capítulo). */
export function Comments({ seriesId, chapterId, title = 'Comentários' }) {
  const state = useAppState()
  const user = useCurrentUser()
  const [text, setText] = useState('')
  const [send, sending] = useAction(addComment)

  const items = useMemo(
    () =>
      state.comments
        .filter((c) => c.seriesId === seriesId && (!chapterId || c.chapterId === chapterId))
        .map((c) => ({ ...c, user: state.users.find((u) => u.id === c.userId), chapter: state.chapters.find((ch) => ch.id === c.chapterId) })),
    [state.comments, state.users, state.chapters, seriesId, chapterId]
  )

  return (
    <section aria-labelledby="comments-title" className="space-y-5">
      <h2 id="comments-title" className="flex items-center gap-2 font-display text-xl font-semibold">
        <MessageCircle className="h-5 w-5 text-primary" />
        {title} <span className="text-base font-normal text-muted-foreground">({items.length})</span>
      </h2>

      {user ? (
        <form
          className="flex gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            if (await send({ seriesId, chapterId, text })) setText('')
          }}
        >
          <Avatar user={user} className="mt-1" />
          <div className="flex-1 space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="O que você achou? Evite spoilers 😉"
              maxLength={1000}
              aria-label="Escreva um comentário"
              className="min-h-[72px]"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{text.length}/1000</span>
              <Button type="submit" size="sm" disabled={!text.trim() || sending}>
                <Send /> Comentar
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          <Link href="/entrar/" className="font-semibold text-primary hover:underline">
            Entre na sua conta
          </Link>{' '}
          para participar da conversa.
        </p>
      )}

      <ul className="space-y-4">
        {items.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Avatar user={c.user} />
            <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{c.user?.name || 'Conta removida'}</span>
                {!chapterId && c.chapter && <span>· Cap. {c.chapter.number}</span>}
                <span>·</span>
                <TimeAgo date={c.createdAt} />
                {user && (c.userId === user.id || canModerate(user)) && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="ml-auto inline-flex items-center gap-1 rounded p-1 hover:text-destructive"
                    aria-label="Remover comentário"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{c.text}</p>
            </div>
          </li>
        ))}
        {!items.length && <li className="py-6 text-center text-sm text-muted-foreground">Ainda não há comentários. Que tal ser o primeiro?</li>}
      </ul>
    </section>
  )
}
