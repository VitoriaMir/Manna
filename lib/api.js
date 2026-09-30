'use client'

// Camada de serviço do Manna.
// Todas as regras de negócio (permissões, fluxo de moderação, biblioteca)
// ficam aqui. Para trocar o armazenamento local por uma API real, basta
// reimplementar estas funções mantendo as mesmas assinaturas.

import { getState, setState, resetState } from './store'
import { clearMedia, deleteMedia } from './media'
import { normalize, slugify, uid } from './utils'
import { FICTIONAL_CREATORS } from './seed'

/* ------------------------------------------------------------------ */
/* Consultas (funções puras sobre o estado)                            */
/* ------------------------------------------------------------------ */

export function currentUser(state) {
  return state.session ? state.users.find((u) => u.id === state.session) || null : null
}

export const hasRole = (user, role) => !!user?.roles?.includes(role)
export const canModerate = (user) => hasRole(user, 'moderator') || hasRole(user, 'admin')

export function findSeries(state, id) {
  return state.series.find((s) => s.id === id || s.slug === id) || null
}

export function isVisible(series, user) {
  if (!series) return false
  if (series.publication === 'published') return true
  return !!user && (series.creatorId === user.id || canModerate(user))
}

export function publishedSeries(state) {
  return state.series.filter((s) => s.publication === 'published')
}

export function seriesChapters(state, seriesId, { all = false } = {}) {
  return state.chapters
    .filter((c) => c.seriesId === seriesId && (all || c.publication === 'published'))
    .sort((a, b) => a.number - b.number)
}

export function ratingOf(state, series) {
  const userRatings = Object.values(state.ratings[series.id] || {})
  const votes = (series.baseVotes || 0) + userRatings.length
  if (!votes) return { value: 0, votes: 0 }
  const sum = (series.baseRating || 0) * (series.baseVotes || 0) + userRatings.reduce((a, b) => a + b, 0)
  return { value: Math.round((sum / votes) * 10) / 10, votes }
}

export function userRating(state, seriesId, userId) {
  return state.ratings[seriesId]?.[userId] || 0
}

export function creatorName(state, series) {
  const user = state.users.find((u) => u.id === series.creatorId)
  return user?.name || FICTIONAL_CREATORS[series.creatorId] || series.author
}

export function latestUpdates(state, limit = 12) {
  const published = new Map(publishedSeries(state).map((s) => [s.id, s]))
  const latestBySeries = new Map()
  for (const ch of state.chapters) {
    if (ch.publication !== 'published' || !published.has(ch.seriesId)) continue
    const prev = latestBySeries.get(ch.seriesId)
    if (!prev || ch.createdAt > prev.createdAt) latestBySeries.set(ch.seriesId, ch)
  }
  return [...latestBySeries.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
    .map((chapter) => ({ chapter, series: published.get(chapter.seriesId) }))
}

export function continueReading(state, userId) {
  const entries = Object.entries(state.history[userId] || {})
  return entries
    .map(([seriesId, entry]) => {
      const series = findSeries(state, seriesId)
      const chapter = state.chapters.find((c) => c.id === entry.chapterId)
      if (!series || !chapter || series.publication !== 'published') return null
      const total = seriesChapters(state, seriesId).length
      return { series, chapter, total, ...entry }
    })
    .filter(Boolean)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export const SORTS = {
  popular: { label: 'Mais lidos', fn: (a, b) => b.views - a.views },
  rating: { label: 'Melhor avaliados', fn: (a, b, st) => ratingOf(st, b).value - ratingOf(st, a).value },
  recent: { label: 'Atualizados recentemente', fn: (a, b) => b.updatedAt - a.updatedAt },
  newest: { label: 'Mais novos', fn: (a, b) => b.createdAt - a.createdAt },
  title: { label: 'A–Z', fn: (a, b) => a.title.localeCompare(b.title, 'pt-BR') },
}

export function searchSeries(state, { q = '', genres = [], status = '', sort = 'popular', minRating = 0 } = {}) {
  const terms = normalize(q).split(/\s+/).filter(Boolean)
  const sorter = SORTS[sort] || SORTS.popular
  return publishedSeries(state)
    .filter((s) => {
      if (status && s.status !== status) return false
      if (genres.length && !genres.every((g) => s.genres.includes(g))) return false
      if (minRating && ratingOf(state, s).value < minRating) return false
      if (!terms.length) return true
      const haystack = normalize([s.title, s.author, s.description, s.genres.join(' ')].join(' '))
      return terms.every((t) => haystack.includes(t))
    })
    .sort((a, b) => sorter.fn(a, b, state))
}

export function unreadNotifications(state, userId) {
  return state.notifications.filter((n) => n.userId === userId && !n.read).length
}

export function moderationQueue(state) {
  const series = state.series.filter((s) => s.publication === 'review').map((s) => ({ kind: 'series', item: s, series: s }))
  const chapters = state.chapters
    .filter((c) => c.publication === 'review')
    .map((c) => ({ kind: 'chapter', item: c, series: findSeries(state, c.seriesId) }))
    // Capítulos de uma série ainda em revisão são aprovados junto com ela.
    .filter((entry) => entry.series && entry.series.publication !== 'review')
  return [...series, ...chapters].sort((a, b) => (a.item.submittedAt || a.item.updatedAt || 0) - (b.item.submittedAt || b.item.updatedAt || 0))
}

/* ------------------------------------------------------------------ */
/* Helpers internos                                                    */
/* ------------------------------------------------------------------ */

class ActionError extends Error {}

function requireUser(state) {
  const user = currentUser(state)
  if (!user) throw new ActionError('Entre na sua conta para continuar.')
  return user
}

function requireOwner(state, series) {
  const user = requireUser(state)
  if (!series) throw new ActionError('Série não encontrada.')
  if (series.creatorId !== user.id && !hasRole(user, 'admin')) throw new ActionError('Você não tem permissão para editar esta série.')
  return user
}

function notify(state, userId, payload) {
  if (!userId || !state.users.some((u) => u.id === userId)) return state.notifications
  return [{ id: uid('n'), userId, read: false, createdAt: Date.now(), type: 'info', ...payload }, ...state.notifications].slice(0, 200)
}

async function hashPassword(email, password) {
  const data = new TextEncoder().encode(`manna::${email.toLowerCase()}::${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ------------------------------------------------------------------ */
/* Autenticação e perfil                                               */
/* ------------------------------------------------------------------ */

export async function login({ email, password }) {
  const normalized = String(email || '').trim().toLowerCase()
  const user = getState().users.find((u) => u.email === normalized)
  if (!user || user.passwordHash !== (await hashPassword(normalized, password || ''))) {
    throw new ActionError('E-mail ou senha incorretos.')
  }
  setState((s) => ({ ...s, session: user.id }))
  return user
}

export async function register({ name, email, password, creator = false }) {
  const normalized = String(email || '').trim().toLowerCase()
  name = String(name || '').trim()
  if (name.length < 2) throw new ActionError('Informe seu nome.')
  if (!EMAIL_RE.test(normalized)) throw new ActionError('Informe um e-mail válido.')
  if (String(password || '').length < 6) throw new ActionError('A senha precisa ter pelo menos 6 caracteres.')
  if (getState().users.some((u) => u.email === normalized)) throw new ActionError('Já existe uma conta com este e-mail.')

  const user = {
    id: uid('u-'),
    name,
    username: slugify(name).replace(/-/g, '') || 'leitor',
    email: normalized,
    passwordHash: await hashPassword(normalized, password),
    roles: creator ? ['reader', 'creator'] : ['reader'],
    bio: '',
    avatar: null,
    createdAt: Date.now(),
  }
  setState((s) => ({
    ...s,
    users: [...s.users, user],
    session: user.id,
    notifications: [
      {
        id: uid('n'),
        userId: user.id,
        type: 'info',
        title: `Boas-vindas ao Manna, ${name.split(' ')[0]}!`,
        body: creator ? 'Seu Creator Studio está pronto. Que tal publicar sua primeira série?' : 'Favorite séries para montar sua biblioteca.',
        href: creator ? '/studio/' : '/explorar/',
        read: false,
        createdAt: Date.now(),
      },
      ...s.notifications,
    ],
  }))
  return user
}

export function logout() {
  setState((s) => ({ ...s, session: null }))
}

export function updateProfile(patch) {
  setState((s) => {
    const user = requireUser(s)
    const allowed = {}
    if (patch.name !== undefined) {
      if (String(patch.name).trim().length < 2) throw new ActionError('Nome muito curto.')
      allowed.name = String(patch.name).trim()
    }
    if (patch.bio !== undefined) allowed.bio = String(patch.bio).slice(0, 280)
    if (patch.avatar !== undefined) allowed.avatar = patch.avatar
    return { ...s, users: s.users.map((u) => (u.id === user.id ? { ...u, ...allowed } : u)) }
  })
}

export async function changePassword(current, next) {
  const user = requireUser(getState())
  if (user.passwordHash !== (await hashPassword(user.email, current))) throw new ActionError('Senha atual incorreta.')
  if (String(next).length < 6) throw new ActionError('A nova senha precisa ter pelo menos 6 caracteres.')
  const passwordHash = await hashPassword(user.email, next)
  setState((s) => ({ ...s, users: s.users.map((u) => (u.id === user.id ? { ...u, passwordHash } : u)) }))
}

export function becomeCreator() {
  setState((s) => {
    const user = requireUser(s)
    if (hasRole(user, 'creator')) return s
    return { ...s, users: s.users.map((u) => (u.id === user.id ? { ...u, roles: [...u.roles, 'creator'] } : u)) }
  })
}

/* ------------------------------------------------------------------ */
/* Biblioteca, leitura e interação                                     */
/* ------------------------------------------------------------------ */

export function toggleFavorite(seriesId) {
  let added = false
  setState((s) => {
    const user = requireUser(s)
    const list = s.favorites[user.id] || []
    added = !list.includes(seriesId)
    return {
      ...s,
      favorites: { ...s.favorites, [user.id]: added ? [seriesId, ...list] : list.filter((id) => id !== seriesId) },
    }
  })
  return added
}

export function saveProgress(seriesId, chapterId, progress) {
  const s = getState()
  const user = currentUser(s)
  if (!user) return
  const prev = s.history[user.id]?.[seriesId]
  const value = Math.max(0, Math.min(1, progress))
  // Evita gravar a cada pixel rolado.
  if (prev && prev.chapterId === chapterId && Math.abs(prev.progress - value) < 0.02 && value < 1) return
  setState((st) => ({
    ...st,
    history: {
      ...st.history,
      [user.id]: { ...(st.history[user.id] || {}), [seriesId]: { chapterId, progress: value, updatedAt: Date.now() } },
    },
  }))
}

export function removeFromHistory(seriesId) {
  setState((s) => {
    const user = requireUser(s)
    const { [seriesId]: _, ...rest } = s.history[user.id] || {}
    return { ...s, history: { ...s.history, [user.id]: rest } }
  })
}

const viewedThisSession = new Set()
export function registerView(seriesId, chapterId) {
  const key = `${seriesId}:${chapterId}`
  if (viewedThisSession.has(key)) return
  viewedThisSession.add(key)
  setState((s) => ({
    ...s,
    series: s.series.map((x) => (x.id === seriesId ? { ...x, views: (x.views || 0) + 1 } : x)),
    chapters: s.chapters.map((c) => (c.id === chapterId ? { ...c, views: (c.views || 0) + 1 } : c)),
  }))
}

export function rateSeries(seriesId, value) {
  setState((s) => {
    const user = requireUser(s)
    const v = Math.max(1, Math.min(5, Math.round(value)))
    return { ...s, ratings: { ...s.ratings, [seriesId]: { ...(s.ratings[seriesId] || {}), [user.id]: v } } }
  })
}

export function addComment({ seriesId, chapterId, text }) {
  const body = String(text || '').trim()
  if (!body) throw new ActionError('Escreva algo antes de enviar.')
  if (body.length > 1000) throw new ActionError('Comentário muito longo (máx. 1000 caracteres).')
  setState((s) => {
    const user = requireUser(s)
    const series = findSeries(s, seriesId)
    let notifications = s.notifications
    if (series && series.creatorId !== user.id) {
      notifications = notify({ ...s, notifications }, series.creatorId, {
        type: 'comment',
        title: `${user.name} comentou em ${series.title}`,
        body: body.slice(0, 120),
        href: `/obra/?id=${series.id}`,
      })
    }
    return {
      ...s,
      notifications,
      comments: [{ id: uid('cm-'), seriesId, chapterId, userId: user.id, text: body, createdAt: Date.now() }, ...s.comments],
    }
  })
}

export function deleteComment(commentId) {
  setState((s) => {
    const user = requireUser(s)
    const comment = s.comments.find((c) => c.id === commentId)
    if (!comment) return s
    if (comment.userId !== user.id && !canModerate(user)) throw new ActionError('Você não pode remover este comentário.')
    return { ...s, comments: s.comments.filter((c) => c.id !== commentId) }
  })
}

export function markNotificationsRead(ids) {
  setState((s) => {
    const user = requireUser(s)
    return {
      ...s,
      notifications: s.notifications.map((n) => (n.userId === user.id && (!ids || ids.includes(n.id)) ? { ...n, read: true } : n)),
    }
  })
}

export function setPrefs(patch) {
  setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }))
}

/* ------------------------------------------------------------------ */
/* Creator Studio                                                      */
/* ------------------------------------------------------------------ */

function validateSeries(data) {
  const title = String(data.title || '').trim()
  if (title.length < 2) throw new ActionError('Dê um título à série.')
  if (String(data.description || '').trim().length < 20) throw new ActionError('A sinopse precisa ter pelo menos 20 caracteres.')
  if (!data.genres?.length) throw new ActionError('Escolha pelo menos um gênero.')
  if (!data.cover) throw new ActionError('Envie uma capa.')
  return {
    title,
    description: String(data.description).trim(),
    genres: data.genres.slice(0, 5),
    status: data.status || 'ongoing',
    cover: data.cover,
  }
}

export function createSeries(data) {
  let created
  setState((s) => {
    const user = requireUser(s)
    if (!hasRole(user, 'creator')) throw new ActionError('Apenas criadores podem publicar séries.')
    const clean = validateSeries(data)
    const now = Date.now()
    created = {
      id: uid('s-'),
      slug: slugify(clean.title),
      author: user.name,
      creatorId: user.id,
      ...clean,
      publication: 'draft',
      featured: false,
      accent: '32 70% 40%',
      views: 0,
      baseRating: 0,
      baseVotes: 0,
      createdAt: now,
      updatedAt: now,
    }
    return { ...s, series: [...s.series, created] }
  })
  return created
}

export function updateSeries(seriesId, data) {
  setState((s) => {
    const series = findSeries(s, seriesId)
    requireOwner(s, series)
    const clean = validateSeries({ ...series, ...data })
    return { ...s, series: s.series.map((x) => (x.id === series.id ? { ...x, ...clean, updatedAt: Date.now() } : x)) }
  })
}

export async function deleteSeries(seriesId) {
  const s = getState()
  const series = findSeries(s, seriesId)
  requireOwner(s, series)
  const chapters = s.chapters.filter((c) => c.seriesId === series.id)
  setState((st) => ({
    ...st,
    series: st.series.filter((x) => x.id !== series.id),
    chapters: st.chapters.filter((c) => c.seriesId !== series.id),
    comments: st.comments.filter((c) => c.seriesId !== series.id),
  }))
  await Promise.all([deleteMedia(series.cover), ...chapters.flatMap((c) => (c.pages || []).map(deleteMedia))]).catch(() => {})
}

export function saveChapter(seriesId, { id, title, pages }) {
  let saved
  setState((s) => {
    const series = findSeries(s, seriesId)
    requireOwner(s, series)
    if (!pages?.length) throw new ActionError('Adicione pelo menos uma página.')
    const now = Date.now()
    if (id) {
      saved = { ...s.chapters.find((c) => c.id === id), title: String(title || '').trim(), pages, updatedAt: now }
      if (saved.publication === 'rejected' || saved.publication === 'published') saved.publication = 'draft'
      return { ...s, chapters: s.chapters.map((c) => (c.id === id ? saved : c)) }
    }
    const number = Math.max(0, ...s.chapters.filter((c) => c.seriesId === series.id).map((c) => c.number)) + 1
    saved = {
      id: uid('c-'),
      seriesId: series.id,
      number,
      title: String(title || '').trim(),
      pages,
      publication: 'draft',
      views: 0,
      createdAt: now,
      updatedAt: now,
    }
    return { ...s, chapters: [...s.chapters, saved] }
  })
  return saved
}

export async function deleteChapter(chapterId) {
  const s = getState()
  const chapter = s.chapters.find((c) => c.id === chapterId)
  if (!chapter) return
  requireOwner(s, findSeries(s, chapter.seriesId))
  setState((st) => ({
    ...st,
    chapters: st.chapters.filter((c) => c.id !== chapterId),
    comments: st.comments.filter((c) => c.chapterId !== chapterId),
  }))
  await Promise.all((chapter.pages || []).map(deleteMedia)).catch(() => {})
}

/** Envia série (e seus capítulos em rascunho) ou um capítulo para a fila de moderação. */
export function submitForReview(kind, id) {
  setState((s) => {
    const now = Date.now()
    if (kind === 'series') {
      const series = findSeries(s, id)
      requireOwner(s, series)
      const drafts = s.chapters.filter((c) => c.seriesId === series.id && ['draft', 'rejected'].includes(c.publication))
      if (series.publication !== 'published' && !drafts.length && !s.chapters.some((c) => c.seriesId === series.id)) {
        throw new ActionError('Adicione pelo menos um capítulo antes de enviar para revisão.')
      }
      return {
        ...s,
        series: s.series.map((x) => (x.id === series.id && x.publication !== 'published' ? { ...x, publication: 'review', submittedAt: now } : x)),
        chapters: s.chapters.map((c) => (drafts.includes(c) ? { ...c, publication: 'review', submittedAt: now } : c)),
      }
    }
    const chapter = s.chapters.find((c) => c.id === id)
    const parent = findSeries(s, chapter?.seriesId)
    requireOwner(s, parent)
    if (parent.publication !== 'published') {
      throw new ActionError('Esta série ainda não foi publicada — envie a série inteira para revisão.')
    }
    return { ...s, chapters: s.chapters.map((c) => (c.id === id ? { ...c, publication: 'review', submittedAt: now } : c)) }
  })
}

/* ------------------------------------------------------------------ */
/* Moderação                                                           */
/* ------------------------------------------------------------------ */

export function moderate(kind, id, decision, note = '') {
  setState((s) => {
    const user = requireUser(s)
    if (!canModerate(user)) throw new ActionError('Apenas a moderação pode revisar conteúdo.')
    if (decision === 'reject' && !note.trim()) throw new ActionError('Explique o que precisa ser ajustado.')
    const now = Date.now()
    const status = decision === 'approve' ? 'published' : 'rejected'
    let { series, chapters } = s
    let target
    let owner

    if (kind === 'series') {
      target = findSeries(s, id)
      owner = target.creatorId
      series = series.map((x) => (x.id === id ? { ...x, publication: status, updatedAt: now } : x))
      // +number mantém a ordem dos capítulos publicados juntos.
      chapters = chapters.map((c) => (c.seriesId === id && c.publication === 'review' ? { ...c, publication: status, createdAt: status === 'published' ? now + c.number : c.createdAt } : c))
    } else {
      target = s.chapters.find((c) => c.id === id)
      const parent = findSeries(s, target.seriesId)
      owner = parent.creatorId
      chapters = chapters.map((c) => (c.id === id ? { ...c, publication: status, createdAt: status === 'published' ? now : c.createdAt } : c))
      if (status === 'published') series = series.map((x) => (x.id === parent.id ? { ...x, updatedAt: now } : x))
    }

    const label = kind === 'series' ? `"${target.title}"` : `o capítulo ${target.number}${target.title ? ` — ${target.title}` : ''}`
    const seriesId = kind === 'series' ? id : target.seriesId

    let notifications = notify(s, owner, {
      type: decision === 'approve' ? 'approved' : 'rejected',
      title: decision === 'approve' ? 'Conteúdo aprovado 🎉' : 'Ajustes solicitados',
      body: decision === 'approve' ? `A moderação publicou ${label}.` : `Sobre ${label}: ${note.trim()}`,
      href: decision === 'approve' ? `/obra/?id=${seriesId}` : `/studio/obra/?id=${seriesId}`,
    })

    // Avisa quem favoritou a série quando sai capítulo novo.
    if (decision === 'approve' && kind === 'chapter') {
      const parent = findSeries(s, target.seriesId)
      for (const [userId, list] of Object.entries(s.favorites)) {
        if (list.includes(parent.id) && userId !== owner) {
          notifications = notify({ ...s, notifications }, userId, {
            type: 'chapter',
            title: `Novo capítulo de ${parent.title}`,
            body: `O capítulo ${target.number} acabou de sair.`,
            href: `/ler/?obra=${parent.id}&cap=${target.number}`,
          })
        }
      }
    }

    return {
      ...s,
      series,
      chapters,
      notifications,
      moderationLog: [
        { id: uid('log-'), kind, targetId: id, seriesId, label: kind === 'series' ? target.title : `${findSeries(s, seriesId)?.title} · Cap. ${target.number}`, decision, note: note.trim(), moderatorId: user.id, createdAt: now },
        ...s.moderationLog,
      ].slice(0, 300),
    }
  })
}

/* ------------------------------------------------------------------ */
/* Dados                                                               */
/* ------------------------------------------------------------------ */

export async function resetDemo() {
  await clearMedia().catch(() => {})
  resetState()
}

export function exportMyData() {
  const s = getState()
  const user = requireUser(s)
  const { passwordHash, ...profile } = user
  return {
    exportedAt: new Date().toISOString(),
    profile,
    favorites: s.favorites[user.id] || [],
    history: s.history[user.id] || {},
    ratings: Object.fromEntries(Object.entries(s.ratings).filter(([, r]) => r[user.id]).map(([id, r]) => [id, r[user.id]])),
    comments: s.comments.filter((c) => c.userId === user.id),
    series: s.series.filter((x) => x.creatorId === user.id),
  }
}
