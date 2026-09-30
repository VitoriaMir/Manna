import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

/** Prefixa caminhos absolutos de /public com o basePath (necessário no GitHub Pages). */
export function asset(src) {
  if (!src || typeof src !== 'string') return src
  if (src.startsWith('/') && !src.startsWith('//') && !src.startsWith(BASE_PATH + '/')) {
    return BASE_PATH + src
  }
  return src
}

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
export function formatCompact(n) {
  return compact.format(n || 0)
}

const full = new Intl.NumberFormat('pt-BR')
export function formatNumber(n) {
  return full.format(n || 0)
}

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto', style: 'short' })
const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]
export function timeAgo(date) {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000)
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'agora'
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function uid(prefix = '') {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)
  return `${prefix}${Date.now().toString(36)}${rand}`
}

/** Hash de string determinístico (FNV-1a) — usado como semente do gerador de páginas demo. */
export function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** PRNG determinístico (mulberry32). */
export function seededRandom(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function initials(name) {
  return String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}
